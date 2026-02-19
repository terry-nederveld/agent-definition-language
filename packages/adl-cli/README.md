# ADL CLI

The official command-line tool for the [Agent Definition Language (ADL)](https://adl-spec.org). Validate agent definitions against the spec, convert them to A2A Agent Cards or MCP configurations, and scaffold new documents from templates.

## Quick start

```bash
npx @adl-spec/cli init                    # scaffold a new agent definition
npx @adl-spec/cli validate agent.adl.json # validate it against the schema
```

Or install globally:

```bash
npm install -g @adl-spec/cli
adl validate agent.adl.yaml
```

> **Note:** The CLI requires [Bun](https://bun.sh/) (>= 1.0.0) as its runtime.

## Commands

### `adl validate <files...>`

Validate one or more ADL documents against the spec schema. Returns a non-zero exit code if any document is invalid — useful for CI pipelines and pre-commit hooks.

```bash
adl validate agent.adl.yaml
adl validate agents/*.yaml
```

### `adl convert <file> --to <format>`

Generate an [A2A Agent Card](https://google.github.io/A2A/) or [MCP](https://modelcontextprotocol.io/) configuration from an ADL document. One source of truth, multiple output formats.

```bash
adl convert agent.adl.yaml --to a2a
adl convert agent.adl.yaml --to mcp --output mcp-config.json
```

### `adl init`

Scaffold a new ADL document from a built-in template. Choose `minimal` for the basics, `full` for every field, or `governance` for compliance-ready definitions.

```bash
adl init
adl init --template governance --output my-agent.adl.json
```

## Learn more

- [ADL Specification](https://adl-spec.org/specification)
- [Governance Profile](https://adl-spec.org/profiles/governance/overview)
- [GitHub](https://github.com/Ironstead-Group/agent-definition-language)

## License

[Apache-2.0](https://github.com/Ironstead-Group/agent-definition-language/blob/main/LICENSE)
