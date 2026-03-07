---
id: implementations
title: Implementations
sidebar_position: 102
description: Tools, libraries, and platforms that implement or consume ADL documents.
keywords: [adl, implementations, agentic ai tools, agent validator, agent linter, cli, vscode, ai agent sdk, agent framework]
---

# Implementations

Tools, libraries, and integrations for working with ADL documents. Lint your agents like code.

## Official Tools

### [@adl-spec/cli](https://www.npmjs.com/package/@adl-spec/cli)

The official command-line tool for ADL. Validate agent definitions against the spec, convert them to A2A Agent Cards or MCP configurations, and scaffold new documents from templates.

- **Type:** Validator / Converter / Scaffolder
- **ADL Version:** 0.1.0+
- **License:** Apache-2.0
- **Language:** TypeScript (Bun runtime)
- **Source:** [packages/adl-cli](https://github.com/Ironstead-Group/agent-definition-language/tree/main/packages/adl-cli)

```bash
# Validate an agent definition
npx @adl-spec/cli validate agent.adl.yaml

# Convert to A2A Agent Card
npx @adl-spec/cli convert agent.adl.yaml --to a2a

# Scaffold a governance-ready definition
npx @adl-spec/cli init --template governance
```

### [ADL JSON Schema](https://adl-spec.org/0.1/schema.json)

The official JSON Schema for ADL 0.1.0. Use it for validation in any language with a JSON Schema library, or wire it into your editor for autocomplete and inline diagnostics.

- **Type:** Schema
- **ADL Version:** 0.1.0
- **License:** Apache-2.0
- **Source:** [versions/0.1.0/schema.json](https://github.com/Ironstead-Group/agent-definition-language/blob/main/versions/0.1.0/schema.json)

## IDE Support

### VS Code — JSON Schema Validation

Get autocomplete, inline errors, and hover docs for ADL documents in VS Code with zero extensions. Add this to your workspace `.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "url": "https://adl-spec.org/0.1/schema.json",
      "fileMatch": ["*.adl.json"]
    }
  ],
  "yaml.schemas": {
    "https://adl-spec.org/0.1/schema.json": "*.adl.yaml"
  }
}
```

- **Type:** IDE Integration
- **ADL Version:** 0.1.0
- **Prerequisites:** For YAML support, install the [YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

### JetBrains IDEs — JSON Schema Validation

IntelliJ IDEA, WebStorm, and other JetBrains IDEs support JSON Schema mapping natively. Go to **Settings > Languages & Frameworks > Schemas and DTDs > JSON Schema Mappings**, add a new mapping with the schema URL `https://adl-spec.org/0.1/schema.json`, and map it to your `*.adl.json` files.

- **Type:** IDE Integration
- **ADL Version:** 0.1.0

## Adding Your Implementation

Built something with ADL? We want to list it here.

### Requirements

1. Supports ADL 0.1.0 or later
2. Publicly available (open source preferred)
3. Includes documentation for users
4. Actively maintained

### How to Submit

Open a [pull request](https://github.com/Ironstead-Group/agent-definition-language/pulls) adding your implementation to this page. Use this template:

```markdown
### [Tool Name](https://github.com/org/repo)

Brief description of what the tool does.

- **Type:** Validator / Converter / IDE Extension / Runtime / Other
- **ADL Version:** 0.1.0+
- **License:** MIT / Apache-2.0 / etc.
- **Language:** TypeScript / Python / Go / etc.
```
