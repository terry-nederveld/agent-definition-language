/**
 * build-fields.ts — export every ADL field to a spreadsheet (data dictionary).
 *
 * Produces review/adl-<version>-fields.xlsx: one combined sheet, one row per
 * field across the core spec and every profile, with columns
 *   Field | Source | Type | Required | Allowed values | Default | Description | Section
 *
 * Sources of truth (same auto-discovery as build-review.ts):
 *   - Core version from versions/manifest.yaml `next` (override: `bun run fields <id>`).
 *   - Fields walked from JSON Schema where present (core, governance, portfolio,
 *     registry) — full nested paths, types, enums, defaults, required.
 *   - Prose-only profiles (financial, healthcare: schema null) are parsed from
 *     their profile.md member tables, heading-addressed for dotted paths.
 *   - Section numbers from spec/profile headings; profile requirement levels from
 *     review/expansion-model.yaml when present.
 *
 * Reusable: a new draft version or profile is picked up on re-run, no code change.
 *
 * Run:  bun run fields [versionId]
 */

import ExcelJS from "exceljs";
import { parse as parseYaml } from "yaml";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

type Row = {
  field: string;
  source: string;
  type: string;
  required: string;
  allowed: string;
  default: string;
  description: string;
  section: string;
};

// ---------------------------------------------------------------------------
// Discovery (mirrors build-review.ts)
// ---------------------------------------------------------------------------

const versionsManifest = parseYaml(readFileSync(join(ROOT, "versions", "manifest.yaml"), "utf8"));
const versionId: string = process.argv[2] || versionsManifest.next;
const versionEntry = (versionsManifest.versions || []).find((v: any) => v.id === versionId);
if (!versionEntry) throw new Error(`version "${versionId}" not found in versions/manifest.yaml`);
const versionLabel: string = versionEntry.label || versionId;
const versionNumber = (versionLabel.match(/\d+\.\d+(\.\d+)?/) || [versionId])[0];
const versionDir = join(ROOT, "versions", versionId);

const overrides: Record<string, any> = existsSync(join(ROOT, "review", "expansion-model.yaml"))
  ? parseYaml(readFileSync(join(ROOT, "review", "expansion-model.yaml"), "utf8")).profiles ?? {}
  : {};
const profilesManifest = parseYaml(readFileSync(join(ROOT, "profiles", "manifest.yaml"), "utf8"));

// Map a member name to its spec section number, from numbered Markdown headings
// like "### 5.6 Lifecycle" or "### 2.1 financial_data_handling".
function sectionMap(md: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of md.split("\n")) {
    const m = line.match(/^#{2,4}\s+(\d+(?:\.\d+)*)\.?\s+(.+?)\s*$/);
    if (!m) continue;
    const key = m[2].toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!map.has(key)) map.set(key, m[1]);
  }
  return map;
}
const sectionKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");

// ---------------------------------------------------------------------------
// JSON Schema walk
// ---------------------------------------------------------------------------

function typeOf(s: any): string {
  if (!s) return "";
  if (s.$ref) return "object";
  if (s.oneOf || s.anyOf) {
    const parts = (s.oneOf || s.anyOf).map((x: any) => typeOf(x)).filter(Boolean);
    return [...new Set(parts)].join(" | ") || "oneOf";
  }
  if (s.type === "array") {
    const it = s.items ? (s.items.properties ? "object" : typeOf(s.items)) : "";
    return it ? `array<${it}>` : "array";
  }
  if (s.enum && !s.type) return "enum";
  return s.type || "object";
}

function allowedOf(s: any): string {
  if (s?.enum) return s.enum.join(", ");
  if (s?.type === "array" && s.items?.enum) return s.items.enum.join(", ");
  return "";
}

/** Recursively flatten a schema's properties into rows. */
function walkSchema(
  node: any,
  prefix: string,
  source: string,
  topSection: (top: string) => string,
  topMember: string,
  conditional: Set<string>,
  out: Row[],
  skip: (name: string) => boolean = () => false,
  depth = 0,
) {
  if (!node?.properties || depth > 6) return;
  const req = new Set<string>(node.required || []);
  for (const [name, sub] of Object.entries<any>(node.properties)) {
    if (name === "$schema" || name === "extensions") continue;
    if (depth === 0 && skip(name)) continue;
    const top = depth === 0 ? name : topMember;
    const required = req.has(name) ? "REQUIRED" : conditional.has(name) ? "CONDITIONAL" : "OPTIONAL";
    out.push({
      field: prefix + name,
      source,
      type: typeOf(sub),
      required,
      allowed: allowedOf(sub),
      default: sub.default !== undefined ? String(sub.default) : "",
      description: (sub.description || "").replace(/\s+/g, " ").trim(),
      section: topSection(top),
    });
    if (sub.type === "object" && sub.properties)
      walkSchema(sub, prefix + name + ".", source, topSection, top, conditional, out, skip, depth + 1);
    else if (sub.type === "array" && sub.items?.properties)
      walkSchema(sub.items, prefix + name + "[].", source, topSection, top, conditional, out, skip, depth + 1);
  }
}

// ---------------------------------------------------------------------------
// Prose member-table parser (profiles with schema: null)
// ---------------------------------------------------------------------------

function parseProseProfile(md: string, source: string, reqOverride: Record<string, string>): Row[] {
  const out: Row[] = [];
  const lines = md.split("\n");
  // Slice the "Additional Members" section.
  let start = lines.findIndex((l) => /^##\s+\d*\.?\s*Additional Members/i.test(l));
  if (start === -1) return out;
  let end = lines.findIndex((l, i) => i > start && /^##\s+\d/.test(l));
  if (end === -1) end = lines.length;
  const body = lines.slice(start, end);

  let top = "", topSection = "", sub: string | null = null;
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+([\d.]+)\s+(\S+)/))) {
      top = m[2];
      topSection = m[1];
      sub = null;
      out.push({
        field: top, source, type: "object",
        required: reqOverride[top] || "", allowed: "", default: "",
        description: "", section: topSection,
      });
      continue;
    }
    if ((m = line.match(/^####\s+(\S+)/))) {
      sub = m[1];
      continue;
    }
    // Table: header | separator | rows
    if (line.startsWith("|") && body[i + 1]?.match(/^\|[\s:-]+\|/)) {
      const header = splitRow(line).map((h) => h.toLowerCase());
      const ci = {
        type: header.findIndex((h) => h.includes("type")),
        req: header.findIndex((h) => h.includes("required")),
        desc: header.findIndex((h) => h.includes("description")),
      };
      i += 2;
      for (; i < body.length && body[i].startsWith("|"); i++) {
        const cells = splitRow(body[i]);
        const name = cells[0];
        if (!name) continue;
        const path = sub ? `${top}.${sub}.${name}` : `${top}.${name}`;
        const desc = ci.desc >= 0 ? (cells[ci.desc] || "") : "";
        out.push({
          field: path, source,
          type: ci.type >= 0 ? cleanType(cells[ci.type]) : "",
          required: ci.req >= 0 ? normReq(cells[ci.req]) : "",
          allowed: enumsFrom(desc),
          default: "",
          description: desc.replace(/`/g, ""),
          section: topSection,
        });
      }
      i--; // for-loop will re-increment
    }
  }
  return out;
}

const splitRow = (l: string) => l.split("|").slice(1, -1).map((c) => c.trim());
const cleanType = (t: string) => t.replace(/bool\b/, "boolean").trim();
const normReq = (r: string) => {
  const u = r.toUpperCase();
  if (u.includes("REQUIRED")) return u.includes("(") ? "CONDITIONAL" : "REQUIRED";
  if (u.includes("OPTIONAL")) return "OPTIONAL";
  return r.trim();
};
// Conservative enum extraction from a prose description (>=2 backticked tokens in a list).
function enumsFrom(desc: string): string {
  if (/e\.g\.|for example|such as/i.test(desc)) return ""; // illustrative, not a closed set
  const codes = desc.match(/`[^`]+`/g);
  if (codes && codes.length >= 2 && /(,| or )/.test(desc)) return codes.map((c) => c.replace(/`/g, "")).join(", ");
  return "";
}

// ---------------------------------------------------------------------------
// Build rows
// ---------------------------------------------------------------------------

const rows: Row[] = [];

// Core
const coreSchema = JSON.parse(readFileSync(join(versionDir, "schema.json"), "utf8"));
const coreSections = sectionMap(readFileSync(join(versionDir, "spec.md"), "utf8"));
const coreProps = new Set(Object.keys(coreSchema.properties || {}));
walkSchema(coreSchema, "", "Core", (top) => coreSections.get(sectionKey(top)) || "", "", new Set(), rows);

// Profiles
for (const p of profilesManifest.profiles || []) {
  const source = p.id.charAt(0).toUpperCase() + p.id.slice(1);
  const ov = overrides[p.id] || {};
  // member -> requirement label from the override (when curated)
  const reqOverride: Record<string, string> = {};
  for (const [name, level] of Object.entries<any>(ov.adds || {}))
    reqOverride[name] = level === "required" ? "REQUIRED" : level === "tiered" ? "CONDITIONAL" : "OPTIONAL";
  // member -> section from the manifest's additional-members subsections
  const am = (p.sections || []).find((s: any) => s.id === "additional-members");
  const secByMember = new Map<string, string>();
  for (const ss of am?.subsections || []) secByMember.set(String(ss.title).split(/\s+/)[0], ss.number || "");

  const schemaPath = join(ROOT, "profiles", p.id, p.version, "schema.json");
  if (existsSync(schemaPath)) {
    const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
    const conditional = new Set<string>(schema.then?.required || []);
    walkSchema(
      schema, "", source,
      (top) => secByMember.get(top) || "",
      "", conditional, rows,
      (name) => coreProps.has(name) || name === "profiles", // only profile-added members
    );
  } else {
    const md = readFileSync(join(ROOT, "profiles", p.id, p.version, "profile.md"), "utf8");
    rows.push(...parseProseProfile(md, source, reqOverride));
  }
}

// ---------------------------------------------------------------------------
// Write workbook
// ---------------------------------------------------------------------------

const SOURCE_COLORS: Record<string, string> = {
  Core: "FF1A1A2E", Governance: "FF7C3AED", Portfolio: "FF0891B2",
  Registry: "FFCA8A04", Financial: "FF16A34A", Healthcare: "FFDC2626",
};
const REQ_FILL: Record<string, string> = {
  REQUIRED: "FFFFE0E0", CONDITIONAL: "FFFFF0CC", OPTIONAL: "FFEAF1FB",
};

const wb = new ExcelJS.Workbook();
wb.creator = "ADL build-fields";
wb.created = new Date();
const ws = wb.addWorksheet("ADL Fields", { views: [{ state: "frozen", ySplit: 1 }] });

ws.columns = [
  { header: "Field", key: "field", width: 42 },
  { header: "Source", key: "source", width: 13 },
  { header: "Type", key: "type", width: 16 },
  { header: "Required", key: "required", width: 13 },
  { header: "Allowed values", key: "allowed", width: 34 },
  { header: "Default", key: "default", width: 12 },
  { header: "Description", key: "description", width: 64 },
  { header: "Section", key: "section", width: 9 },
];

const head = ws.getRow(1);
head.font = { bold: true, color: { argb: "FFFFFFFF" } };
head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A2E" } };
head.alignment = { vertical: "middle" };
head.height = 20;

for (const r of rows) {
  const row = ws.addRow(r);
  row.getCell("field").font = { name: "Consolas", color: { argb: "FF1A1A2E" } };
  const sc = SOURCE_COLORS[r.source];
  if (sc) row.getCell("source").font = { color: { argb: sc }, bold: true };
  const rf = REQ_FILL[r.required];
  if (rf) row.getCell("required").fill = { type: "pattern", pattern: "solid", fgColor: { argb: rf } };
  row.getCell("description").alignment = { wrapText: true, vertical: "top" };
  row.getCell("allowed").alignment = { wrapText: true, vertical: "top" };
}

ws.autoFilter = { from: "A1", to: "H1" };
// A reviewer note on the header so people know they can comment in-cell.
ws.getCell("A1").note = {
  texts: [{ text: "Right-click any cell -> New Comment to leave review notes. Filter/sort via the header arrows." }],
};

const outFile = join(ROOT, "review", `adl-${versionNumber}-fields.xlsx`);
await wb.xlsx.writeFile(outFile);

const bySource = rows.reduce<Record<string, number>>((a, r) => ((a[r.source] = (a[r.source] || 0) + 1), a), {});
console.log(`Wrote ${outFile}`);
console.log(`  ${rows.length} fields — ${Object.entries(bySource).map(([s, n]) => `${s}:${n}`).join(", ")}`);
