# Proposal: Runtime Operations Profile (`urn:adl:profile:runtime-ops:1.0`)

**Date:** 2026-05-18
**Status:** Draft
**ADL Version:** 0.1.0
**Affects:** `profiles/runtime-ops/` (new), `profiles/manifest.yaml`, `versions/0.1.0/spec.md` (minor — polymorphic widening of `runtime.output_handling.streaming`), companion proposals `2026-05-18-gemini-enterprise-interop.md` and `2026-05-18-microsoft-governance-toolkit-interop.md`

---

## 1. Summary

Introduce a new standard profile, **Runtime Operations** (`urn:adl:profile:runtime-ops:1.0`), to capture the runtime-operational concerns that the Gemini Enterprise and Microsoft AGT interop proposals (both 2026-05-18) revealed as universal across managed agent platforms but a poor fit for either the core spec or the existing Governance Profile.

The profile adds seven members: `execution_model`, `max_session_duration_sec`, `trigger`, `memory`, `streaming` (structured form), `protocols[]`, and `policy_references[]`. Each is independently observed in multiple production runtimes (Gemini Enterprise, Microsoft AGT, AWS Bedrock Agents, Azure AI Foundry, LangGraph, AutoGen, CrewAI, OpenAI Assistants).

Splitting these out of the core spec keeps the core small and architecturally neutral; splitting them out of the Governance Profile preserves Governance's regulatory focus. The companion interop proposals are updated to point at this profile for the items previously slated as core changes.

---

## 2. Motivation

### 2.1 The shared-findings problem

The Gemini Enterprise and Microsoft AGT proposals were written independently. Both surfaced the same operational concerns:

| Concern | Gemini finding | AGT finding |
|---|---|---|
| Long-running / non-request-response execution | G1 (long-running agents) | G7 (Saga orchestration, multi-day workflows) |
| Persistent agent memory | G2 (Memory Bank, Memory Profiles) | (memory poisoning ASI-06 implies memory exists) |
| Multi-protocol streaming (SSE / WebSocket / gRPC) | G4 (bidirectional streaming) | (real-time channels in AgentMesh) |
| Event/batch triggers | G1 (BigQuery, Pub/Sub triggers) | (event-driven evaluation in PolicyEvaluator) |
| Declarative protocol conformance (MCP, A2A, AP2) | G7 (AP2 payment protocol) | (MCP Security Scanner, framework integrations) |
| External policy evaluation references | (Model Armor as external service) | G5 (PolicyDocument, Cedar, OPA/Rego) |

When the same gap appears in two independent runtime analyses, it is a property of the agent ecosystem, not a property of either runtime. These belong in ADL — but not in core.

### 2.2 Why not core

Three traits disqualify these members from core ADL:

1. **Not universal across ADL use cases.** A static A2A Agent Card derived from ADL has no `memory` or `triggers`. Forcing operational members into core inflates the schema for documents that will never use them.

2. **Architectural commitments.** Declaring `memory.backend = "long_term"` commits an agent to an architectural pattern. Core ADL describes agents; it should not pre-commit to architectures.

3. **Faster evolution cadence than core.** Streaming protocols, memory semantics, trigger types, and policy languages will churn over the next 2–3 years. A profile can version (`runtime-ops:1.0` → `1.1`) without forcing a core SemVer bump.

### 2.3 Why not the Governance Profile

The Governance Profile is regulatory — frameworks (`EU_AI_ACT`, `NIST_800_53`), autonomy tiers, human oversight, audit trails. Its narrative answers **"is this agent compliant with X?"** Operational members (`memory.backend`, `streaming.protocols`, `execution_model`) answer **"how is this agent operationally run?"** Mixing the two dilutes both narratives.

### 2.4 Why this is a single coherent profile, not many

`memory`, `execution_model`, `streaming`, and `triggers` form one coherent picture: the runtime operational profile of an agent. They co-occur:

- A long-running event-driven agent (`execution_model: event_driven`) needs persistent state (`memory.backend: long_term`) and likely supports bidirectional streaming (`streaming.protocols: ["websocket"]`).
- A request/response chatbot has `execution_model: request_response`, `memory.backend: session`, `streaming.protocols: ["sse"]`.
- A batch processor has `execution_model: batch`, `memory.backend: ephemeral`, no streaming.

The members compose into recognizable agent archetypes. Splitting them into separate profiles (`memory:1.0`, `streaming:1.0`, etc.) fragments a coherent concept and forces ADL authors to declare 4–5 profiles where 1 suffices.

---

## 3. Profile Identity

| Field | Value |
|---|---|
| **Identifier** | `urn:adl:profile:runtime-ops:1.0` |
| **Status** | Draft |
| **ADL compatibility** | 0.1.x |
| **Dependencies** | None |
| **Composes with** | Governance, Registry, Portfolio, vendor profiles |

When this profile is declared in an ADL document's `profiles` array, the document **MUST** satisfy all requirements defined here.

---

## 4. Profile Members

### 4.1 `execution_model`

**REQUIRED** when this profile is declared.

A string declaring the agent's runtime execution model. Value **MUST** be one of:

| Value | Meaning |
|---|---|
| `request_response` | Stateless or session-scoped request/response cycles. The default model. |
| `long_running` | Maintains state across multiple invocations over hours or days; explicit shutdown required. |
| `batch` | Processes inputs in scheduled or triggered batches; agent instance is created per batch. |
| `event_driven` | Agent is instantiated in response to external events from a message broker or stream. |

Runtimes **MUST** honor the declared `execution_model` or refuse to provision the agent. A runtime that cannot support the declared model **MUST NOT** silently downgrade (e.g., running a `long_running` agent as `request_response`).

### 4.2 `max_session_duration_sec`

**REQUIRED** when `execution_model` is `long_running`. **OPTIONAL** otherwise.

A positive integer specifying the maximum session lifetime in seconds. Runtimes **MUST** terminate sessions exceeding this duration. Runtimes **SHOULD** emit a warning event before termination.

This member sits at the profile level, not inside `runtime.tool_invocation.timeout_ms`, because the latter is per-tool whereas session duration is per-agent-instance.

### 4.3 `trigger`

**REQUIRED** when `execution_model` is `event_driven` or `batch`. **OPTIONAL** otherwise.

An object describing the activation source for the agent.

| Member | Type | Required | Description |
|---|---|---|---|
| `type` | string | REQUIRED | Trigger source class |
| `source` | string | REQUIRED | URI of the trigger source |
| `schema_ref` | string | OPTIONAL | URI of a JSON Schema describing event payload shape |
| `filter` | object | OPTIONAL | Implementation-specific filter expression |

`type` **MUST** be one of: `event`, `schedule`, `webhook`, `queue`, `stream`, `manual`.

Examples:

```json
{ "trigger": { "type": "event",    "source": "pubsub://acme-events/invoices.received" } }
{ "trigger": { "type": "schedule", "source": "cron:0 */6 * * *" } }
{ "trigger": { "type": "queue",    "source": "amqp://broker.example.com/queue/work" } }
```

### 4.4 `memory`

**OPTIONAL.** When omitted, the agent declares no memory; runtimes **MUST NOT** persist agent state without an explicit `memory` declaration. This deny-by-default symmetry with `permissions` (core Section 9.1) is intentional.

| Member | Type | Required | Description |
|---|---|---|---|
| `backend` | string | REQUIRED | One of `none`, `ephemeral`, `session`, `long_term` |
| `store` | object | OPTIONAL | Backing store reference |
| `retention` | object | OPTIONAL | Retention controls (same shape as `data_classification.retention`) |
| `scope` | string | OPTIONAL | Memory isolation scope: `agent`, `user`, `session`, `tenant` |
| `pii_handling` | object | OPTIONAL | PII treatment policy |

#### `backend` values

| Value | Meaning |
|---|---|
| `none` | No memory; equivalent to omitting `memory` (declared for explicitness). |
| `ephemeral` | In-process; lost on session end. |
| `session` | Persisted for session lifetime; equivalent to thread/conversation memory. |
| `long_term` | Persisted across sessions until explicit deletion. |

#### `store`

When present, **MUST** contain `type` (string) and **MAY** contain `uri` (string), `region` (string).

`type` values (extensible, but standard set):

| Value | Examples |
|---|---|
| `vector_store` | Pinecone, Weaviate, Vertex AI Vector Search |
| `key_value` | Redis, DynamoDB, Memorystore |
| `document` | MongoDB, Firestore |
| `relational` | Postgres, BigQuery |
| `memory_bank` | Gemini Memory Bank, MemorySaver-equivalent |
| `custom` | Anything else; `uri` SHOULD be present |

#### `retention`

Same shape as core `data_classification.retention` (`min_days`, `max_days`, `policy_uri`). Memory retention SHOULD NOT exceed the data classification's retention policy.

#### `scope`

| Value | Meaning |
|---|---|
| `agent` | Single global memory across all invocations |
| `user` | Per-user memory; isolated by authenticated principal |
| `session` | Per-session memory; isolated by session identifier |
| `tenant` | Per-tenant memory; isolated by tenant identifier |

When omitted, `session` is assumed for `backend: session` and `agent` is assumed for `backend: long_term`.

#### `pii_handling`

When present, **MUST** be an object that **MAY** contain:

| Member | Type | Description |
|---|---|---|
| `redact` | boolean | Whether PII MUST be redacted before storage |
| `categories_excluded` | array of string | Data classification categories that MUST NOT be stored in memory (e.g., `["credentials", "phi"]`) |

If `pii_handling.categories_excluded` includes a category present in the top-level `data_classification.categories`, runtimes **MUST** ensure memory writes are filtered to exclude that category.

### 4.5 `streaming` (structured form)

**OPTIONAL.** When this profile is declared, the structured `streaming` form here **supersedes** the boolean `runtime.output_handling.streaming` in core ADL.

| Member | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean | REQUIRED | Whether the agent supports streaming responses |
| `protocols` | array of string | OPTIONAL | Supported streaming protocols |
| `modalities` | array of string | OPTIONAL | Streamed content modalities |

`protocols` values (extensible standard set): `sse`, `websocket`, `grpc_bidi`, `webrtc`.
`modalities` values (extensible standard set): `text`, `audio`, `video`, `image`.

When the core `runtime.output_handling.streaming` boolean is `true` and the structured form is absent, the equivalent value is `{ "enabled": true, "protocols": ["sse"], "modalities": ["text"] }`. When `false`, the equivalent is `{ "enabled": false }`. The core spec adds a polymorphic widening (see Section 5) so the boolean form remains valid for documents that do not declare this profile.

### 4.6 `protocols`

**OPTIONAL.** Array of protocol conformance declarations. Each entry **MUST** be an object containing `name` (string) and **MAY** contain `version` (string), `role` (`client | server | both`), `endpoint` (URI).

Known standard names (extensible): `mcp`, `a2a`, `ap2`. Vendor-defined protocol names **SHOULD** use reverse-domain notation (e.g., `com.acme.custom-rpc`).

Example:

```json
{
  "protocols": [
    { "name": "mcp", "version": "2025-06-18", "role": "client" },
    { "name": "a2a", "version": "1.0", "role": "server" },
    { "name": "ap2", "version": "1.0", "role": "client" }
  ]
}
```

This lives in the Runtime Operations Profile rather than core `metadata` because protocol conformance is operationally significant (affects runtime provisioning, gateway routing, capability negotiation) — not just descriptive metadata.

### 4.7 `policy_references`

**OPTIONAL.** Array of references to external policy documents evaluated by the runtime. Each entry **MUST** be an object:

| Member | Type | Required | Description |
|---|---|---|---|
| `type` | string | REQUIRED | Policy language identifier |
| `uri` | string | REQUIRED | URI to the policy document |
| `media_type` | string | OPTIONAL | IANA media type |
| `checksum` | object | OPTIONAL | `{ algorithm, value }` for integrity |
| `signature` | object | OPTIONAL | Same shape as core `security.attestation.signature` |

Known standard `type` values (extensible): `agt_policy_document`, `cedar`, `opa_rego`, `xacml`.

Policy references complement core `permissions` (Section 9). Core permissions describe the **static outcome floor** (allowed hosts, denied paths); policy references describe **dynamic policy evaluation** the runtime performs at each action. Runtimes that evaluate policy references **MUST** still enforce core `permissions` as the floor — referenced policies may further restrict, never expand, the core permission boundary.

---

## 5. Required Core Spec Change

This profile requires **one** backwards-compatible core change: widening `runtime.output_handling.streaming` (Section 11.2) to accept either a boolean or an object.

```text
Current: streaming (boolean)
New:     streaming (boolean | object)

If boolean true:  { "enabled": true,  "protocols": ["sse"], "modalities": ["text"] } (implicit)
If boolean false: { "enabled": false }                                                (implicit)
If object:        { "enabled": <bool>, "protocols": [...], "modalities": [...] }
```

The boolean form remains valid; existing documents do not break. The structured form is RECOMMENDED when the Runtime Operations Profile is declared.

No other core changes are required by this profile.

---

## 6. Conformance Requirements

| Rule | Description |
|---|---|
| RTOPS-01 | When this profile is declared, `execution_model` **MUST** be present. |
| RTOPS-02 | When `execution_model` is `long_running`, `max_session_duration_sec` **MUST** be present. |
| RTOPS-03 | When `execution_model` is `event_driven` or `batch`, `trigger` **MUST** be present. |
| RTOPS-04 | Runtimes **MUST NOT** persist agent state without an explicit `memory` declaration. |
| RTOPS-05 | When `memory.retention.max_days` is present, it **MUST NOT** exceed `data_classification.retention.max_days` if both are present. |
| RTOPS-06 | When `memory.pii_handling.categories_excluded` is present, runtimes **MUST** filter memory writes to exclude those categories. |
| RTOPS-07 | Streaming `protocols` values not in the standard set **MUST** use reverse-domain notation. |
| RTOPS-08 | `policy_references[*].uri` **MUST** be a valid URI [RFC3986]. |
| RTOPS-09 | Runtimes evaluating `policy_references` **MUST** continue to enforce core `permissions` as the floor (policies may restrict, never expand). |
| RTOPS-10 | When the structured `streaming` form is present in this profile, it **SHALL** supersede the core boolean form. |

---

## 7. Examples

### 7.1 Long-running event-driven agent with persistent memory

```json
{
  "adl_spec": "0.1.0",
  "name": "Invoice Processor",
  "description": "Reviews vendor invoices triggered by Pub/Sub events; maintains rolling reviewer memory.",
  "version": "2.0.0",
  "data_classification": { "sensitivity": "confidential", "categories": ["financial", "pii"] },
  "profiles": [
    "urn:adl:profile:runtime-ops:1.0",
    "urn:adl:profile:governance:1.0"
  ],
  "execution_model": "long_running",
  "max_session_duration_sec": 604800,
  "trigger": {
    "type": "event",
    "source": "pubsub://acme-events/invoices.received"
  },
  "memory": {
    "backend": "long_term",
    "store": { "type": "vector_store", "uri": "vertex://acme/memory" },
    "retention": { "max_days": 90, "policy_uri": "https://acme.example.com/memory-retention" },
    "scope": "tenant",
    "pii_handling": { "redact": true, "categories_excluded": ["credentials"] }
  },
  "streaming": { "enabled": false },
  "protocols": [
    { "name": "mcp", "version": "2025-06-18", "role": "client" }
  ]
}
```

### 7.2 Request/response chatbot with multi-protocol streaming

```json
{
  "execution_model": "request_response",
  "memory": { "backend": "session", "scope": "session" },
  "streaming": {
    "enabled": true,
    "protocols": ["sse", "websocket"],
    "modalities": ["text", "audio"]
  },
  "protocols": [
    { "name": "a2a", "version": "1.0", "role": "server" }
  ]
}
```

### 7.3 AGT-governed agent with external policy evaluation

```json
{
  "profiles": [
    "urn:adl:profile:runtime-ops:1.0",
    "urn:adl:profile:governance:1.0",
    "https://microsoft.com/adl/agt/v1"
  ],
  "execution_model": "request_response",
  "policy_references": [
    {
      "type": "agt_policy_document",
      "uri": "https://policy.acme.example.com/contract-reviewer/policy.yaml",
      "media_type": "application/vnd.microsoft.agt-policy+yaml",
      "checksum": { "algorithm": "SHA-256", "value": "9f2c..." }
    },
    {
      "type": "cedar",
      "uri": "https://policy.acme.example.com/contract-reviewer/policy.cedar"
    }
  ]
}
```

---

## 8. Alternatives

### A. Put everything in core ADL

Move `execution_model`, `memory`, structured `streaming`, `trigger`, `protocols`, `policy_references` into the core spec.

**Rejected.** Inflates the schema for the large fraction of ADL use cases that don't need runtime-operational members (static A2A cards, catalog entries). Commits core to architectural opinions (memory architecture, streaming protocols) that should evolve faster than the core SemVer cycle allows.

### B. Split into multiple narrow profiles

Create `urn:adl:profile:memory:1.0`, `urn:adl:profile:streaming:1.0`, `urn:adl:profile:execution:1.0`, `urn:adl:profile:protocols:1.0` separately.

**Rejected.** Profile proliferation. The members co-occur in recognizable archetypes (long-running event-driven, request/response chatbot, batch processor). Splitting forces authors to declare 4–5 profiles where 1 suffices. The "one concern per profile" rule should be applied at the level of *conceptual concerns*, not individual members; runtime operations is one concern.

### C. Extend the existing Governance Profile

Add these members to `urn:adl:profile:governance:1.0` (bumping to 1.1 or 2.0).

**Rejected.** Conflates compliance with operational characteristics. An agent can be highly governed without needing memory; an ephemeral chatbot can be ungoverned but have streaming. The Governance Profile's regulatory narrative (frameworks, autonomy tiers, audit trails) is diluted by injecting operational members. Keeping them sibling profiles preserves both narratives.

### D. Put them in vendor profiles only

Let each vendor (Google, Microsoft, AWS) define their own runtime-operations vocabulary in `https://vendor.com/adl/runtime/...`.

**Rejected.** The whole motivation for this proposal is that the gaps are *not* vendor-specific. Pushing universal concerns into vendor profiles fragments the ecosystem — every runtime ends up with a slightly different `memory` schema, and ADL loses its claim of portability.

### E. Add the polymorphic streaming widening only to this profile, not core

Keep core `runtime.output_handling.streaming` strictly boolean; have this profile define a separate `streaming` member at the top level.

**Rejected.** Creates two members with the same name in adjacent schemas, which is confusing. The polymorphic widening in core is small (one schema change), is backwards-compatible (boolean form remains valid), and unifies the model: ADL has one `streaming` declaration; this profile widens its expressiveness.

---

## 9. Impact on Companion Proposals

The two 2026-05-18 interop proposals are updated to reference this profile:

### From `2026-05-18-gemini-enterprise-interop.md`

| Original placement | New placement |
|---|---|
| G1 (`runtime.execution_model`, `runtime.max_session_duration_sec`, `runtime.trigger`) — core | Runtime Operations Profile §4.1–4.3 |
| G2 (`memory`) — core (top-level) | Runtime Operations Profile §4.4 |
| G4 (polymorphic `streaming`) — core | Core polymorphic widening (Section 5) + Runtime Operations Profile §4.5 (structured form) |
| G7 (`metadata.protocols[]`) — core metadata | Runtime Operations Profile §4.6 |
| G3 (deployment binding), G5 (prompt defense), G6 (composition) | Unchanged (deployment → vendor profile; prompt defense → core security; composition → future profile) |

### From `2026-05-18-microsoft-governance-toolkit-interop.md`

| Original placement | New placement |
|---|---|
| G5 (`security.policy_references[]`) — core security | Runtime Operations Profile §4.7 |
| All other gaps (G1, G2, G3, G4, G6, G7, G8) | Unchanged (most stay in Governance Profile; PQC and key validity stay in core) |

After these reassignments, the **core spec** changes from the two interop proposals reduce to:

1. PQC algorithm recommendations in §6.3 and §10.3 (from AGT proposal G2).
2. `public_key.not_before` / `not_after` in §6.3 (from AGT proposal G2 / G4).
3. `lifecycle.rotation_policy` in §5.6 (from AGT proposal G4).
4. `security.prompt_defense` in §10 (from Gemini proposal G5).
5. Polymorphic widening of `runtime.output_handling.streaming` in §11.2 (from this proposal, §5).

That is the complete, minimal set of core changes — five additive, backwards-compatible items.

---

## 10. References

- ADL Specification: `versions/0.1.0/spec.md`
- ADL Governance Profile: `profiles/governance/1.0/profile.md`
- ADL Registry Profile: `profiles/registry/1.0/profile.md`
- ADL Portfolio Profile: `profiles/portfolio/`
- Companion proposal: `proposals/2026-05-18-gemini-enterprise-interop.md`
- Companion proposal: `proposals/2026-05-18-microsoft-governance-toolkit-interop.md`
- Vendor Extensions Proposal: `proposals/2026-03-14-vendor-extensions.md`
- [Model Context Protocol](https://modelcontextprotocol.io/specification)
- [A2A Protocol](https://a2a-protocol.org/latest/specification/)
- [Google Cloud — Gemini Enterprise Agent Platform](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform)
- [Microsoft Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit/)
- [Cedar Policy Language](https://www.cedarpolicy.com/)
- [Open Policy Agent / Rego](https://www.openpolicyagent.org/)
- [RFC 3986 — URI Generic Syntax](https://www.rfc-editor.org/info/rfc3986)
