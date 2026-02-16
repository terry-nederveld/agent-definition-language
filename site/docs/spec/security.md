---
id: security
title: 10. Security
sidebar_position: 10
description: Configure authentication, encryption, and attestation requirements for secure agent operation.
keywords: [adl, security, authentication, encryption, attestation, oauth2]
---

# Security

The `security` member defines security requirements. **OPTIONAL.** When present, value **MUST** be an object that **MAY** contain `authentication`, `encryption`, and `attestation`.

:::tip Security Best Practices
Always define explicit security requirements for production agents. At minimum, consider requiring TLS for in-transit encryption and appropriate authentication for any external API access.
:::

## 10.1 authentication

May contain: `type` (one of `none`, `api_key`, `oauth2`, `oidc`, `mtls`), `required` (bool). Type-specific members (e.g., OAuth2: `scopes`, `token_endpoint`; OIDC: `issuer`, `audience`) **MAY** be present.

```json
{
  "authentication": {
    "type": "oauth2",
    "required": true,
    "scopes": ["read:papers", "write:notes"]
  }
}
```

## 10.2 encryption

May contain: `in_transit` (`required`, `min_version`), `at_rest` (`required`, `algorithm`).

```json
{
  "encryption": {
    "in_transit": {
      "required": true,
      "min_version": "1.2"
    }
  }
}
```

## 10.3 attestation

May contain: `type` (one of `self`, `third_party`, `verifiable_credential`), `issuer`, `issued_at`, `expires_at` (ISO 8601), `signature` (object). Implementations **SHOULD** warn when `expires_at` is in the past or within 30 days.

**Signature object:** When present, **MUST** contain `algorithm`, `value` (Base64url-encoded), `signed_content` (`"canonical"` or `"digest"`). When `signed_content` is `"digest"`, **MUST** also include `digest_algorithm` and `digest_value`. Supported algorithms include Ed25519 (RECOMMENDED), Ed448, ES256/384/512, RS256, PS256 (RSA >= 2048).

**Verification:** remove signature, serialize with JCS [RFC8785], verify digest if applicable, resolve public key from `cryptographic_identity`, verify signature.

:::warning Attestation Expiration
Implementations **SHOULD** warn when `expires_at` is in the past or within 30 days. Expired attestations indicate the agent definition may need re-verification.
:::
