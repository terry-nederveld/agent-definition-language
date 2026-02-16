---
id: capabilities
title: 8. Capabilities
sidebar_position: 8
---

# Capabilities

## 8.1 tools

Array of tool objects (functions the agent can invoke). **OPTIONAL.** Each tool **MUST** contain `name` (string, REQUIRED) and `description` (string, REQUIRED). Each tool **MAY** contain: `parameters` (JSON Schema), `returns` (JSON Schema), `examples`, `requires_confirmation` (bool), `idempotent` (bool), `read_only` (bool), `annotations`. Tool names **MUST** be unique and match `^[a-z][a-z0-9_]*$`. The `parameters` and `returns` objects, when present, **MUST** be valid JSON Schema.

### Example Tool Definition

```json
{
  "name": "search_papers",
  "description": "Search for academic papers",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "limit": { "type": "integer", "default": 10 }
    },
    "required": ["query"]
  },
  "read_only": true
}
```

## 8.2 resources

Array of resource objects (data sources the agent can access). **OPTIONAL.** Each resource **MUST** contain `name` (string, REQUIRED) and `type` (string, REQUIRED). `type` **MUST** be one of: `vector_store`, `knowledge_base`, `file`, `api`, `database`. Each resource **MAY** contain: `description`, `uri`, `mime_types`, `schema`, `annotations`. Resource names **MUST** be unique.

### Example Resource Definition

```json
{
  "name": "paper_index",
  "type": "vector_store",
  "description": "Vector index of paper embeddings",
  "uri": "s3://research-data/papers/"
}
```

## 8.3 prompts

Array of prompt objects (reusable prompt templates). **OPTIONAL.** Each prompt **MUST** contain `name` (string, REQUIRED) and `template` (string, REQUIRED). Each prompt **MAY** contain `description`, `arguments` (JSON Schema). Template arguments use `{{argument_name}}`. Prompt names **MUST** be unique.

### Example Prompt Definition

```json
{
  "name": "summarize",
  "description": "Summarize a paper",
  "template": "Summarize the following paper:\n\n{{content}}"
}
```
