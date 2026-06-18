/**
 * build-review.ts — assemble the ADL 0.3 shareable review package.
 *
 * Produces a single self-contained HTML file that bundles the core working-draft
 * spec and every profile into one explorable, annotatable document:
 *
 *   - A sticky table of contents for navigation.
 *   - An interactive "Expansion Explorer" that shows how each profile expands the
 *     core: toggling a profile adds its members and tightens core members, and the
 *     governance tier selector escalates members from MAY -> SHOULD -> MUST.
 *   - An inline annotation layer (Hypothes.is) so anyone with the link can
 *     highlight text and leave comments.
 *
 * The expansion overlay is driven by review/expansion-model.yaml (the source of
 * truth). The prose is rendered directly from versions/draft/spec.md and each
 * profiles/<name>/1.0/profile.md.
 *
 * Run:  bun run review   (writes review/adl-0.3-review.html)
 */

import { Marked } from "marked";
import { parse as parseYaml } from "yaml";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRAFT = join(ROOT, "versions", "draft");
const OUT = join(ROOT, "review", "adl-0.3-review.html");

type Heading = { depth: number; text: string; id: string };

/** Strip a leading YAML front-matter block (--- ... ---) if present. */
function stripFrontMatter(md: string): string {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md;
  return md.slice(md.indexOf("\n", end + 1) + 1);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Inline local .svg diagrams referenced as <img src="./diagrams/x.svg">. */
function inlineDiagrams(html: string): string {
  return html.replace(
    /<img[^>]*src="\.\/diagrams\/([^"]+\.svg)"[^>]*alt="([^"]*)"[^>]*>/g,
    (_m, file, alt) => {
      try {
        const svg = readFileSync(join(DRAFT, "diagrams", file), "utf8")
          .replace(/<\?xml[^>]*\?>/, "")
          .trim();
        return `<figure class="diagram" role="img" aria-label="${alt.replace(/"/g, "&quot;")}">${svg}</figure>`;
      } catch {
        return `<p class="diagram-missing">[diagram: ${file}]</p>`;
      }
    },
  );
}

/**
 * Render one Markdown document. Returns the HTML plus the list of headings (for
 * the table of contents). Heading ids are prefixed with the doc id so they stay
 * unique across the bundle (every doc has its own "## 1. Introduction").
 */
function renderDoc(docId: string, md: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(token: { tokens: unknown[]; depth: number }) {
        const text = this.parser.parseInline(token.tokens);
        const base = `${docId}-${slugify(text.replace(/<[^>]+>/g, ""))}`;
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n}`;
        headings.push({ depth: token.depth, text: text.replace(/<[^>]+>/g, ""), id });
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
      },
    },
  });
  const html = inlineDiagrams(marked.parse(stripFrontMatter(md)) as string);
  return { html, headings };
}

// ---------------------------------------------------------------------------
// Load inputs
// ---------------------------------------------------------------------------

type Member = { name: string; required?: boolean };
type Add = { name: string; requirement: "required" | "optional" | "tiered" };
type CoreChange = { name: string; to: string; note: string };
type Profile = {
  id: string;
  title: string;
  identifier: string;
  color: string;
  has_tiers: boolean;
  adds: Add[];
  core_changes: CoreChange[];
  tiers?: { id: number; name: string }[];
  tier_matrix?: Record<string, Record<string, string>>;
};
type Model = { core: { members: Member[] }; profiles: Profile[] };

const model = parseYaml(readFileSync(join(ROOT, "review", "expansion-model.yaml"), "utf8")) as Model;

const core = renderDoc("core", readFileSync(join(DRAFT, "spec.md"), "utf8"));

const profileDocs = model.profiles.map((p) => {
  const md = readFileSync(join(ROOT, "profiles", p.id, "1.0", "profile.md"), "utf8");
  return { profile: p, ...renderDoc(p.id, md) };
});

// ---------------------------------------------------------------------------
// Table of contents (top-level h2 per document)
// ---------------------------------------------------------------------------

function tocFor(docId: string, headings: Heading[]): string {
  const items = headings
    .filter((h) => h.depth === 2)
    .map((h) => `<a href="#${h.id}">${escapeHtml(h.text)}</a>`)
    .join("");
  return `<div class="toc-group" data-doc="${docId}">${items}</div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const toc = `
  <a class="toc-doc" href="#doc-overview">Overview</a>
  <a class="toc-doc" href="#doc-explorer">Expansion Explorer</a>
  <a class="toc-doc" href="#doc-core">Core Specification</a>
  ${tocFor("core", core.headings)}
  ${profileDocs
    .map(
      (d) => `
    <a class="toc-doc" href="#doc-${d.profile.id}">${escapeHtml(d.profile.title)} Profile</a>
    ${tocFor(d.profile.id, d.headings)}`,
    )
    .join("")}
`;

// ---------------------------------------------------------------------------
// Assemble HTML
// ---------------------------------------------------------------------------

const modelJson = JSON.stringify(model);

const overview = `
<section id="doc-overview" class="doc">
  <h1>ADL 0.3 &mdash; Review Package</h1>
  <p class="lead">This is a shareable, self-contained review build of the Agent Definition Language
  <strong>0.3.0 working draft</strong> together with its five profiles. Read the normative text,
  explore how profiles expand the core, and leave inline comments.</p>
  <div class="callout">
    <strong>Leave a comment:</strong> select any text and use the annotation sidebar on the right
    (powered by <a href="https://web.hypothes.is/" target="_blank" rel="noopener">Hypothes.is</a>).
    A free Hypothes.is account is needed to post; anyone can read public notes. Open the sidebar with
    the tab on the right edge of the page.
  </div>
  <div class="callout note">
    <strong>Draft status:</strong> the core spec is the unreleased <code>versions/draft</code>
    (0.3.0). All five profiles are Draft, ADL-compatible with 0.2.x. Nothing here is final.
  </div>
  <h2>How profiles control the expansion of the core</h2>
  <p>The ADL core defines a fixed set of top-level members. A <em>profile</em> never modifies the
  core &mdash; instead, declaring a profile in a document's <code>profiles</code> array
  <strong>expands</strong> it: the profile adds its own top-level members and may
  <strong>tighten</strong> existing core members (for example, making an OPTIONAL member REQUIRED).
  The governance profile goes further with <strong>conformance tiers</strong>: the same member can be
  MAY at Tier 1 and MUST at Tier 3. The next section lets you drive this interactively.</p>
</section>`;

const explorer = `
<section id="doc-explorer" class="doc">
  <h1>Expansion Explorer</h1>
  <p>Toggle profiles to see how the core document expands. Added members appear in the profile's
  colour; tightened core members are flagged. With the governance profile on, change the
  <strong>autonomy tier</strong> to watch members escalate from MAY to MUST.</p>
  <div class="explorer">
    <div class="controls">
      <div class="profile-toggles" id="profileToggles"></div>
      <div class="tier-control" id="tierControl" hidden>
        <label>Governance autonomy tier</label>
        <div class="tier-buttons" id="tierButtons"></div>
      </div>
      <div class="legend">
        <span class="badge req">MUST / required</span>
        <span class="badge should">SHOULD</span>
        <span class="badge opt">MAY / optional</span>
        <span class="badge added">+ added by profile</span>
        <span class="badge tightened">tightened</span>
      </div>
      <p class="summary" id="summary"></p>
    </div>
    <div class="member-grid" id="memberGrid"></div>
  </div>
</section>`;

const coreSection = `<section id="doc-core" class="doc">${core.html}</section>`;

const profileSections = profileDocs
  .map(
    (d) => `<section id="doc-${d.profile.id}" class="doc profile-doc" style="--accent:${d.profile.color}">
  <div class="profile-tag" style="background:${d.profile.color}">${escapeHtml(d.profile.title)} Profile &middot; ${escapeHtml(d.profile.identifier)}</div>
  ${d.html}
</section>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ADL 0.3 — Review Package</title>
<style>
:root{--accent:#7c3aed;--bg:#fff;--fg:#1a1a2e;--muted:#586069;--line:#e1e4e8;--code:#f6f8fa}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--fg);background:var(--bg)}
a{color:#5b3bd6;text-decoration:none}a:hover{text-decoration:underline}
.layout{display:grid;grid-template-columns:300px minmax(0,1fr);max-width:1280px;margin:0 auto}
nav.toc{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;padding:24px 16px 80px;border-right:1px solid var(--line);font-size:13px}
nav.toc .title{font-weight:700;font-size:15px;margin:0 0 12px}
nav.toc .toc-doc{display:block;font-weight:600;margin:14px 0 4px;color:var(--fg)}
nav.toc .toc-group{display:flex;flex-direction:column;border-left:2px solid var(--line);margin-left:4px}
nav.toc .toc-group a{padding:2px 0 2px 12px;color:var(--muted)}
nav.toc .toc-group a:hover{color:var(--accent)}
main{padding:32px 48px 120px;min-width:0}
.doc{margin-bottom:48px;padding-bottom:24px;border-bottom:1px solid var(--line)}
.doc h1{font-size:30px;margin-top:0}
.doc h2{font-size:23px;margin-top:2em;padding-top:.3em;border-top:1px solid var(--line)}
.doc h3{font-size:18px;margin-top:1.6em}
.doc h4{font-size:15px;color:var(--muted)}
.lead{font-size:18px;color:#333}
code{background:var(--code);padding:.15em .4em;border-radius:4px;font-size:.9em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:var(--code);padding:16px;border-radius:8px;overflow:auto;border:1px solid var(--line)}
pre code{background:none;padding:0}
table{border-collapse:collapse;width:100%;margin:1em 0;font-size:14px;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:7px 11px;text-align:left;vertical-align:top}
th{background:var(--code)}
blockquote{margin:1em 0;padding:.5em 1em;border-left:4px solid var(--accent);background:#faf8ff;color:#444}
.diagram{margin:1.5em 0;text-align:center}.diagram svg{max-width:100%;height:auto}
.diagram-missing{color:var(--muted);font-style:italic}
.callout{background:#f3f0ff;border:1px solid #d9ccff;border-radius:8px;padding:14px 18px;margin:18px 0}
.callout.note{background:#fff8e6;border-color:#f3e2a9}
.profile-tag{display:inline-block;color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;margin-bottom:8px}
.profile-doc{border-left:4px solid var(--accent);padding-left:20px}
/* Explorer */
.explorer{display:grid;grid-template-columns:300px 1fr;gap:24px;margin-top:16px}
@media(max-width:1100px){.explorer{grid-template-columns:1fr}.layout{grid-template-columns:1fr}nav.toc{display:none}}
.controls{position:sticky;top:16px;align-self:start}
.profile-toggles{display:flex;flex-direction:column;gap:8px}
.profile-toggles label{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-weight:600;font-size:14px}
.profile-toggles label .dot{width:12px;height:12px;border-radius:3px}
.profile-toggles input{accent-color:#5b3bd6}
.tier-control{margin-top:16px}
.tier-control label{font-weight:600;font-size:13px;display:block;margin-bottom:6px}
.tier-buttons{display:flex;gap:6px}
.tier-buttons button{flex:1;padding:8px;border:1px solid var(--line);background:#fff;border-radius:6px;cursor:pointer;font-weight:600}
.tier-buttons button.active{background:#7c3aed;color:#fff;border-color:#7c3aed}
.legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.summary{margin-top:14px;font-size:13px;color:var(--muted)}
.member-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;align-content:start}
.member{border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:13px;background:#fff;transition:.15s}
.member.hidden{display:none}
.member .mname{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:600;word-break:break-all}
.member .mmeta{margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.member.added{border-left:4px solid var(--mc)}
.member .src{font-size:11px;color:var(--muted)}
.member .note{font-size:11px;color:#7a5a00;margin-top:6px}
.badge{font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:999px;letter-spacing:.02em;white-space:nowrap}
.badge.req{background:#ffe0e0;color:#a30000}
.badge.should{background:#fff0cc;color:#8a6100}
.badge.opt{background:#e6f0ff;color:#0b4a9e}
.badge.added{background:#ece3ff;color:#5b2bb8}
.badge.tightened{background:#fde8cf;color:#9a4d00}
</style>
</head>
<body>
<div class="layout">
<nav class="toc">
  <p class="title">ADL 0.3 Review</p>
  ${toc}
</nav>
<main>
${overview}
${explorer}
${coreSection}
${profileSections}
</main>
</div>

<script id="model" type="application/json">${modelJson}</script>
<script>
const MODEL = JSON.parse(document.getElementById('model').textContent);
const state = { active: new Set(), tier: 1 };

function badge(level){
  const map = { must:['req','MUST'], required:['req','required'], should:['should','SHOULD'], may:['opt','MAY'], optional:['opt','optional'] };
  const [cls,label] = map[level] || ['opt', level];
  return '<span class="badge '+cls+'">'+label+'</span>';
}

function render(){
  const grid = document.getElementById('memberGrid');
  const gov = MODEL.profiles.find(p=>p.id==='governance');
  document.getElementById('tierControl').hidden = !state.active.has('governance');

  let cards = [];
  // Core members, with any profile tightening applied.
  for(const m of MODEL.core.members){
    let level = m.required ? 'required' : 'optional';
    let note = '', tightened = false;
    for(const p of MODEL.profiles){
      if(!state.active.has(p.id)) continue;
      const ch = (p.core_changes||[]).find(c=>c.name===m.name);
      if(ch){ tightened = true; note = ch.note; if(ch.to==='required') level='required'; }
    }
    // Governance tier can also raise core 'lifecycle' etc. via tier_matrix.
    if(state.active.has('governance') && gov.tier_matrix && gov.tier_matrix[m.name]){
      level = gov.tier_matrix[m.name][state.tier];
    }
    cards.push({ name:m.name, level, src:'core', tightened, note, color:null });
  }
  // Added members, per active profile.
  for(const p of MODEL.profiles){
    if(!state.active.has(p.id)) continue;
    for(const a of p.adds){
      let level = a.requirement;
      if(level==='tiered' && p.tier_matrix && p.tier_matrix[a.name]){
        level = p.tier_matrix[a.name][state.tier];
      }
      cards.push({ name:a.name, level, src:p.title, tightened:false, note:'', color:p.color, added:true });
    }
  }

  grid.innerHTML = cards.map(c=>{
    const style = c.color ? 'style="--mc:'+c.color+'"' : '';
    return '<div class="member '+(c.added?'added':'')+'" '+style+'>'
      + '<div class="mname">'+c.name+'</div>'
      + '<div class="mmeta">'+badge(c.level)
      + (c.added?' <span class="badge added">+ '+c.src+'</span>':'')
      + (c.tightened?' <span class="badge tightened">tightened</span>':'')
      + '</div>'
      + (c.added?'':'<div class="src">core member</div>')
      + (c.note?'<div class="note">'+c.note+'</div>':'')
      + '</div>';
  }).join('');

  const required = cards.filter(c=>c.level==='required'||c.level==='must').length;
  const names = [...state.active].map(id=>MODEL.profiles.find(p=>p.id===id).title);
  document.getElementById('summary').textContent =
    cards.length+' members in effect, '+required+' required'
    + (names.length? ' — profiles: '+names.join(', ')
       + (state.active.has('governance')? ' (Tier '+state.tier+')':'') : ' — core only');
}

// Build controls
const toggles = document.getElementById('profileToggles');
for(const p of MODEL.profiles){
  const l = document.createElement('label');
  l.innerHTML = '<span class="dot" style="background:'+p.color+'"></span>'
    + '<input type="checkbox" value="'+p.id+'"> '+p.title;
  l.querySelector('input').addEventListener('change', e=>{
    e.target.checked ? state.active.add(p.id) : state.active.delete(p.id);
    render();
  });
  toggles.appendChild(l);
}
const tierButtons = document.getElementById('tierButtons');
[1,2,3].forEach(t=>{
  const b=document.createElement('button');
  b.textContent='Tier '+t; if(t===1)b.classList.add('active');
  b.addEventListener('click',()=>{
    state.tier=t;
    [...tierButtons.children].forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); render();
  });
  tierButtons.appendChild(b);
});
render();
</script>

<!-- Inline annotation + commenting layer -->
<script src="https://hypothes.is/embed.js" async></script>
</body>
</html>`;

writeFileSync(OUT, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`Wrote ${OUT} (${kb} KB)`);
console.log(`  core spec + ${profileDocs.length} profiles, ${core.headings.length} core headings`);
