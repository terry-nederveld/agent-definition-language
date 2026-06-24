# Proposal: First-Class Authentication and Authorization in ADL

**Date:** 2026-04-16
**Status:** Draft
**ADL Version:** targets `draft` (0.3.0); applies to 0.2.0 as a non-breaking superset
**Affects:** `versions/draft/spec.md` (Section 10, Section 8, Section 15), `versions/draft/spec-manifest.yaml`, `versions/draft/schema.json`, `versions/draft/snippets/security/*`, `versions/draft/examples/*`, new `profiles/authorization/1.0/`

## Summary

Replace the current single-paragraph authentication section (10.1) with a full **`security_schemes`** + **`security`** model directly aligned with OpenAPI 3.1 and the A2A Agent Card, and extend it so that authentication and authorization can be declared independently on every capability — tools, resources, and prompts. Introduce an explicit **provider/consumer asymmetry**: an `inbound` block for what a caller MUST present to invoke the agent, and an `outbound` block for what the agent presents to upstream services. Layer this over the ADL passport model so identity proofing ("I am who I say I am") and authorization ("I am allowed to do what I am asking") become distinct, composable concerns. Reserve fine-grained policy expression — RBAC, ABAC, RAR-style authorization details, step-up, delegation, sub-agent actor tokens — to an optional **Authorization profile** (`urn:adl:profile:authorization:1.0`) so the core stays tight while regulated and multi-agent deployments get a standards-aligned target.

## Motivation

### The current spec is a placeholder

Section 10.1 of `versions/draft/spec.md` defines authentication in three lines:

> May contain: `type` (one of `none`, `api_key`, `oauth2`, `oidc`, `mtls`), `required` (bool). Type-specific members (e.g., OAuth2: `scopes`, `token_endpoint`; OIDC: `issuer`, `audience`) **MAY** be present.

`versions/draft/schema.json` mirrors this with a flat property list and a closed `enum` on `type`. The example in `versions/draft/examples/production.yaml` shows OAuth2 scopes attached at the agent level only. Concretely, the spec today:

1. Cannot describe more than one authentication method on the same agent.
2. Cannot describe **multiple alternative** methods (the OR-of-AND combinatorics every modern API spec supports).
3. Cannot attach distinct authentication requirements to individual tools, resources, or prompts.
4. Cannot describe how a caller should obtain credentials beyond a `token_endpoint` URL.
5. Cannot describe how the agent itself authenticates to upstream services (mTLS to a database, signed JWT to a partner agent, OAuth client credentials to a SaaS API).
6. Cannot describe authorization at all. There is no concept of caller identity, no mapping of scopes to capabilities, no role or attribute model.
7. Cannot be extended by a profile or vendor — the `type` enum is closed in the schema.

### The ecosystem has converged; ADL is the outlier

Every adjacent specification ADL claims interoperability with already models security richly:

| Spec | Top-level container | Scheme types | Per-operation overrides | Multi-method (AND/OR) |
|------|---------------------|--------------|-------------------------|------------------------|
| **OpenAPI 3.1** | `components.securitySchemes` + `security` | `apiKey`, `http`, `oauth2`, `openIdConnect`, `mutualTLS` | Yes | Yes |
| **AsyncAPI 3.0** | Per-server `security` + per-operation | Adds SASL/X509/SCRAM for brokers | Yes | Yes |
| **A2A AgentCard** | `securitySchemes` + `security` | 1:1 with OpenAPI | Yes | Yes |
| **MCP 2025-06-18** | OAuth 2.1 Resource Server pattern + RFC 9728 metadata | OAuth 2.1 (DCR, PKCE, audience-bound) | Implicit per-tool via RAR (open issue) | Via OAuth |
| **ADL 0.2.0 / draft** | `security.authentication` (single object) | Closed enum of 5 | No | No |

ADL's Section 15.1 promises A2A Agent Card generation. An A2A AgentCard requires a `securitySchemes` map. Today, an ADL-to-A2A generator has nothing to populate it from beyond a single `type` string. ADL's Section 15.2 promises MCP server configuration. The MCP authorization specification (revision 2025-06-18) is built on OAuth 2.1, RFC 8414 authorization-server metadata, RFC 7591 dynamic client registration, RFC 8707 resource indicators, and RFC 9728 protected-resource metadata. Today, ADL captures none of these. ADL's Section 15.3 promises OpenAPI integration, with tool-level `annotations.openapi_ref`. Today, no per-tool `security` exists to compose with the OpenAPI security requirement.

### The passport model demands a clear identity/authorization split

Section 1.3 of the draft establishes ADL as a **passport**:

> An ADL document functions as a passport for an AI agent. It carries the declarations that a counterparty — peer agent, gateway, orchestrator, registry, or human operator — needs to make a trust decision.

A passport answers two distinct questions, and the spec must do the same:

- **Authentication.** Who is presenting the passport? Does it belong to who they claim to be? Is the bearer the same entity the passport was issued to? (Solved today via `cryptographic_identity`, `attestation`, and the document signature in Section 10.3.)
- **Authorization.** Given that we now know who they are, are they allowed to do the specific thing they are asking to do? (Not solved today at any level — neither at the agent boundary nor per-capability.)

The Governance profile gestures at this with `autonomy.tier`, `human_oversight.level`, and `ownership.decision_boundaries`. Healthcare requires `mfa_required`. Financial requires segregation-of-duties. These are coarse, profile-specific, and not interoperable with the OAuth or capability-based authorization standards the rest of the ecosystem uses.

### The asymmetry between provider and consumer is real and load-bearing

A consumer reading an ADL document needs to know **what the agent requires from them**: which authentication methods are accepted at the agent's endpoint, which scopes a token must carry to invoke a given tool, whether mTLS is required, whether step-up is needed for sensitive tools. A provider publishing the ADL document also has a second story to tell: **what the agent presents upstream** when invoking a tool that calls an external API, or when delegating to a sub-agent. These two stories belong in different sub-objects, not collapsed into one. The current spec collapses them.

### Closed enum blocks profile-level extension

`security.authentication.type` is a closed enum in `versions/draft/schema.json`. The Authorization profile this proposal introduces (and any future profile, vendor scheme, or IETF-drafted scheme such as GNAP or DID-Auth) cannot add a new auth type without a normative spec change. The vendor-extensions proposal (`proposals/2026-03-14-vendor-extensions.md`) provides a precedent for opening this surface cleanly.

## Details

### 1. Restructured Section 10.1 Authentication

Replace the existing Section 10.1 with the structure below. The current `security.encryption` (10.2) and `security.attestation` (10.3) are unchanged.

#### 1.1 The `security_schemes` registry

A new top-level `security_schemes` member on the ADL document declares **named reusable schemes**. This mirrors OpenAPI 3.1's `components.securitySchemes` and A2A's identically named field.

```yaml
security_schemes:
  partner_oauth:
    type: oauth2
    description: OAuth 2.1 for partner integrations.
    flows:
      authorization_code:
        authorization_url: https://auth.acme.example.com/oauth/authorize
        token_url: https://auth.acme.example.com/oauth/token
        refresh_url: https://auth.acme.example.com/oauth/refresh
        scopes:
          "invoices:read": Read invoice records.
          "invoices:write": Create or modify invoice records.
          "payments:execute": Execute a payment.
  service_mtls:
    type: mutual_tls
    description: Mutual TLS for service-to-service callers.
    trust_anchors:
      - https://pki.acme.example.com/roots/internal.pem
    subject_pattern: "CN=*.svc.acme.example.com"
  partner_jwt:
    type: http
    scheme: bearer
    bearer_format: JWT
    issuer: https://idp.partner.example.com
    audience: urn:acme:invoice-agent
  agent_passport:
    type: agent_passport
    description: An ADL passport signed by the calling agent's provider.
    accepted_issuers:
      - did:web:platform.example.com
      - did:web:partner.example.com
    required_attestations:
      - urn:adl:attestation:identity
```

Scheme `type` values:

| Type | Maps to | Required members |
|------|---------|------------------|
| `api_key` | OpenAPI `apiKey` | `in` (one of `header`, `query`, `cookie`), `name` |
| `http` | OpenAPI `http` (RFC 7235) | `scheme` (`bearer`, `basic`, `digest`, `dpop`), optional `bearer_format` |
| `oauth2` | OpenAPI `oauth2` + OAuth 2.1 | `flows` (one or more of `authorization_code`, `client_credentials`, `device_code`, `token_exchange`); `authorization_code` and `device_code` flows **MUST** declare PKCE support |
| `openid_connect` | OpenAPI `openIdConnect` | `openid_connect_url` |
| `mutual_tls` | OpenAPI `mutualTLS` | optional `trust_anchors`, `subject_pattern`, `revocation_check` |
| `verifiable_credential` | W3C VC 2.0 presentation | `accepted_issuers`, `credential_schemas`, optional `presentation_definition` |
| `agent_passport` | ADL-native (this spec) | `accepted_issuers` (DID/HTTPS URIs), optional `required_attestations`, `chain_depth_max` |

Schemes are referenced by name from any `security` requirement object (Section 1.2). Implementations **MUST** treat the `type` field as an extensible identifier: profiles and vendor extensions **MAY** define additional `type` values using reverse-domain notation (e.g. `type: com.acme.bespoke-auth`). Unknown types **MUST** cause validators to emit a warning and treat the requirement as unsatisfied, never as silently satisfied.

#### 1.2 The `security` requirement model

The `security` member, when present on the agent root, on `inbound`, on `outbound`, or on any individual `tools[]`, `resources[]`, or `prompts[]` entry, **MUST** be an array of **security requirement objects**. The combinatorics are identical to OpenAPI 3.1:

- Each object is a **conjunction** (AND): every named scheme in the object must be satisfied.
- The array is a **disjunction** (OR): satisfying any one object satisfies the requirement.
- An empty array (`security: []`) **disables** any inherited requirement. An empty object (`{}` inside the array) makes auth **optional**.

```yaml
security:
  - partner_oauth: ["invoices:read"]
  - service_mtls: []
    partner_jwt: ["urn:partner:agent.read"]
```

The example reads: "Either an OAuth2 token with `invoices:read`, OR mutual TLS plus a partner JWT with `urn:partner:agent.read`."

#### 1.3 Inheritance and overrides

Resolution order, most-specific wins, with explicit override semantics matching OpenAPI:

1. **Capability-level** `security` on a `tools[]`, `resources[]`, or `prompts[]` entry, if present.
2. **Inbound-level** `security` on the agent's `security.inbound` object, if present.
3. **Document-level** `security` at the ADL document root, if present (top-level shorthand for `inbound`).
4. Otherwise: **no security requirement**.

A capability-level `security: []` disables inherited requirements for that capability (e.g. an explicitly unauthenticated health-check tool on an otherwise authenticated agent). Implementations **MUST NOT** merge inherited and capability-level requirements; override is total, not additive.

#### 1.4 Inbound vs. outbound

Replace the flat `security.authentication` with two sub-objects:

```yaml
security:
  inbound:
    security:
      - partner_oauth: ["invoices:read"]
    discovery:
      protected_resource_metadata: https://api.acme.example.com/.well-known/oauth-protected-resource
      authorization_server_metadata: https://auth.acme.example.com/.well-known/oauth-authorization-server
      dynamic_client_registration: https://auth.acme.example.com/register
    audience: urn:acme:invoice-agent
    resource_indicators_required: true
  outbound:
    default:
      - service_mtls: []
    per_tool:
      send_invoice_email:
        - smtp_oauth: ["mail.send"]
  encryption:
    in_transit:
      required: true
      min_version: TLS1.3
  attestation:
    type: verifiable_credential
    issuer: did:web:adl-spec.org
    issued_at: "2026-04-01T00:00:00Z"
    expires_at: "2027-04-01T00:00:00Z"
```

- **`security.inbound`** describes what callers (peer agents, gateways, human runtimes, registries) **MUST** present to invoke this agent. It is the **provider-side declaration of consumer obligations**.
- **`security.outbound`** describes what the agent **presents** to upstream services when invoking tools or sub-agents. It is the **provider-side declaration of the agent's own credentials**.

`security.inbound.discovery` provides RFC 8414 (AS metadata), RFC 9728 (protected resource metadata), and RFC 7591 (dynamic client registration) endpoints when applicable. `audience` and `resource_indicators_required` make audience-binding (RFC 8707) explicit; this is the same defense against confused-deputy attacks that MCP 2025-06-18 adopts.

#### 1.5 Per-capability `security`

Add an optional `security` member to every `tools[]`, `resources[]`, and `prompts[]` entry:

```yaml
tools:
  - name: search_invoices
    description: Search for invoices by vendor, date, or amount.
    read_only: true
    security:
      - partner_oauth: ["invoices:read"]
  - name: issue_refund
    description: Issue a refund for a paid invoice.
    requires_confirmation: true
    security:
      - partner_oauth: ["invoices:write", "payments:execute"]
        partner_jwt: ["urn:partner:agent.high-trust"]
    authorization:
      step_up: true
      authorization_details_types: ["payment_initiation"]
  - name: health_check
    description: Liveness probe.
    read_only: true
    security: []
```

The same `security` member is permitted on `resources[]` and `prompts[]`. This closes the gap where a single agent today cannot say "tool A needs `invoices:read`, tool B needs `payments:execute` plus step-up, the public health-check tool needs nothing."

Capability-level `security` composes with capability-level `data_classification` (Section 10.4). When both are present and a token's scope set is insufficient to meet the capability's `security` requirement, the runtime **MUST** deny the call regardless of data-classification high-water-mark calculations.

#### 1.6 Optional `authorization` member on capabilities

Per-capability fine-grained authorization is OPTIONAL in the core and is the primary surface defined by the new Authorization profile (Section 2). When present in the core, a capability `authorization` member **MAY** include:

| Member | Description |
|--------|-------------|
| `step_up` | Boolean — the runtime must require step-up authentication (e.g., a fresh AMR or ACR claim) before invocation. |
| `acr_values` | Required OIDC ACR values. |
| `amr_values` | Required OIDC AMR values (e.g., `["mfa"]`). |
| `authorization_details_types` | Array of RFC 9396 (RAR) `authorization_details.type` values the caller's token MUST carry. |
| `purpose_required` | Boolean — caller MUST present a purpose claim or consent receipt; the profile defines the format. |
| `policy_refs` | Array of URIs referencing externally hosted policies (OPA bundle URI, Cedar policy, XACML document). Core ADL does not embed policy languages; the runtime evaluates the referenced policy at invocation. |

Profiles **MAY** add further members under `authorization`. Vendor extensions **MAY** add fields scoped to a `com.<vendor>` namespace per `proposals/2026-03-14-vendor-extensions.md`.

### 2. New profile: `urn:adl:profile:authorization:1.0`

Create `profiles/authorization/1.0/` containing `README.md`, `profile.md`, `schema.json`, and example documents. This profile is the standards-aligned home for full RBAC/ABAC, delegated authorization, sub-agent actor tokens, and policy bindings. It does not redefine the core; it adds members under the existing `security_schemes`, `security`, and capability `authorization` surfaces.

#### 2.1 Caller identity model

A new top-level `caller_identity` member declares the **identities the agent recognizes** as callers. This is the symmetric peer of Section 6's `id` / `cryptographic_identity` (which describe the agent itself).

```yaml
caller_identity:
  principals:
    - kind: user
      identity_provider: partner_oauth
      claim_bindings:
        sub: sub
        email: email
    - kind: workload
      identity_provider: service_mtls
      claim_bindings:
        spiffe_id: subject_alt_name.uri
    - kind: agent
      identity_provider: agent_passport
      claim_bindings:
        agent_did: iss
        provider_did: provider.did
  delegation:
    on_behalf_of_supported: true
    actor_token_required_for: ["payments:execute"]
    chain_depth_max: 3
```

`kind` values: `user`, `workload` (SPIFFE/RFC-style), `agent` (ADL passport), `service` (legacy SaaS principal). Profiles MAY add kinds. `delegation` aligns with the IETF draft work on OAuth for AI agents (`draft-oauth-ai-agents-on-behalf-of-user`, `draft-song-oauth-ai-agent-collaborate-authz`).

#### 2.2 Roles and policy binding

```yaml
authorization:
  roles:
    invoice_reader:
      description: Read-only access to invoice tools and resources.
      grants:
        scopes: ["invoices:read"]
        tools: ["search_invoices", "get_invoice"]
    payments_operator:
      description: Initiate payments with required step-up.
      grants:
        scopes: ["invoices:read", "payments:execute"]
        tools: ["search_invoices", "issue_refund"]
      requires:
        amr_values: ["mfa"]
  attribute_bindings:
    - subject_attribute: department
      claim: "https://acme.example.com/dept"
    - subject_attribute: clearance
      claim: "https://acme.example.com/clearance"
  policy:
    engine: opa
    bundle_uri: https://policies.acme.example.com/invoice-agent/v3/bundle.tar.gz
    decision: data.invoice_agent.allow
```

The profile defines:

- `authorization.roles` — declarative RBAC, with scope, tool, resource, and prompt grants and pre-conditions.
- `authorization.attribute_bindings` — ABAC attribute sources, mapping claim names to subject attributes referenced by the bound policy.
- `authorization.policy` — references to externally hosted, machine-evaluable policy. Supported engines: `opa` (OPA/Rego), `cedar` (Amazon Cedar), `xacml` (OASIS XACML 3.0). The profile does not require any one engine; it requires that the chosen engine is implementation-recognized.
- `authorization.consent` — consent receipt requirements (`kantara_cr_v1.1`, OIDC `consent` claims), purpose binding (`purpose_required`, `purpose_taxonomy`).

#### 2.3 Sub-agent and delegation

The profile defines the on-the-wire shape of the actor token chain required by `caller_identity.delegation`, aligned with RFC 8693 token exchange and the `requested_actor` / `actor_token` parameters from the IETF agent-authorization drafts. ADL does not invent a new token format; it declares which formats the runtime must accept.

### 3. Specification changes

#### 3.1 Section 10 rewrite

Replace Section 10.1 with the structure in Section 1 of this proposal. Renumber:

- 10.1 Authentication → expanded into 10.1 Security Schemes, 10.2 Inbound Security, 10.3 Outbound Security, 10.4 Capability-Level Security.
- 10.2 Encryption → 10.5 Encryption (unchanged content).
- 10.3 Attestation → 10.6 Attestation (unchanged content).
- 10.4 Data Classification → 10.7 Data Classification (unchanged content; cross-references to capability `security` added).

Update `versions/draft/spec-manifest.yaml` to reflect new subsection structure.

#### 3.2 Section 8 updates

Add an optional `security` member to the tool, resource, and prompt object tables. Add `authorization` as an OPTIONAL member referencing the Authorization profile for full semantics. Update the Section 8.1 example.

#### 3.3 Top-level `security_schemes` and `caller_identity`

Add `security_schemes` to the Section 4.2 top-level object table as OPTIONAL. Add `caller_identity` as OPTIONAL and note that full semantics are profile-defined.

#### 3.4 Section 15 interoperability

- **15.1 A2A.** Update to specify that `security_schemes` and `security` are emitted verbatim to the A2A AgentCard `securitySchemes` and `security` fields. Document the type-name mapping (`mutual_tls` → A2A `MutualTlsSecurityScheme`, etc.).
- **15.2 MCP.** Update to specify that when an `oauth2` scheme is declared with `inbound.discovery`, the MCP server configuration emits the corresponding RFC 9728 `WWW-Authenticate` challenge and RFC 8707 resource indicator wiring. Implementations **MUST** require PKCE on flows that support it and **MUST** validate token audience.
- **15.3 OpenAPI.** Update to specify that when a tool's `annotations.openapi_ref` is present and the tool also declares `security`, the runtime composes the two: the OpenAPI operation's security requirement and the ADL capability's security requirement are conjunctive (AND), not alternative.

#### 3.5 Section 18 security considerations

Add subsections:

- **18.13 Confused Deputy and Audience Binding** — incorporate the MCP 2025-06-18 guidance: tokens MUST be audience-bound; passthrough is forbidden.
- **18.14 Delegation Chain Abuse** — limit `chain_depth_max`; require chain validation at every hop.
- **18.15 Scope Inflation** — recommend RFC 9396 RAR for fine-grained permission requests in lieu of granting broad scopes.
- **18.16 Policy Reference Integrity** — `policy_refs` URIs MUST be integrity-protected (subresource hash, signed bundle, or trusted-source allowlist).

#### 3.6 Schema changes

`versions/draft/schema.json`:

1. Add a `security_schemes` definition allowing the seven `type` values above with `oneOf`-by-type. Change `type` to a pattern-validated string accepting reverse-domain extension types so profiles and vendors can register additional schemes without a normative change to core.
2. Add a `security_requirement_array` definition used by the document root, by `security.inbound.security`, by `security.outbound.default` / `security.outbound.per_tool.*`, and by each capability.
3. Add `security.inbound`, `security.outbound`, `security.encryption`, `security.attestation` properties; deprecate `security.authentication` and document a translation path (Section 4).
4. Add an optional `authorization` property on each capability with the members enumerated in Section 1.6.
5. Add an optional `caller_identity` top-level property with profile-defined sub-shape.

`profiles/authorization/1.0/schema.json` follows the standard profile composition pattern from Section 13.1.

#### 3.7 Examples and snippets

- Replace `versions/draft/snippets/security/authentication.{yaml,json}` with `security-schemes.{yaml,json}`, `inbound-security.{yaml,json}`, `outbound-security.{yaml,json}`, `capability-security.{yaml,json}`.
- Add `versions/draft/examples/secured-tools.yaml` demonstrating per-tool scopes, optional auth on a health-check tool, and step-up on a high-risk tool.
- Add `profiles/authorization/1.0/examples/rbac-with-policy.yaml`.

#### 3.8 Profile updates

- **Governance profile.** Add a compliance-control mapping row noting that `security.inbound.security` and `caller_identity` map to NIST 800-53 controls IA-2, IA-5, IA-8 (non-org users), IA-9 (service identification), AC-3, AC-14, AC-16. Cross-reference the Authorization profile for full SOC2 CC6.1 / CC6.6 coverage.
- **Healthcare profile.** Replace the bare `hipaa_compliance.security_rule.mfa_required` boolean with `amr_values: ["mfa"]` on tools that access PHI; keep the boolean for back-compat with a deprecation note.
- **Financial profile.** Express segregation-of-duties as a role pair under the Authorization profile (`approver_role` and `requestor_role`), and bind kill-switch invocation to a dedicated tool with `step_up: true`.

### 4. Migration and back-compat

ADL 0.2.0 documents using the legacy `security.authentication` object remain valid in 0.3.0. Validators **MUST**:

1. Treat a document with `security.authentication` and no `security_schemes` as if it declared a single anonymous scheme named `default` with a one-to-one mapping (`oauth2.scopes` → `flows.authorization_code.scopes`, `oidc.issuer/audience` → `openid_connect_url`, etc.).
2. Emit a deprecation warning recommending migration to `security_schemes` + `security.inbound`.
3. Continue accepting both forms through 0.3.x; remove `security.authentication` no earlier than 0.5.0.

CLI tooling **SHOULD** ship an `adl migrate auth` command that rewrites a 0.2.0 document to the 0.3.0 form mechanically.

### 5. Worked example

```yaml
adl_spec: "0.3.0"
name: Invoice Processor
version: "3.0.0"
description: Processes invoices, issues refunds, and emails receipts.
provider:
  name: Acme Financial Operations
  url: https://acme.example.com

security_schemes:
  partner_oauth:
    type: oauth2
    flows:
      authorization_code:
        authorization_url: https://auth.acme.example.com/oauth/authorize
        token_url: https://auth.acme.example.com/oauth/token
        scopes:
          "invoices:read": Read invoice records.
          "invoices:write": Modify invoice records.
          "payments:execute": Execute a payment.
  service_mtls:
    type: mutual_tls
    trust_anchors:
      - https://pki.acme.example.com/roots/internal.pem
  smtp_oauth:
    type: oauth2
    flows:
      client_credentials:
        token_url: https://mail.example.com/oauth/token
        scopes:
          "mail.send": Send mail on behalf of an account.

security:
  inbound:
    security:
      - partner_oauth: ["invoices:read"]
    discovery:
      protected_resource_metadata: https://api.acme.example.com/.well-known/oauth-protected-resource
    audience: urn:acme:invoice-agent
    resource_indicators_required: true
  outbound:
    default:
      - service_mtls: []
    per_tool:
      send_receipt:
        - smtp_oauth: ["mail.send"]
  encryption:
    in_transit:
      required: true
      min_version: TLS1.3

tools:
  - name: search_invoices
    description: Search for invoices.
    read_only: true
    security:
      - partner_oauth: ["invoices:read"]
  - name: issue_refund
    description: Issue a refund.
    requires_confirmation: true
    security:
      - partner_oauth: ["invoices:write", "payments:execute"]
    authorization:
      step_up: true
      amr_values: ["mfa"]
      authorization_details_types: ["payment_initiation"]
  - name: send_receipt
    description: Email a receipt to a payer.
    security:
      - partner_oauth: ["invoices:read"]
  - name: health_check
    description: Liveness probe.
    read_only: true
    security: []
```

A consumer (peer agent, gateway, registry) reading this passport can determine, without contacting Acme:

- The agent accepts inbound OAuth2 authorization_code flow with three scopes, plus the audience to bind tokens to.
- Discovery metadata for the protected-resource and authorization-server is at well-known URLs.
- `search_invoices` requires `invoices:read`. `issue_refund` requires both `invoices:write` and `payments:execute` plus MFA plus a RAR `payment_initiation` authorization detail. `health_check` is unauthenticated. `send_receipt` requires `invoices:read`.
- When the agent calls upstream, it uses mTLS by default and a separate OAuth client-credentials grant when sending mail.

## Pros and cons

### Pros

- **Direct A2A and OpenAPI compatibility.** ADL-to-A2A and ADL-to-OpenAPI generators become trivial; the surface they need already exists.
- **MCP authorization parity.** The audience binding, discovery, and PKCE requirements adopted by MCP 2025-06-18 become first-class in ADL.
- **Per-capability granularity.** The most-requested capability gap — per-tool authentication and scope — is closed without forcing every adopter into a full policy engine.
- **Provider/consumer asymmetry.** The inbound vs. outbound distinction makes the bilateral nature of an agent passport explicit, which is essential for agent-to-agent topologies.
- **Standards-track alignment.** Ties ADL to the active IETF WIMSE and OAuth-for-AI-agents draft work without taking a premature position on which draft wins.
- **Composability.** `security_schemes` + `security` is the same pattern used by every adjacent spec, so reviewers from those communities will not have to learn anything new.
- **Extension surface unblocked.** Profiles and vendors can register new scheme types without normative core changes.

### Cons

- **Surface area increase.** The Security section grows from three subsections to seven; the document root grows by two top-level members.
- **Migration cost.** Existing 0.2.0 documents need migration (mitigated by Section 4 back-compat).
- **Risk of feature creep.** A full policy model is tempting but does not belong in core; the profile boundary in Section 2 must be enforced or the core becomes an authorization engine.
- **Conformance complexity.** Implementations now have to interpret OR-of-AND combinatorics; that is a real validator and gateway implementation cost.
- **Standards moving target.** The OAuth-for-AI-agents drafts are pre-WG and will change. ADL must accept some churn in Section 1.4 / 1.6 details across 0.3.x.

### Why we should

The placeholder Section 10.1 already blocks the three integrations the spec promises (A2A, MCP, OpenAPI). It blocks any adopter whose tools have different scopes. It blocks any deployment subject to a real auth audit. Doing nothing locks ADL out of the conversation MCP and A2A are already having.

### Why we shouldn't (and why those arguments don't hold)

- *"This is too much; a profile alone is enough."* The Authentication and Inbound/Outbound model has to live in core because it's how A2A and OpenAPI generation work; a profile-only solution forces every generator to special-case profile presence.
- *"Let the runtime define this."* That's what ADL 0.2.0 does today, and the result is that the passport carries no authorization signal at all, which violates Section 1.3's "self-contained trust signals" principle.
- *"Wait for the IETF drafts to land."* The drafts will not land for years. ADL needs an answer for 0.3.0, and the OpenAPI/A2A surface is stable and adopted today.

## Alternatives

### A. Minimal expansion of the current Section 10.1

Add `bearer`, expand `oauth2` to capture flows and scopes properly, leave everything else alone. **Rejected.** It does not solve per-capability granularity, provider/consumer asymmetry, or authorization. The integrations in Section 15 remain unsatisfied. The work has to be done eventually; deferring it splits adopters across two incompatible auth dialects.

### B. Adopt OpenAPI security verbatim with no ADL-specific layer

Lift `securitySchemes` and `security` from OpenAPI 3.1 unchanged, do not add `inbound`/`outbound`, do not add `agent_passport`, do not add `caller_identity`. **Rejected.** Loses the agent-passport-native scheme that lets an ADL agent authenticate another ADL agent directly, and forces the provider/consumer asymmetry to be re-derived by every consumer.

### C. Put everything in a profile

Move all of Sections 1 and 2 of this proposal into `profiles/authorization/1.0/` and leave core untouched. **Rejected.** Core ADL would still be unable to populate the A2A `securitySchemes` it claims to generate, so an A2A-shaped surface has to be in core regardless.

### D. Use a custom DSL for authorization

Define an ADL-specific authorization expression language (a small Rego subset, or an inline JSON predicate format). **Rejected.** The policy-as-code space has converged on OPA, Cedar, and XACML; ADL is not the right place to invent a fourth.

### E. Embed OAuth Protected Resource Metadata (RFC 9728) verbatim

Drop the ADL-specific `security_schemes` and `security` shape and require ADL consumers to dereference an RFC 9728 document instead. **Rejected.** Violates the passport principle: a consumer must be able to make a trust decision from the ADL document alone. RFC 9728 is the right discovery mechanism but is not the right shape for a self-contained passport.

### F. Defer to the Governance profile

Treat authentication and authorization as governance concerns and move all of this into the Governance profile. **Rejected.** Authentication is too foundational; A2A and MCP generation depend on it being in core, not gated behind a profile that the document may not declare.

## References

### Standards (normative reference candidates)

- [OpenAPI 3.1.0 — Security Scheme Object and Security Requirement Object](https://spec.openapis.org/oas/v3.1.0#security-scheme-object)
- [AsyncAPI 3.0 — Security Scheme Object](https://www.asyncapi.com/docs/reference/specification/v3.0.0)
- [A2A Protocol — AgentCard `securitySchemes`](https://a2a-protocol.org/latest/specification/)
- [MCP 2025-06-18 — Authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [RFC 6749 — The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
- [RFC 6750 — OAuth 2.0 Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
- [RFC 7235 — HTTP Authentication](https://www.rfc-editor.org/rfc/rfc7235)
- [RFC 7591 — OAuth 2.0 Dynamic Client Registration](https://www.rfc-editor.org/rfc/rfc7591)
- [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636)
- [RFC 8414 — OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414)
- [RFC 8693 — OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)
- [RFC 8705 — OAuth 2.0 Mutual-TLS Client Authentication](https://www.rfc-editor.org/rfc/rfc8705)
- [RFC 8707 — Resource Indicators for OAuth 2.0](https://www.rfc-editor.org/rfc/rfc8707)
- [RFC 9396 — OAuth 2.0 Rich Authorization Requests (RAR)](https://www.rfc-editor.org/rfc/rfc9396)
- [RFC 9449 — OAuth 2.0 Demonstrating Proof-of-Possession (DPoP)](https://www.rfc-editor.org/rfc/rfc9449)
- [RFC 9635 — GNAP Core Protocol](https://www.rfc-editor.org/rfc/rfc9635)
- [RFC 9728 — OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728)
- [OAuth 2.1 (draft-ietf-oauth-v2-1)](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [W3C Decentralized Identifiers (DIDs) 1.0](https://www.w3.org/TR/did-core/)
- [SPIFFE Specification](https://spiffe.io/docs/latest/spiffe-about/overview/)

### IETF work in progress

- [WIMSE WG — Workload Identity in Multi-System Environments](https://datatracker.ietf.org/wg/wimse/about/)
- [draft-ietf-wimse-arch — WIMSE Architecture](https://datatracker.ietf.org/doc/draft-ietf-wimse-arch/)
- [draft-ni-wimse-ai-agent-identity — AI Agent Identity in WIMSE](https://datatracker.ietf.org/doc/draft-ni-wimse-ai-agent-identity/)
- [draft-oauth-ai-agents-on-behalf-of-user — OAuth for AI Agents Acting on Behalf of a User](https://datatracker.ietf.org/doc/draft-oauth-ai-agents-on-behalf-of-user/)
- [draft-song-oauth-ai-agent-authorization — Per-target Authorization for AI Agents](https://datatracker.ietf.org/doc/draft-song-oauth-ai-agent-authorization/)
- [draft-song-oauth-ai-agent-collaborate-authz — Multi-Agent Delegated Authorization](https://datatracker.ietf.org/doc/draft-song-oauth-ai-agent-collaborate-authz/)
- [draft-jia-oauth-scope-aggregation — Scope Aggregation Across Agent Workflows](https://datatracker.ietf.org/doc/draft-jia-oauth-scope-aggregation/)

### Policy engines (informative)

- [Open Policy Agent](https://www.openpolicyagent.org/)
- [Cedar Policy Language](https://www.cedarpolicy.com/)
- [OASIS XACML 3.0](https://www.oasis-open.org/standard/xacml/)

### ADL repository references

- [ADL Specification 0.2.0 — Section 10 Security](../versions/0.2.0/spec.md)
- [ADL Specification draft (0.3.0) — Section 10 Security](../versions/draft/spec.md)
- [ADL Specification draft — Section 1.3 Design Model (passport)](../versions/draft/spec.md)
- [ADL Specification draft — Section 15 Interoperability](../versions/draft/spec.md)
- [Governance Profile 1.0](../profiles/governance/1.0/profile.md)
- [Healthcare Profile 1.0](../profiles/healthcare/1.0/profile.md)
- [Financial Profile 1.0](../profiles/financial/1.0/profile.md)
- [Proposal: Vendor Extensions (2026-03-14)](./2026-03-14-vendor-extensions.md) — precedent for opening the `type` extension surface
- [Proposal: Critical Gap Remediation (2026-02-16)](./2026-02-16-critical-gap-remediation.md)
