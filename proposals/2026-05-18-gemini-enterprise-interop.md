# Proposal: ADL Interoperability with Google Gemini Enterprise Agent Platform

**Date:** 2026-05-18
**Status:** Draft
**ADL Version:** 0.1.0
**Affects:** `versions/0.1.0/spec.md`, `versions/0.1.0/schema.json`, `profiles/` (new `runtime/gemini-enterprise` vendor profile recommended)
**Companion proposals:** `2026-05-18-runtime-operations-profile.md` (defines `urn:adl:profile:runtime-ops:1.0`, which is where most of this proposal's recommendations land); `2026-05-18-microsoft-governance-toolkit-interop.md`

> **Note (2026-05-18, post-review):** During review, the universal-vs-vendor-specific split in this proposal was extracted into a new **Runtime Operations Profile** proposal (`2026-05-18-runtime-operations-profile.md`). Recommendations for G1, G2, G4, and G7 below were originally framed as core spec additions; they are now scoped to the Runtime Operations Profile. The remaining recommendations (G3, G5, G6) are unchanged. Section 5 below has been updated to reflect the new placements.

---

## 1. Summary

Google announced the Gemini Enterprise Agent Platform in May 2026, introducing a managed runtime composed of an **Agent Registry**, **Agent Gateway**, **Agent Sandbox**, **Agent Runtime**, **Agent Memory Bank**, **Agent Identity** (cryptographic), **Model Armor**, and a developer surface comprising **Agent Studio**, **Agent Development Kit (ADK)**, and **Agent Garden** templates. The platform consumes agent definitions through ADK / Agent Studio rather than a published portable manifest; however, every Gemini Enterprise primitive maps to an ADL member, and a portable ADL document can be transformed into a Gemini Enterprise agent through a vendor adapter.

This proposal (a) defines an ADL → Gemini Enterprise mapping for every Gemini primitive, (b) recommends authoring a `runtime/gemini-enterprise` vendor profile (per the 2026-03-14 vendor-extensions proposal) so platform-specific declarations are validated, and (c) identifies five gaps in the current ADL specification that Gemini Enterprise exposes: long-running agent semantics, sub-agent / graph composition, agent memory, streaming protocol declaration, and a payment-protocol attachment point. Filling these gaps strengthens ADL's claim of portability across managed agent platforms.

---

## 2. Motivation

ADL's stated goals (Section 1.2) include **portability** ("describe agents independent of any specific runtime") and **interoperability** ("can be transformed into other formats … and consumed by diverse tooling"). The IMPLEMENTATIONS.md file already commits ADL to A2A Agent Cards and MCP server configuration generation. Gemini Enterprise is the largest managed agent runtime announced in 2026 and a credible reference target for proving ADL portability.

Three forces motivate this proposal now:

1. **Validation of the core spec.** Mapping ADL to a real, large managed runtime stress-tests the spec. Where Gemini Enterprise has a concept and ADL does not, either (a) ADL is consciously narrower, or (b) ADL has a gap. Section 4 below catalogs both.

2. **Vendor profile demand.** The 2026-03-14 vendor-extensions proposal introduces `extensions` objects keyed by reverse-domain namespace and a vendor-profile composition mechanism. A `runtime/gemini-enterprise` vendor profile would be the second concrete consumer of that proposal (the first being the unnamed acme example) and would validate the mechanism against a real platform's surface area.

3. **Standardization narrative.** ADL's pitch to LF AAIF, IETF, and ISO is strengthened by demonstrating that the spec already captures the working primitives of the platforms enterprises are deploying — not just generic AI agent theory.

---

## 3. Mapping ADL to Gemini Enterprise

The following table maps every Gemini Enterprise primitive named in Google's May 2026 announcement to its ADL equivalent.

| Gemini Enterprise Primitive | ADL Equivalent | Coverage | Notes |
|-----------------------------|----------------|----------|-------|
| **Agent Identity** (cryptographic ID + authorization policies) | `cryptographic_identity` (Section 6.3), `id` (6.1) | Full | ADL Ed25519 recommendation aligns with platform's cryptographic identity model. |
| **Agent Registry** (central library of approved tools/skills/agents) | Registry Profile (`urn:adl:profile:registry:1.0`) | Full | `registry.catalog_id`, `catalog_classification`, `visibility`, `federation` map directly. |
| **Agent Gateway** (policy enforcement) | `permissions` (Section 9), `security` (Section 10) | Partial | Gateway enforces ADL-declared boundaries; ADL does not declare which gateway URI enforces them. See Gap G3 (deployment binding). |
| **Agent Sandbox** (isolated execution) | `permissions.execution` (Section 9.5), `permissions.resource_limits` (9.6) | Full | `allowed_commands`, `allow_shell`, `max_memory_mb`, `max_cpu_percent`, `max_duration_sec` express sandbox configuration. |
| **Agent Runtime** (provisioning, cold start, long-running) | `runtime` (Section 11), `lifecycle` (5.6) | **Partial — Gap G1** | ADL has no concept of an agent that maintains state for days; `lifecycle.status` is a deployment state, not a runtime state. |
| **Agent Memory Bank** + **Memory Profiles** (long-term conversational memory) | None | **Missing — Gap G2** | ADL has no member to declare memory backing store, retention semantics, or memory profile/scope. |
| **Agent Sessions** (custom session IDs to internal DB/CRM) | None | **Missing** | No `session` declaration. Implicit in `runtime` but never specified. See Gap G2. |
| **Bidirectional Streaming** (WebSocket live audio/video) | `runtime.output_handling.streaming` (boolean) | **Partial — Gap G4** | ADL declares whether streaming is supported, not which protocol (SSE, WebSocket, gRPC, WebRTC), nor which modalities. |
| **Model Garden** (200+ models) | `model.provider`, `model.name`, `model.version` (Section 7.1) | Full | A Gemini Enterprise document selects models from Model Garden; ADL names them. |
| **Model Armor** (prompt injection / leakage protection) | `runtime.input_handling.sanitization` (Section 11.1) | Partial | ADL `sanitization` is restricted to `enabled`, `strip_html`, `max_input_length`. Prompt-injection defenses are not enumerable. See Gap G5. |
| **Sub-agent networks** (graph-based hierarchies) | None | **Missing — Gap G6** | ADL describes a single agent. There is no `sub_agents`, `composes`, or `orchestrates` member, and no relationship-graph profile. The Portfolio Profile expresses business relationships, not runtime sub-agent invocation. |
| **Agent Studio / ADK / Agent Garden** (developer surface) | Out of scope | N/A | These are authoring tools; ADL is the artifact they emit. |
| **Agent Simulation / Evaluation / Observability / Optimizer** | Out of scope (operational tooling) | N/A | ADL declares the agent; these tools observe and improve it. ADL `metadata` may carry pointers (e.g., evaluation report URI). |
| **Model Context Protocol (MCP)** | Tools/resources/prompts (Section 8) | Full | Already aligned per IMPLEMENTATIONS.md. |
| **Agent Payment Protocol (AP2)** | None | **Missing — Gap G7** | ADL has no payment-protocol declaration. AP2 is the second protocol (after MCP and A2A) that an agent might declare conformance to. |

### 3.1 Round-trip example

A minimal Gemini Enterprise agent — "Invoice Processor" deployed via Agent Runtime with MCP connectivity to an ERP — expressed as a portable ADL document:

```json
{
  "adl_spec": "0.1.0",
  "$schema": "https://adl-spec.org/0.1/schema.json",
  "id": "https://acme.example.com/agents/invoice-processor",
  "name": "Invoice Processor",
  "description": "Reviews vendor invoices and routes for approval. Long-running, Memory-Bank-backed.",
  "version": "2.0.0",
  "data_classification": {
    "sensitivity": "confidential",
    "categories": ["financial", "pii"]
  },
  "cryptographic_identity": {
    "did": "did:web:acme.example.com:agents:invoice-processor",
    "public_key": {
      "algorithm": "Ed25519",
      "value": "MCowBQYDK2VwAyEAGb9ECWmEzf6FQbrBZ9w7lshQhqowtrbLDFw4rXAxZuE="
    }
  },
  "model": {
    "provider": "google",
    "name": "gemini-3.1-pro",
    "context_window": 1000000,
    "capabilities": ["function_calling", "vision", "streaming"]
  },
  "tools": [
    {
      "name": "search_invoices",
      "description": "Search invoices by vendor or date range.",
      "annotations": {
        "openapi_ref": "https://api.acme.example.com/openapi.json",
        "operation_id": "searchInvoices"
      },
      "read_only": true,
      "data_classification": { "sensitivity": "confidential" }
    }
  ],
  "permissions": {
    "network": {
      "allowed_hosts": ["api.acme.example.com", "*.googleapis.com"],
      "allowed_ports": [443],
      "allowed_protocols": ["https"],
      "deny_private": true
    },
    "resource_limits": {
      "max_memory_mb": 2048,
      "max_cpu_percent": 50,
      "max_duration_sec": 604800
    }
  },
  "security": {
    "authentication": { "type": "oauth2", "required": true },
    "encryption": { "in_transit": { "required": true, "min_version": "TLS1.3" } }
  },
  "profiles": [
    "urn:adl:profile:runtime-ops:1.0",
    "urn:adl:profile:registry:1.0",
    "urn:adl:profile:governance:1.0",
    "https://google.com/adl/gemini-enterprise/v1"
  ],
  "registry": {
    "catalog_id": "urn:acme:agents:invoice-processor:2.0.0",
    "visibility": "internal"
  },
  "execution_model": "long_running",
  "max_session_duration_sec": 604800,
  "trigger": {
    "type": "event",
    "source": "pubsub://acme-events/invoices.received"
  },
  "memory": {
    "backend": "long_term",
    "store": { "type": "memory_bank", "uri": "vertex://acme/memory" },
    "retention": { "max_days": 30 },
    "scope": "tenant"
  },
  "streaming": {
    "enabled": true,
    "protocols": ["websocket"],
    "modalities": ["text", "audio"]
  },
  "protocols": [
    { "name": "mcp", "version": "2025-06-18", "role": "client" }
  ],
  "x_google_gemini_enterprise": {
    "gateway": "https://gateway.acme.example.com"
  }
}
```

The `x_google_gemini_enterprise` member (or, after the vendor-extensions proposal lands, `extensions["com.google.gemini-enterprise"]`) carries platform-specific declarations that the proposed vendor profile would validate.

---

## 4. Gaps in ADL Exposed by Gemini Enterprise

### G1 — Long-running agents

**Observation.** Gemini Enterprise distinguishes three runtime classes: request/response, **long-running** (multi-day workflows with persistent state), and **batch/event-driven** (triggered by BigQuery / Pub/Sub). ADL `runtime` cannot express the runtime class, the maximum runtime duration (`runtime.tool_invocation.timeout_ms` applies per tool, not per agent), the trigger event source, or whether the agent maintains state across invocations.

**Recommendation.** Add `execution_model` (enum: `request_response | long_running | batch | event_driven`), `max_session_duration_sec`, and `trigger` (object) **to the Runtime Operations Profile** (`urn:adl:profile:runtime-ops:1.0`), not core. See the runtime-operations-profile proposal §4.1–4.3 for the canonical definitions.

```json
{
  "profiles": ["urn:adl:profile:runtime-ops:1.0"],
  "execution_model": "long_running",
  "max_session_duration_sec": 604800,
  "trigger": {
    "type": "event",
    "source": "pubsub://acme-events/invoices.received"
  }
}
```

See also: AWS Bedrock Agents, Azure AI Foundry agents, and AutoGen long-running orchestrations have the same need. This is not Gemini-specific — which is why the home is a sibling profile, not core.

### G2 — Agent memory

**Observation.** Memory is a first-class concept in every modern agent runtime (Memory Bank in Gemini, episodic memory in Microsoft's toolkit, threads in OpenAI Assistants, AgentMemory in CrewAI, MemorySaver in LangGraph). ADL has zero memory primitives. This is the largest concrete gap.

**Recommendation.** Add a top-level `memory` object **in the Runtime Operations Profile** (`urn:adl:profile:runtime-ops:1.0`, §4.4). Originally proposed for core; moved to the profile because memory is an architectural commitment that not every ADL document (e.g., A2A Agent Cards) needs, and architectural opinions belong outside core.

The profile defines `memory` with `backend` (REQUIRED enum: `none | ephemeral | session | long_term`), `store`, `retention` (same shape as `data_classification.retention`), `scope` (`agent | user | session | tenant`), and `pii_handling` (`redact`, `categories_excluded`). Deny-by-default semantics — when omitted, no state may be persisted — match `permissions` (core Section 9.1).

See the runtime-operations-profile proposal §4.4 for the canonical definition.

### G3 — Deployment / gateway binding

**Observation.** Gemini Enterprise's Agent Gateway is the URI through which the agent is reachable and where permissions are enforced. ADL describes the agent abstractly; it does not declare where the agent is deployed or what URI it answers at after deployment. The `id` member (Section 6.1) is the identifier, not the endpoint.

**Recommendation.** This is a **deployment-time concern**, not an ADL-document concern. The portable ADL document should not encode a gateway URI. Vendor profiles (per the vendor-extensions proposal) are the right place for `x_google_gemini_enterprise.gateway` or equivalent. No core spec change recommended; document this explicitly in Section 15 (Interoperability) so the boundary is clear.

### G4 — Streaming protocol declaration

**Observation.** `runtime.output_handling.streaming` is a boolean. It cannot express whether the agent supports SSE, WebSocket, gRPC bidirectional, or WebRTC, nor which modalities (text-only, audio, video).

**Recommendation.** Two coordinated changes:

1. **Core (small):** widen `runtime.output_handling.streaming` (Section 11.2) from boolean to `boolean | object` for backwards compatibility. `true` is equivalent to `{ "enabled": true, "protocols": ["sse"], "modalities": ["text"] }`; `false` is equivalent to `{ "enabled": false }`. The existing boolean form remains valid.
2. **Runtime Operations Profile (§4.5):** define the structured form's full schema (`enabled`, `protocols[]` — sse/websocket/grpc_bidi/webrtc, `modalities[]` — text/audio/video/image). When the profile is declared, the structured form supersedes the boolean.

This split keeps core minimal (one polymorphic widening) while the expressive vocabulary evolves in the profile.

### G5 — Prompt-injection defense declaration

**Observation.** `runtime.input_handling.sanitization` exposes `enabled`, `strip_html`, `max_input_length`. Gemini's **Model Armor** explicitly handles prompt-injection and data-leakage detection. There is no ADL way to declare "prompt-injection defenses required" as a security control.

**Recommendation.** Add `security.prompt_defense` (object) with `required: bool`, `mechanisms: array` (e.g., `["input_filtering", "instruction_isolation", "output_filtering"]`), and `enforcement: string` (`runtime | external`). This belongs in `security` (Section 10), not `runtime.input_handling`, because it is a security control, not an input-shape constraint. Microsoft's PromptDefense Evaluator and OWASP Agentic Top 10 (ASI-05, "Insecure Output Handling") give the same signal.

### G6 — Sub-agent and graph composition

**Observation.** Gemini Enterprise's sub-agent networks, Microsoft's AgentMesh, LangGraph, CrewAI hierarchies, and OpenAI's Swarm all express agents that invoke or coordinate other agents. ADL describes a single agent. The Portfolio Profile expresses business-level relationships (parent/child/dependency) but not runtime invocation.

**Recommendation.** Defer to a future **Composition Profile** (e.g., `urn:adl:profile:composition:1.0`) rather than adding to the core spec. The composition profile would define:

- `sub_agents[]` — array of `{ id, role, invocation_policy, required }`
- `coordination` — `{ pattern: "sequential" | "parallel" | "graph" | "supervisor", entry_point }`
- `delegation_policy` — when an agent may invoke a sub-agent, autonomy escalation rules

This is intentionally out of scope for this proposal but should be tracked in `standardization/roadmap.md`.

### G7 — Payment protocol declaration

**Observation.** Gemini announced **Agent Payment Protocol (AP2)** alongside the platform. Like MCP and A2A, AP2 is a protocol an agent may conform to. ADL has no general mechanism to declare "this agent speaks protocol X."

**Recommendation.** Add `protocols[]` **to the Runtime Operations Profile** (§4.6), not core metadata. Originally proposed for `metadata.protocols`; moved because protocol conformance is operationally significant (affects runtime provisioning, gateway routing, capability negotiation) rather than purely descriptive.

```json
{
  "profiles": ["urn:adl:profile:runtime-ops:1.0"],
  "protocols": [
    { "name": "mcp", "version": "2025-06-18", "role": "client" },
    { "name": "a2a", "version": "1.0", "role": "server" },
    { "name": "ap2", "version": "1.0", "role": "client" }
  ]
}
```

Each entry **MUST** contain `name` and **MAY** contain `version`, `role` (`client | server | both`), `endpoint`. Vendor-defined names **SHOULD** use reverse-domain notation. This is a lightweight addition that scales to future protocols without further spec changes. See the runtime-operations-profile proposal §4.6.

---

## 5. Proposed Spec Additions (Summary)

Reflects the 2026-05-18 reassignment to the Runtime Operations Profile.

| Change | Location | Type | Priority |
|--------|----------|------|----------|
| Polymorphic widening of `runtime.output_handling.streaming` | **Core §11.2** | Backwards-compatible widening | Medium |
| Add `security.prompt_defense` | **Core §10 (new §10.5)** | Additive | Medium |
| Add `execution_model`, `max_session_duration_sec`, `trigger` | **Runtime Operations Profile §4.1–4.3** | New profile members | High |
| Add `memory` (top-level under profile) | **Runtime Operations Profile §4.4** | New profile member | **High** |
| Add structured `streaming` form | **Runtime Operations Profile §4.5** | New profile member | Medium |
| Add `protocols[]` | **Runtime Operations Profile §4.6** | New profile member | Medium |
| Track Composition Profile in roadmap | `standardization/roadmap.md` | Roadmap | Low for spec, high for ecosystem |
| Author `runtime/gemini-enterprise` vendor profile | `profiles/runtime/gemini-enterprise/` | New profile | Depends on vendor-extensions proposal |
| Document deployment-time concerns in Section 15 | Core §15 | Clarification | Low |

Net core spec impact is now small (one polymorphic widening + one new security subsection). The bulk of the surface area lands in the Runtime Operations Profile, which evolves independently of core SemVer. All changes remain additive — no major version bump for the 7 gaps. Memory (G2) is still the highest-priority addition because it is universal across runtimes, not Gemini-specific.

---

## 6. Alternatives

### A. Do nothing; rely on vendor profiles

Treat every gap as vendor-profile territory. A `runtime/gemini-enterprise` profile would carry `memory`, `streaming.protocol`, `execution_model`, etc.

**Rejected because:** memory, streaming protocols, execution models, and prompt defenses are universal across runtimes (verified against Microsoft, AWS, OpenAI, Anthropic, AutoGen, LangGraph, CrewAI). Pushing universal concerns into vendor profiles fragments the ecosystem — every runtime defines its own `memory` schema with subtle differences. Core ADL exists precisely to prevent this.

### B. Single `runtime_class` enum that bundles execution_model + memory + streaming

Define `runtime.class` = `"chatbot" | "long_running_assistant" | "batch_processor" | "voice_agent"`, with implicit defaults for memory and streaming per class.

**Rejected because:** runtime classes do not compose. A long-running voice agent with batch fallback exists. Discrete orthogonal members compose; bundled classes do not.

### C. Adopt Google's ADK schema directly as ADL's vendor profile

Mirror Google ADK YAML/proto verbatim in a `runtime/gemini-enterprise` profile.

**Rejected because:** Google has not published a portable ADK manifest format in the announcement. The platform consumes Python code via ADK and visual definitions via Agent Studio. There is nothing to mirror. The vendor profile must be authored from the platform's documented primitives, not its developer surface.

### D. Defer memory to a separate proposal

Split G2 into its own document.

**Considered.** Memory is significant enough (3 sub-objects, deny-by-default semantics, cross-runtime alignment) that a dedicated proposal may be warranted. If adopted, this proposal should retain memory in Section 4 as the motivating finding but defer the schema work. Recommendation: keep memory here in Section 5 as a high-level shape; spin out a follow-on proposal for the full schema if the maintainers prefer.

---

## 7. References

- [Google Cloud — Introducing Gemini Enterprise Agent Platform (May 2026)](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform)
- [Agent Development Kit (ADK) — Google](https://google.github.io/adk-docs/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification)
- [A2A Protocol](https://a2a-protocol.org/latest/specification/)
- ADL Specification: `versions/0.1.0/spec.md` (Sections 6, 7, 9, 10, 11, 12, 13)
- ADL Registry Profile: `profiles/registry/1.0/profile.md`
- ADL Governance Profile: `profiles/governance/1.0/profile.md`
- Vendor Extensions Proposal: `proposals/2026-03-14-vendor-extensions.md`
- Critical Gap Remediation Proposal: `proposals/2026-02-16-critical-gap-remediation.md`
- ADL Implementations: `IMPLEMENTATIONS.md`
