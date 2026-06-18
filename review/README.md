# ADL 0.3 review package

A single, self-contained HTML build of the **ADL 0.3.0 working draft** plus all
five profiles, made for sharing with reviewers who want to **explore** the spec
and **leave inline comments**.

## What's in it

`adl-0.3-review.html` bundles:

- **The core specification** (`versions/draft/spec.md`), with diagrams inlined.
- **All five profiles** (governance, portfolio, registry, financial, healthcare),
  rendered from each `profiles/<name>/1.0/profile.md`.
- **An Expansion Explorer** — an interactive panel that shows how profiles
  control the expansion of the core. Toggle a profile and its members are added
  to the core; core members it tightens are flagged; the governance tier selector
  escalates members from MAY -> SHOULD -> MUST.
- **An annotation layer** — [Hypothes.is](https://web.hypothes.is/) is embedded,
  so anyone with the file can highlight text and leave comments. Open the sidebar
  with the tab on the right edge of the page. Posting needs a free Hypothes.is
  account; reading public notes does not.

The file is self-contained apart from the Hypothes.is embed script (loaded from
`hypothes.is`), which is what makes commenting work.

## Sharing it

The HTML is a plain file. To share for review you can:

- Send the file directly (it opens in any browser), or
- Host it anywhere static (GitHub Pages, S3, an internal server) and share the
  link. Hypothes.is annotations are keyed to the page URL, so a stable hosted URL
  keeps everyone's comments in one place.

To scope comments to a private review group, create a Hypothes.is group and share
its link; otherwise notes default to the public layer.

## Regenerating

The HTML is generated — do not edit it by hand. From the repo root:

```bash
bun install        # first time only (installs marked)
bun run review     # writes review/adl-0.3-review.html
```

Sources:

- Prose comes straight from `versions/draft/spec.md` and the profile specs.
- The Expansion Explorer is driven by [`expansion-model.yaml`](./expansion-model.yaml),
  the source of truth for which members each profile adds, which core members it
  tightens, and the governance tier matrix. Keep it in sync when the core schema
  or a profile's required members change.
- Generator: [`scripts/build-review.ts`](../scripts/build-review.ts).
