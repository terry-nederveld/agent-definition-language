---
id: production
title: Production Agent
sidebar_position: 4
description: A complete production-ready ADL document with identity, permissions, security, and all optional features.
keywords: [adl, production, example, security, permissions, complete]
---

# Production Agent Example

This example demonstrates a full production-style agent with identity, model configuration, tools, resources, prompts, permissions, security, runtime settings, and metadata.

:::info Complete Reference
This example uses all major ADL features. Use it as a reference when building production agents.
:::

## Document

```json title="research-assistant.adl.json"
{
  "$schema": "https://adl-spec.org/0.1/schema.json",
  "adl": "0.1.0",
  "name": "Research Assistant",
  "description": "An AI assistant that helps researchers find, summarize, and analyze academic papers.",
  "version": "2.1.0",
  "id": "urn:adl:acme:research-assistant:2.1.0",
  "provider": {
    "name": "Acme AI",
    "url": "https://acme.ai",
    "contact": "support@acme.ai"
  },
  "cryptographic_identity": {
    "did": "did:web:acme.ai:agents:research-assistant",
    "public_key": {
      "algorithm": "Ed25519",
      "value": "base64-encoded-public-key"
    }
  },
  "model": {
    "provider": "anthropic",
    "name": "claude-sonnet-4-20250514",
    "context_window": 200000,
    "temperature": 0.5,
    "capabilities": ["function_calling"]
  },
  "system_prompt": "You are a research assistant that helps users find and analyze academic papers. Be thorough, accurate, and cite your sources.",
  "tools": [
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
    },
    {
      "name": "get_paper",
      "description": "Get full paper details",
      "parameters": {
        "type": "object",
        "properties": {
          "paper_id": { "type": "string" }
        },
        "required": ["paper_id"]
      },
      "read_only": true
    },
    {
      "name": "save_note",
      "description": "Save a research note",
      "parameters": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "content": { "type": "string" }
        },
        "required": ["title", "content"]
      }
    }
  ],
  "resources": [
    {
      "name": "paper_index",
      "type": "vector_store",
      "description": "Vector index of paper embeddings",
      "uri": "s3://research-data/papers/"
    }
  ],
  "prompts": [
    {
      "name": "summarize",
      "description": "Summarize a paper",
      "template": "Summarize the following paper:\n\n{{content}}"
    }
  ],
  "permissions": {
    "network": {
      "allowed_hosts": ["api.semanticscholar.org", "arxiv.org"],
      "allowed_protocols": ["https"],
      "deny_private": true
    },
    "filesystem": {
      "allowed_paths": [
        { "path": "/data/papers/**", "access": "read" },
        { "path": "/data/notes/**", "access": "read_write" }
      ]
    },
    "resource_limits": {
      "max_memory_mb": 2048,
      "max_duration_sec": 300
    }
  },
  "security": {
    "authentication": {
      "type": "oauth2",
      "required": true,
      "scopes": ["read:papers", "write:notes"]
    },
    "encryption": {
      "in_transit": {
        "required": true,
        "min_version": "1.2"
      }
    },
    "attestation": {
      "type": "self",
      "issued_at": "2026-02-01T00:00:00Z",
      "expires_at": "2027-02-01T00:00:00Z"
    }
  },
  "runtime": {
    "tool_invocation": {
      "parallel": true,
      "max_concurrent": 3,
      "timeout_ms": 30000
    },
    "error_handling": {
      "on_tool_error": "retry",
      "max_retries": 2
    }
  },
  "metadata": {
    "authors": [
      { "name": "Research Team", "email": "research@acme.ai" }
    ],
    "license": "Apache-2.0",
    "documentation": "https://docs.acme.ai/research-assistant",
    "repository": "https://github.com/acme/research-assistant",
    "tags": ["research", "academic", "papers", "summarization"]
  }
}
```

## Sections Breakdown

### Identity

The agent has a unique identifier and provider information:

```json
"id": "urn:adl:acme:research-assistant:2.1.0",
"provider": {
  "name": "Acme AI",
  "url": "https://acme.ai",
  "contact": "support@acme.ai"
}
```

### Cryptographic Identity

For secure agent identification:

```json
"cryptographic_identity": {
  "did": "did:web:acme.ai:agents:research-assistant",
  "public_key": {
    "algorithm": "Ed25519",
    "value": "base64-encoded-public-key"
  }
}
```

### Permissions (Deny-by-Default)

:::warning Security Model
Network and filesystem access is explicitly defined. Any access not explicitly granted is **denied**.
:::

```json
"permissions": {
  "network": {
    "allowed_hosts": ["api.semanticscholar.org", "arxiv.org"],
    "allowed_protocols": ["https"],
    "deny_private": true
  }
}
```

### Security

Authentication and encryption requirements:

```json
"security": {
  "authentication": {
    "type": "oauth2",
    "required": true,
    "scopes": ["read:papers", "write:notes"]
  }
}
```

### Runtime Configuration

How the agent should execute:

```json
"runtime": {
  "tool_invocation": {
    "parallel": true,
    "max_concurrent": 3,
    "timeout_ms": 30000
  }
}
```

## Notes

:::tip Production Checklist
- Use `$schema` to enable IDE validation and autocomplete
- Define explicit permissions (deny-by-default)
- Configure security requirements (authentication, encryption)
- Set attestation with appropriate expiration dates
- Include comprehensive metadata for discovery
:::
