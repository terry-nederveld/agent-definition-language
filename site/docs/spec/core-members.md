---
id: core-members
title: 5. Core Members
sidebar_position: 5
---

# Core Members

## 5.1 adl

Specifies the ADL specification version the document conforms to.

- **REQUIRED.** Value **MUST** be a string in semantic versioning format (MAJOR.MINOR.PATCH).
- Implementations **MUST** reject documents with an unsupported `adl` version.
- Implementations **SHOULD** support documents with the same MAJOR version and lower or equal MINOR version.

Example: `"adl": "0.1.0"`

## 5.2 $schema

Optional. URI reference to the JSON Schema for validation. **RECOMMENDED** for JSON documents (enables IDE validation). Canonical schema URI for ADL 0.1: `https://adl-spec.org/0.1/schema.json`.

## 5.3 name

Human-readable name for the agent. **REQUIRED.** Value **MUST** be a non-empty string. For machine identifiers, use `id` (Section 6.1).

## 5.4 description

Human-readable description of the agent's purpose and capabilities. **REQUIRED.** Value **MUST** be a non-empty string. **SHOULD** be sufficient for users to understand what the agent does without examining tool definitions.

## 5.5 version

Agent's version. **REQUIRED.** Value **MUST** be a string in semantic versioning format (MAJOR.MINOR.PATCH). Agent version changes **SHOULD** follow SemVer (MAJOR: breaking; MINOR: new capabilities; PATCH: fixes, docs).
