---
id: minimal
title: Minimal Example
sidebar_position: 2
description: The simplest valid ADL document with only the four required fields.
keywords: [adl, minimal, example, required fields]
---

# Minimal ADL Example

This is the simplest valid ADL document, containing only the required fields.

:::info Validation
This document validates against the [ADL JSON Schema](/spec/appendix-schema).
:::

## Document

```json title="hello-agent.adl.json"
{
  "adl": "0.1.0",
  "name": "Hello Agent",
  "description": "A simple greeting agent.",
  "version": "1.0.0"
}
```

## Required Fields

| Field | Description |
|-------|-------------|
| `adl` | ADL specification version (must be semantic version format) |
| `name` | Human-readable name for the agent |
| `description` | Description of the agent's purpose and capabilities |
| `version` | Agent's version (must be semantic version format) |

## Notes

:::note Key Points
- This document declares conformance to ADL version 0.1.0
- The agent has no tools, resources, prompts, or permissions defined
- The runtime will determine the model to use
- All fields use `snake_case` naming convention
:::

## Next Steps

Ready to add more functionality? See:
- [Agent with Tools](/examples/with-tools) - Add tool definitions
- [Production Agent](/examples/production) - Full-featured example
