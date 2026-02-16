---
id: metadata
title: 12. Metadata
sidebar_position: 12
description: Add metadata for discovery, licensing, documentation, and organizational information.
keywords: [adl, metadata, license, authors, tags, discovery]
---

# Metadata

The `metadata` member provides additional information for discovery, attribution, and licensing. **OPTIONAL.** When present, value **MUST** be an object.

:::tip Discovery and Attribution
Well-defined metadata improves agent discoverability in registries and provides clear attribution and licensing information.
:::

## 12.1 authors

Array of author objects. Each **MAY** contain `name`, `email`, `url`.

```json
{
  "authors": [
    { "name": "Research Team", "email": "research@acme.ai" }
  ]
}
```

## 12.2 license

String: SPDX license identifier or URI to license document.

```json
{
  "license": "Apache-2.0"
}
```

## 12.3 documentation

String: URI to documentation.

```json
{
  "documentation": "https://docs.acme.ai/research-assistant"
}
```

## 12.4 repository

String: URI to source repository.

```json
{
  "repository": "https://github.com/acme/research-assistant"
}
```

## 12.5 tags

Array of strings. **SHOULD** be lowercase, alphanumeric and hyphens only.

```json
{
  "tags": ["research", "academic", "papers", "summarization"]
}
```
