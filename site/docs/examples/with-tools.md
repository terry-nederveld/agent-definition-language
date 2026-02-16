---
id: with-tools
title: Agent with Tools
sidebar_position: 3
description: A calculator agent demonstrating ADL tool definitions with parameters and return types.
keywords: [adl, tools, example, function calling, calculator]
---

# Agent with Tools Example

This example demonstrates an agent with tool definitions - a calculator that can perform math operations.

:::tip Tool Design
Tools should be atomic, well-documented, and have clear parameter schemas. Mark read-only tools appropriately to enable safer execution.
:::

## Document

```json title="calculator.adl.json"
{
  "adl": "0.1.0",
  "name": "Calculator",
  "description": "A calculator agent that performs math operations.",
  "version": "0.1.0",
  "model": {
    "capabilities": ["function_calling"]
  },
  "tools": [
    {
      "name": "add",
      "description": "Add two numbers",
      "parameters": {
        "type": "object",
        "properties": {
          "a": { "type": "number" },
          "b": { "type": "number" }
        },
        "required": ["a", "b"]
      },
      "returns": {
        "type": "number"
      },
      "read_only": true,
      "idempotent": true
    },
    {
      "name": "multiply",
      "description": "Multiply two numbers",
      "parameters": {
        "type": "object",
        "properties": {
          "a": { "type": "number" },
          "b": { "type": "number" }
        },
        "required": ["a", "b"]
      },
      "returns": {
        "type": "number"
      },
      "read_only": true,
      "idempotent": true
    }
  ],
  "metadata": {
    "license": "MIT",
    "tags": ["calculator", "math"]
  }
}
```

## Key Features

### Model Configuration

```json
"model": {
  "capabilities": ["function_calling"]
}
```

This declares that the agent requires a model with function calling capability.

### Tool Definitions

Each tool includes:

| Field | Purpose |
|-------|---------|
| `name` | Unique identifier for the tool (must match `^[a-z][a-z0-9_]*$`) |
| `description` | Human-readable description of what the tool does |
| `parameters` | JSON Schema defining the input parameters |
| `returns` | JSON Schema defining the return value |
| `read_only` | Indicates the tool doesn't modify state |
| `idempotent` | Indicates the tool can be safely retried |

### Metadata

```json
"metadata": {
  "license": "MIT",
  "tags": ["calculator", "math"]
}
```

Provides additional context about the agent for discovery and licensing.

## Notes

:::note Implementation Guidance
- Tool names must be unique within the document
- The `parameters` and `returns` fields use JSON Schema
- `read_only` tools are generally safer and can be executed without confirmation
- `idempotent` tools can be safely retried on failure
:::

## Next Steps

Ready to build a production-ready agent? See [Production Agent](/examples/production) for a complete example with identity, permissions, security, and more.
