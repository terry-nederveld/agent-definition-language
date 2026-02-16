---
id: interoperability
title: 15. Interoperability
sidebar_position: 15
description: Generate A2A Agent Cards, MCP configurations, and integrate with OpenAPI from ADL documents.
keywords: [adl, interoperability, a2a, mcp, openapi, conversion]
---

# Interoperability

ADL is designed to interoperate with other agent and API specifications. Implementations **SHOULD** support generating configurations for common formats.

## 15.1 A2A Agent Card Generation

Implementations **SHOULD** support generating A2A Agent Cards from ADL:

| ADL Member | A2A Agent Card Member |
|------------|----------------------|
| name | name |
| description | description |
| version | version |
| tools | skills |
| cryptographic_identity.did | id |
| security.authentication | authentication |

## 15.2 MCP Server Configuration

Implementations **SHOULD** support generating MCP server configurations:

| ADL Member | MCP Configuration |
|------------|------------------|
| name | serverInfo.name |
| description | serverInfo.description |
| version | serverInfo.version |
| tools | tools |
| resources | resources |
| prompts | prompts |

## 15.3 OpenAPI Integration

Tools that invoke HTTP APIs **MAY** reference OpenAPI specs. The tool `annotations` object **MAY** contain `openapi_ref` (URI) and `operation_id`.

```json title="Tool with OpenAPI reference"
{
  "name": "get_user",
  "description": "Retrieve user information",
  "annotations": {
    "openapi_ref": "https://api.example.com/openapi.json",
    "operation_id": "getUserById"
  }
}
```

:::tip Leveraging Existing APIs
Use OpenAPI references to link ADL tools to existing API documentation. This enables automatic parameter validation and documentation generation.
:::
