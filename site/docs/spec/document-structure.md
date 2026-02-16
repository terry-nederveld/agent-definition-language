---
id: document-structure
title: 4. Document Structure
sidebar_position: 4
description: Learn about ADL document structure, media types, encoding requirements, and the extension mechanism.
keywords: [adl, document structure, json, media type]
---

# Document Structure

## 4.1 Media Type

:::note Media Type Registration
The `application/adl+json` media type is defined in [Section 17: IANA Considerations](/spec/iana-considerations).
:::

- ADL documents use the media type **`application/adl+json`**.
- ADL documents **MUST** be encoded in UTF-8.
- ADL documents **MUST** be valid JSON [RFC8259].
- Member names **MUST** use **snake_case** (lowercase with underscores).
- All timestamps **MUST** be ISO 8601 strings with timezone (e.g., `"2026-02-15T14:30:00Z"`).
- All URIs **MUST** conform to [RFC3986].

## 4.2 Top-Level Object

An ADL document **MUST** be a single JSON object.

**Required members:**

- `adl` (Section 5.1)
- `name` (Section 5.3)
- `description` (Section 5.4)
- `version` (Section 5.5)

**Optional members:**

- `$schema`, `id`, `provider`, `cryptographic_identity`, `model`, `system_prompt`, `tools`, `resources`, `prompts`, `permissions`, `security`, `runtime`, `metadata`, `profiles`

An ADL document **MUST NOT** contain members not defined by this specification, a declared profile, or the extension mechanism.

## 4.3 Extension Mechanism

- **Profiles:** Add domain-specific requirements and members; declared in `profiles`. See Section 13.
- **Extension members:** Custom data without a full profile. Names **MUST** be prefixed with `x_` followed by a namespace identifier (e.g., `x_acme_internal_id`).

Implementations **MUST** preserve extension members when processing but **MAY** ignore their contents. Implementations **MUST NOT** reject documents containing unknown `x_`-prefixed members.

:::tip Extension Naming
Extension member names follow the pattern `x_{namespace}_{name}`. For example, `x_acme_internal_id` uses the `acme` namespace. This prevents collisions between extensions from different organizations.
:::
