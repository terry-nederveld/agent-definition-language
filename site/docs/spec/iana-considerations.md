---
id: iana-considerations
title: 17. IANA Considerations
sidebar_position: 17
description: IANA media type registration and profile registry for ADL documents.
keywords: [adl, iana, media type, application/adl+json, registry]
---

# IANA Considerations

This section describes registrations with the Internet Assigned Numbers Authority (IANA).

## 17.1 Media Type

| Field | Value |
|-------|-------|
| **Type name** | application |
| **Subtype name** | adl+json |
| **Required parameters** | None |
| **Optional parameters** | `profile` - comma-separated list of profile identifiers |
| **Encoding considerations** | binary (UTF-8 JSON) |
| **File extensions** | .adl.json, .adl |
| **Fragment identifier** | JSON Pointer [RFC6901] |
| **Intended usage** | COMMON |
| **Applications** | AI agent platforms, agent registries, development tools, runtime environments |
| **Security considerations** | See Section 18 |

## 17.2 Profile Registry

A registry for ADL profiles may be created (Specification Required). Each registration **MUST** include:

- Profile identifier (URI)
- Name
- Specification reference
- Contact information
