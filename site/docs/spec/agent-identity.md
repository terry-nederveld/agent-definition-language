---
id: agent-identity
title: 6. Agent Identity
sidebar_position: 6
description: Define unique agent identifiers, provider information, and cryptographic identity for secure agent verification.
keywords: [adl, identity, did, cryptographic, provider]
---

# Agent Identity

Agent identity members provide unique identification and cryptographic verification capabilities.

## 6.1 id

Unique identifier for the agent. **OPTIONAL.** When present, value **MUST** be a string; **SHOULD** be a URI or URN. Recommended formats: `urn:adl:{namespace}:{name}:{version}`, `did:web:example.com:agents:{name}`, or `https://example.com/agents/{name}`.

## 6.2 provider

Identifies the organization or entity that provides the agent. **OPTIONAL.** When present, value **MUST** be an object:

| Member   | Type   | Required | Description     |
|----------|--------|----------|-----------------|
| name    | string | REQUIRED | Provider name   |
| url     | string | OPTIONAL | Provider website |
| contact | string | OPTIONAL | Contact email   |

## 6.3 cryptographic_identity

Cryptographic identification for the agent. **OPTIONAL.** When present, value **MUST** be an object:

| Member     | Type   | Required | Description                          |
|------------|--------|----------|--------------------------------------|
| did        | string | OPTIONAL | Decentralized Identifier [W3C.DID]  |
| public_key | object | OPTIONAL | Public key for signature verification |

At least one of `did` or `public_key` **SHOULD** be present. The `public_key` object, when present, **MUST** contain `algorithm` (string, REQUIRED) and `value` (string, Base64-encoded, REQUIRED). Implementations **SHOULD** reject weak algorithms (e.g., RSA < 2048 bits, DSA, ECDSA < P-256). EdDSA (Ed25519, Ed448) is **RECOMMENDED**.

:::tip Recommended Algorithms
Use **Ed25519** for cryptographic identity. It provides strong security, small key sizes, and fast verification. See [Section 10: Security](/spec/security) for signature verification details.
:::
