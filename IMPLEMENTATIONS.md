# ADL Implementations

Tools, libraries, and platforms that implement or consume the Agent Definition Language (ADL) specification. For full details and usage examples, see [adl-spec.org/implementations](https://adl-spec.org/implementations).

## How to add an implementation

Open a pull request that adds an entry below. Include:

- **Name** — Project or product name.
- **Type** — Validator, parser, code generator, runtime, SDK, etc.
- **ADL version** — Spec version supported (e.g., `0.1.0`).
- **Link** — URL to repo, docs, or product page.
- **License** — If open source (e.g., Apache-2.0, MIT).
- **Description** — One sentence.

## Official Tools

| Name | Type | Description | Link |
|------|------|-------------|------|
| @adl-spec/cli | Validator / Converter | CLI for validating, converting, and scaffolding ADL documents. | [npm](https://www.npmjs.com/package/@adl-spec/cli) · [source](packages/adl-cli/) |
| ADL JSON Schema | Schema | JSON Schema for ADL 0.1.0 — use in any editor or validation library. | [schema.json](https://adl-spec.org/0.1/schema.json) · [source](versions/0.1.0/schema.json) |

## IDE Support

| Editor | How | Prerequisites |
|--------|-----|---------------|
| VS Code (JSON) | Add schema mapping to `.vscode/settings.json` | None |
| VS Code (YAML) | Add schema mapping to `.vscode/settings.json` | [YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) |
| JetBrains IDEs | Settings > JSON Schema Mappings | None |

## Parsers / SDKs

*Be the first — [open a PR](https://github.com/Ironstead-Group/agent-definition-language/pulls).*

## Runtimes / Platforms

*Be the first — [open a PR](https://github.com/Ironstead-Group/agent-definition-language/pulls).*

---

*If you implement ADL, we encourage you to open a PR to be listed here.*
