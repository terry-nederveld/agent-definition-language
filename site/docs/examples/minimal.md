---
id: minimal
title: Minimal Example
sidebar_position: 2
---

# Minimal ADL Example

This is the simplest valid ADL document, containing only the required fields.

## Document

```json
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

- This document declares conformance to ADL version 0.1.0
- The agent has no tools, resources, prompts, or permissions defined
- The runtime will determine the model to use
- All fields use `snake_case` naming convention
