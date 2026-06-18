# ADL review package

A reusable generator that turns a core spec version plus its profiles into a
single, self-contained HTML file for sharing with reviewers who want to
**explore** the spec and **leave inline comments**.

## Generating

From the repo root:

```bash
bun install                 # first time only (installs marked)
bun run review              # builds the current draft -> review/adl-<version>-review.html
bun run review 0.2.0        # build a specific version instead
```

It auto-discovers everything from the repo manifests, so a **new spec dump just
works** — drop in a new draft version or a new profile and re-run:

- **Core version** — `versions/manifest.yaml` `next` (override with the argument above).
- **Core members** — read from that version's `schema.json` (top-level properties + `required`).
- **Profiles** — every entry in `profiles/manifest.yaml`, prose from each
  `profiles/<id>/<version>/profile.md`, added members from the profile's
  "additional-members" section.
- **Diagrams** — local SVGs referenced by the spec are inlined.

## What's in the output

- The **core specification** and **all profiles** in one navigable file with a
  sticky table of contents.
- An **Expansion Explorer** showing how profiles control the expansion of the
  core: toggle a profile and its members are added; core members it tightens are
  flagged; a tier-conditional profile gets a tier selector that escalates members
  from MAY -> SHOULD -> MUST.
- An **annotation layer** — [Hypothes.is](https://web.hypothes.is/) is embedded,
  so anyone with the file can highlight text and leave comments (sidebar tab on
  the right edge; posting needs a free account). This embed script is the only
  thing loaded at view time; the rest of the file is self-contained.

## Enriching the explorer for new profiles

The explorer can read everything it needs *except* a member's requirement level
(required / optional / tier-conditional) and which core members a profile tightens
— that detail lives in profile prose, not in machine-readable form. Supply it in
[`expansion-model.yaml`](./expansion-model.yaml), keyed by profile id.

A profile **with no entry still appears** in the explorer; its members just show a
neutral "see profile" badge until you enrich it. So a new dump is never blocked on
hand-authoring — add tier detail only when you want it. Keep `expansion-model.yaml`
in sync when a profile's required members or tier rules change.

## Sharing

The HTML is a plain file: send it directly, or host it anywhere static (GitHub
Pages, S3, an internal server) and share the link. Hypothes.is annotations are
keyed to the page URL, so a stable hosted URL keeps everyone's comments together;
for a private review, point reviewers at a Hypothes.is group.

Generator: [`scripts/build-review.ts`](../scripts/build-review.ts).
