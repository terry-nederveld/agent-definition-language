---
id: security-considerations
title: 18. Security Considerations
sidebar_position: 18
---

# Security Considerations

## Document Integrity

Signed documents use `security.attestation.signature`. Implementations **SHOULD** verify signatures before trusting contents; **SHOULD** warn or reject invalid signatures.

## Sensitive Data

ADL documents **SHOULD NOT** contain secrets (API keys, passwords, private keys). Sensitive configuration **SHOULD** use environment variables or secret manager URIs. Implementations **SHOULD** warn on sensitive patterns in string values.

## Permission Enforcement

Runtimes **SHOULD** enforce declared permissions (e.g., via OS security features). Runtimes **MUST NOT** allow agents to exceed declared permissions. If a runtime cannot enforce a permission, it **SHOULD** warn users.

## Tool Security

- Validate inputs/outputs against schemas
- Enforce rate limits
- Log invocations
- Tools with `requires_confirmation` **SHOULD** prompt users
- `read_only` tools **SHOULD** be treated as lower risk

## Supply Chain

- Validate ADL from untrusted sources
- Verify attestations from trusted issuers
- Consider allowlists of trusted providers
