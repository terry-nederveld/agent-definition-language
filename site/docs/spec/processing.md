---
id: processing
title: 14. Processing Documents
sidebar_position: 14
description: Requirements for parsing, validating, and processing ADL documents in implementations.
keywords: [adl, processing, parsing, validation, implementation]
---

# Processing Documents

This section defines requirements for implementations that parse and validate ADL documents.

## 14.1 Parsing

Implementations **MUST** parse ADL as JSON [RFC8259], **MUST** reject invalid JSON, and **MUST** reject documents where the top-level value is not a JSON object.

## 14.2 Validation

Implementations **MUST** validate ADL documents against the JSON Schema defined in Appendix A. Implementations **MUST** validate the following semantic rules:

| Rule   | Description |
|--------|-------------|
| VAL-01 | `adl` MUST match a supported version |
| VAL-02 | Tool names MUST be unique |
| VAL-03 | Resource names MUST be unique |
| VAL-04 | Prompt names MUST be unique |
| VAL-05 | Timestamps MUST be valid ISO 8601 |
| VAL-06 | URIs MUST be valid per RFC 3986 |
| VAL-07 | JSON Schema in parameters/returns MUST be valid |
| VAL-08 | Profile requirements MUST be satisfied |

Implementations **MAY** perform additional validation based on declared profiles.

## 14.3 Unknown Members

Implementations **MUST** preserve unrecognized members when round-tripping. Implementations **MUST NOT** reject documents containing unknown `x_`-prefixed members. Implementations **MAY** warn on unknown non-extension, non-profile members.
