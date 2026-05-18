# Proposal: ADL Interoperability with Microsoft Agent Governance Toolkit

**Date:** 2026-05-18
**Status:** Draft
**ADL Version:** 0.1.0
**Affects:** `versions/0.1.0/spec.md`, `versions/0.1.0/schema.json`, `profiles/governance/1.0/profile.md`, `profiles/governance/1.0/schema.json`, `profiles/registry/1.0/profile.md` (potentially), new `runtime/microsoft-agt` vendor profile recommended
**Companion proposals:** `2026-05-18-runtime-operations-profile.md` (defines `urn:adl:profile:runtime-ops:1.0`, the new home for G5); `2026-05-18-gemini-enterprise-interop.md`

> **Note (2026-05-18, post-review):** During review, the universal-vs-vendor-specific split surfaced by this proposal and the Gemini proposal was extracted into a new **Runtime Operations Profile** (`2026-05-18-runtime-operations-profile.md`). Recommendation G5 (`policy_references`) was originally framed as a `security` core addition; it now lives in the Runtime Operations Profile §4.7. All other recommendations in this proposal are unchanged — they remain in core or the Governance Profile as originally proposed. Section 5 below has been updated to reflect the new placement.

---

## 1. Summary

Microsoft published the **Agent Governance Toolkit (AGT)** in May 2026 — an application-level governance runtime that ships a `PolicyDocument` evaluator, an **AgentMesh** identity layer (Ed25519 + ML-DSA-65 quantum-safe credentials, SPIFFE/SVID, trust scoring), an **Agent Lifecycle** package (provisioning → credential rotation → orphan detection → decommissioning), a **PromptDefense Evaluator**, a **flight recorder** audit primitive, and a **red-team CLI** that grades agents against the OWASP Agentic Top 10. AGT explicitly targets evidence generation for the EU AI Act, NIST AI RMF, Colorado AI Act, SOC 2 Type II, and OpenSSF Best Practices.

ADL's Governance Profile (`urn:adl:profile:governance:1.0`) already covers a large fraction of AGT's surface — compliance frameworks, autonomy tiers, human oversight, risk classification, and incident response are direct equivalents. However, AGT exposes seven concrete gaps in the current ADL/Governance Profile combination: (1) **policy rules** as first-class ADL objects, (2) **post-quantum cryptographic algorithm** declaration, (3) **trust scoring**, (4) **credential rotation** and orphan-detection schedules, (5) **OWASP Agentic Top 10** as a structured control mapping vocabulary, (6) **evidence artifact** declarations (analogous to `governance_record_ref`), and (7) **kill switch / execution rings** as a runtime control. This proposal maps AGT to ADL primitive-by-primitive and proposes targeted spec and Governance Profile additions to close those gaps without changing ADL's core posture.

---

## 2. Motivation

The Governance Profile was authored before any production agent governance runtime existed. AGT is the first toolkit shipped by a hyperscaler that is **fully open-source** (Microsoft Apache-2.0), explicitly declarative (PolicyDocument YAML, Cedar, OPA/Rego), and instruments the OWASP Agentic Top 10 as a measurable control catalog. It is also the first that claims **post-quantum cryptographic identity** (ML-DSA-65) and ships a working **red-team grading CLI** as part of the governance lifecycle.

If ADL is to be the portable description that AGT consumes and emits — and if ADL's Governance Profile is to remain credible to the regulators it cites (EU AI Act, NIST AI RMF, ISO 42001) — the profile must express what AGT instruments. The IMPLEMENTATIONS.md commitments to A2A and MCP set the precedent: a governance toolkit at this scale is a reference target.

Three concrete motivations:

1. **Compliance evidence portability.** AGT generates `agt-evidence.json` artifacts. ADL Governance Profile's `governance_record_ref` is the right anchor, but the evidence artifact shape is not specified. Closing this gap means an ADL document can act as the cover sheet for an AGT evidence bundle.

2. **OWASP Agentic Top 10 alignment.** AGT advertises 10/10 coverage. The Governance Profile's `compliance_framework.primary_framework` enum (`NIST_800_53`, `SOC2_TYPE_II`, etc.) does not include OWASP Agentic Top 10 as a framework, even though it is the most agent-specific control catalog in production use.

3. **Quantum-safe identity.** ADL Section 6.3 (`cryptographic_identity`) recommends Ed25519 and rejects RSA < 2048. It is silent on post-quantum algorithms (ML-DSA, ML-KEM, SLH-DSA). AGT ships ML-DSA-65 by default. Without a path to declare a post-quantum public key, ADL documents cannot represent AGT-provisioned agents faithfully.

---

## 3. Mapping ADL to Microsoft Agent Governance Toolkit

### 3.1 Direct equivalences (already covered)

| AGT Primitive | ADL Equivalent | Notes |
|---------------|----------------|-------|
| Compliance evidence for EU AI Act, NIST AI RMF, SOC 2, Colorado AI Act | Governance Profile `compliance_framework.primary_framework` enum | EU AI Act, NIST AI RMF, SOC 2 already in enum. Colorado AI Act missing. |
| 4-tier execution privilege rings | Governance Profile `autonomy.tier` (1–3) + `risk_classification.autonomy_level` (L0–L5) | ADL has both coarse (3-tier) and fine (6-level) scales; AGT's 4 rings map cleanly to `autonomy_level`. |
| Human-Agent Trust Deficit (ASI-09) controls | Governance Profile `human_oversight` (Section 2.4) | `level`, `triggers`, `response_time_minutes`, `intervention_model` cover the requirement. |
| Goal Hijacking (ASI-01) policy enforcement | ADL `permissions` + Governance Profile `autonomy.basis` | The declarative side is covered; the enforcement is runtime. |
| Excessive Capabilities (ASI-02) — least-privilege | ADL `permissions` (deny-by-default, Section 9) | Direct match. |
| Identity Abuse (ASI-03) | `cryptographic_identity` (Section 6.3) | Direct match for the declarative side; quantum-safe algorithms missing (see G2). |
| Insecure Output Handling (ASI-05) | `runtime.input_handling.sanitization`, `runtime.output_handling` | Partial; output filtering is not enumerable. |
| Memory Poisoning (ASI-06) | None | Depends on the proposed `memory` object (see Gemini Enterprise proposal, G2). |
| Unsafe Inter-Agent Communication (ASI-07) | `security.encryption.in_transit` | Direct match for the channel encryption requirement. |
| Cascading Failures (ASI-08) | `runtime.error_handling`, `runtime.tool_invocation.retry_policy` | Partial; circuit breaker is not expressible. |
| Rogue Agents (ASI-10) | `lifecycle.status: retired` | Partial; kill-switch is a runtime control, not declared. See G7. |
| Agent Registry (catalog) | Registry Profile `urn:adl:profile:registry:1.0` | Direct match. |
| Audit trails / flight recorder | Governance Profile `governance_record_ref`, ADL `metadata` | Partial; evidence artifact shape unspecified. See G6. |
| Agent Lifecycle (provisioning → decommissioning) | ADL `lifecycle` (Section 5.6) | Partial; credential rotation and orphan-detection schedule are unspecified. See G4. |

### 3.2 Round-trip example

An AGT-governed agent expressed as ADL, using the current Governance Profile plus a vendor profile for AGT-specific declarations:

```json
{
  "adl_spec": "0.1.0",
  "$schema": "https://adl-spec.org/0.1/schema.json",
  "id": "https://acme.example.com/agents/contract-reviewer",
  "name": "Contract Reviewer",
  "description": "Reviews vendor contracts for risk flags. Governed by Microsoft AGT in PolicyDocument mode.",
  "version": "1.3.0",
  "data_classification": {
    "sensitivity": "confidential",
    "categories": ["intellectual_property", "regulatory"]
  },
  "cryptographic_identity": {
    "did": "did:web:acme.example.com:agents:contract-reviewer",
    "public_key": {
      "algorithm": "Ed25519",
      "value": "MCowBQYDK2VwAyEAGb9ECWmEzf6FQbrBZ9w7lshQhqowtrbLDFw4rXAxZuE="
    }
  },
  "profiles": [
    "urn:adl:profile:governance:1.0",
    "urn:adl:profile:registry:1.0",
    "https://microsoft.com/adl/agt/v1"
  ],
  "compliance_framework": {
    "primary_framework": "EU_AI_ACT",
    "control_mappings": [
      { "framework": "OWASP_AGENTIC_TOP_10", "control_id": "ASI-02", "status": "implemented" },
      { "framework": "OWASP_AGENTIC_TOP_10", "control_id": "ASI-03", "status": "implemented" }
    ]
  },
  "autonomy": {
    "tier": 2,
    "basis": "Reviews contracts independently; escalates above $50k contract value or restricted IP categories.",
    "classified_by": "AI Risk Committee",
    "classified_at": "2026-05-01T00:00:00Z"
  },
  "risk_classification": {
    "level": "high",
    "autonomy_level": "L3"
  },
  "human_oversight": {
    "level": "on_exception",
    "triggers": [
      "Contract value exceeds $50,000",
      "Restricted IP category detected"
    ],
    "response_time_minutes": 60,
    "intervention_model": "approve_reject"
  },
  "governance_record_ref": "https://registry.acme.example.com/governance/contract-reviewer/1.3.0",
  "x_microsoft_agt": {
    "policy_document_uri": "https://policy.acme.example.com/contract-reviewer/policy.yaml",
    "agentmesh": {
      "trust_score_minimum": 750,
      "credential_algorithm": "ML-DSA-65",
      "spiffe_id": "spiffe://acme.example.com/contract-reviewer"
    },
    "ring": 2,
    "kill_switch_uri": "https://gateway.acme.example.com/kill/contract-reviewer",
    "red_team_grade": "A",
    "evidence_bundle_uri": "https://evidence.acme.example.com/contract-reviewer/1.3.0/agt-evidence.json"
  }
}
```

---

## 4. Gaps in ADL Exposed by Microsoft AGT

### G1 — OWASP Agentic Top 10 as a framework enum value

**Observation.** The Governance Profile's `compliance_framework.primary_framework` enum (Section 2.1) includes NIST 800-53, SOC 2, ISO 27001, ISO 42001, GDPR, HIPAA, PCI-DSS, EU AI Act, IMDA Agentic, NIST AI RMF. It does **not** include OWASP Agentic Top 10. AGT advertises 10/10 OWASP Agentic coverage as its headline metric. Other agent runtimes (CrewAI, AutoGen) increasingly cite OWASP Agentic.

**Recommendation.** Add `OWASP_AGENTIC_TOP_10` to the `primary_framework` enum. Also add to `control_mappings[].framework`. The control IDs (`ASI-01` through `ASI-10`) are stable, public, and machine-readable.

While at it, add `COLORADO_AI_ACT` to the enum (AGT cites it explicitly; it is a 2026 regulatory milestone).

### G2 — Post-quantum cryptographic algorithm declaration

**Observation.** ADL Section 6.3 names Ed25519, Ed448, ES256/384/512, RS256, PS256. NIST published the final ML-DSA (Dilithium), ML-KEM (Kyber), and SLH-DSA (SPHINCS+) standards in August 2024 (FIPS 204, 203, 205). AGT ships `ML-DSA-65` by default. CISA's PQC migration guidance mandates inventory by 2027.

**Recommendation.** Expand the recommended-algorithm list in Section 6.3 and Section 10.3 (attestation signature) to include `ML-DSA-44`, `ML-DSA-65`, `ML-DSA-87`, `SLH-DSA-SHA2-128s`, `SLH-DSA-SHA2-192s`, `SLH-DSA-SHA2-256s`. Update normative text:

> Implementations **SHOULD** support at least one classical (Ed25519 RECOMMENDED) and at least one post-quantum (ML-DSA-65 RECOMMENDED) signature algorithm. Hybrid keys MAY be represented as two `public_key` entries when wrapped in an array; the schema for hybrid keys is reserved for a future revision.

Add `key_validity` (object: `not_before`, `not_after` — ISO 8601) to `public_key` to enable credential-rotation declarations (see G4).

### G3 — Trust scoring

**Observation.** AGT computes a per-agent trust score (0–1000) from credential validity, behavioral signals, red-team grade, and policy-violation history. Gemini Enterprise's Agent Identity is similar in spirit. ADL has no place to declare a trust score, a required trust floor for counterparty interactions, or the issuer of the trust assessment.

**Recommendation.** Add `trust` (object) to the Governance Profile (new Section 2.x):

| Member            | Type    | Required | Description |
|-------------------|---------|----------|-------------|
| score             | number  | OPTIONAL | Current trust score, 0–1000 |
| issuer            | string  | OPTIONAL | URI of the entity that issued the score |
| issued_at         | string  | OPTIONAL | ISO 8601 timestamp |
| valid_until       | string  | OPTIONAL | ISO 8601 expiry |
| minimum_for_invocation | number | OPTIONAL | Floor a calling agent must meet |
| method_uri        | string  | OPTIONAL | URI of the scoring methodology |

Trust scoring is governance, not core security; placing it in the Governance Profile is correct. Counterparty agents validating an invoker's `trust.score >= minimum_for_invocation` is the use case AGT's AgentMesh exemplifies.

### G4 — Credential rotation and lifecycle stages

**Observation.** ADL `lifecycle.status` (Section 5.6) is a coarse state machine: `draft → active → deprecated → retired`. AGT's Agent Lifecycle is finer: provisioning → **credential rotation** → **orphan detection** → decommissioning. Credential rotation in particular has a cadence and a `valid_until` that ADL cannot express.

**Recommendation.** Two additive changes:

1. Add `cryptographic_identity.public_key.not_before` and `not_after` (per G2).
2. Add an OPTIONAL `lifecycle.rotation_policy` object:

   ```json
   {
     "lifecycle": {
       "status": "active",
       "rotation_policy": {
         "credential_rotation_days": 90,
         "last_rotated_at": "2026-04-15T00:00:00Z",
         "next_rotation_at": "2026-07-14T00:00:00Z",
         "orphan_check_days": 30
       }
     }
   }
   ```

   When `rotation_policy.credential_rotation_days` is present, runtimes **SHOULD** warn if `next_rotation_at` is in the past or within 7 days.

### G5 — PolicyDocument as an ADL object

**Observation.** AGT's `PolicyDocument` (rules with `condition`, `action`, `priority`) is declarative policy that AGT evaluates at every action. ADL `permissions` describes *outcomes* (this host is allowed, this command is denied) but not *rules with priority and conditions*. The two are complementary: ADL permissions are the static policy floor; AGT PolicyDocument is the dynamic policy that may further constrain.

**Recommendation.** Do **not** absorb PolicyDocument into ADL `permissions`. ADL's deny-by-default model is intentionally static and is the right abstraction for portable declarations. Instead, add `policy_references` (array of URIs) **in the Runtime Operations Profile** (`urn:adl:profile:runtime-ops:1.0`, §4.7) so an ADL document can declare external policy documents that authoritative runtimes evaluate. Originally proposed for `security.policy_references` in core; moved to the profile because external runtime policy evaluation is an operational concern, not a security posture declaration. (Core `permissions` remains the static floor that referenced policies may restrict but never expand — see RTOPS-09 in the profile proposal.)

```json
{
  "profiles": ["urn:adl:profile:runtime-ops:1.0"],
  "policy_references": [
    {
      "type": "agt_policy_document",
      "uri": "https://policy.acme.example.com/contract-reviewer/policy.yaml",
      "media_type": "application/vnd.microsoft.agt-policy+yaml",
      "checksum": { "algorithm": "SHA-256", "value": "..." }
    },
    {
      "type": "cedar",
      "uri": "https://policy.acme.example.com/contract-reviewer/policy.cedar",
      "media_type": "application/vnd.cedar+text"
    }
  ]
}
```

This pattern also accommodates OPA/Rego, Cedar (AWS Verified Permissions), XACML, and future policy languages. Each entry **MUST** contain `type` and `uri`; `media_type` and `checksum` are RECOMMENDED. See the runtime-operations-profile proposal §4.7 for the canonical definition.

### G6 — Evidence artifact declarations

**Observation.** AGT emits `agt-evidence.json` per agent: a structured bundle of policy evaluations, attestation chains, red-team scores, and audit-trail summaries. ADL Governance Profile's `governance_record_ref` is a URI to the governance record, but does not specify the artifact shape, signature, or checksum.

**Recommendation.** Augment `governance_record_ref` (Governance Profile) with optional siblings:

| Member                  | Type   | Required | Description |
|-------------------------|--------|----------|-------------|
| governance_record_ref   | string | OPTIONAL | URI to governance record (existing) |
| evidence_bundle_ref     | object | OPTIONAL | Reference to a signed evidence bundle |
| evidence_bundle_ref.uri | string | REQUIRED if `evidence_bundle_ref` | URI to bundle |
| evidence_bundle_ref.media_type | string | OPTIONAL | e.g., `application/vnd.microsoft.agt-evidence+json` |
| evidence_bundle_ref.checksum | object | OPTIONAL | `{algorithm, value}` |
| evidence_bundle_ref.signature | object | OPTIONAL | Same shape as `security.attestation.signature` |

This makes the link to AGT evidence (and equivalent artifacts from other governance runtimes) verifiable, not just informational.

### G7 — Kill switch and execution rings

**Observation.** AGT's "Rogue Agents (ASI-10)" control includes a kill switch and ring isolation. ADL `lifecycle.status: retired` is the static equivalent but is not a runtime control. There is no member for a kill-switch endpoint or an execution ring (1–4 in AGT, where ring 1 is most-privileged).

**Recommendation.** Add to the Governance Profile (not core spec) under a new Section 2.x "Runtime Controls":

```json
{
  "runtime_controls": {
    "kill_switch": {
      "endpoint": "https://gateway.acme.example.com/kill/contract-reviewer",
      "authentication_required": true
    },
    "execution_ring": 2,
    "isolation_level": "process"
  }
}
```

`execution_ring` is OPTIONAL; values 1–4 align with AGT's privilege rings (`1` = most-privileged → `4` = sandboxed). `isolation_level` enum: `none | process | container | vm | hardware_enclave`. Microsoft's documentation explicitly recommends container isolation as the OS-level complement to AGT's application-level controls.

### G8 — Red-team grade as governance metric

**Observation.** AGT's `agt red-team scan` produces a letter grade (A, B, etc.) as a quality bar. This is a published, measurable governance metric that mirrors automated SAST scoring.

**Recommendation.** Add OPTIONAL `risk_classification.red_team_assessment`:

| Member        | Type   | Required | Description |
|---------------|--------|----------|-------------|
| grade         | string | OPTIONAL | Assessment grade, free-form (e.g., `A`, `B+`, `PASS`) |
| methodology   | string | OPTIONAL | Methodology identifier (e.g., `microsoft_agt_red_team`, `garak`) |
| assessed_by   | string | OPTIONAL | Entity that performed the assessment |
| assessed_at   | string | OPTIONAL | ISO 8601 timestamp |
| report_uri    | string | OPTIONAL | URI to detailed report |

This is symmetrical to `risk_classification.assessed_by`/`assessed_at` already present in the Governance Profile.

---

## 5. Proposed Spec Additions (Summary)

| Change | Location | Type | Priority |
|--------|----------|------|----------|
| Add `OWASP_AGENTIC_TOP_10`, `COLORADO_AI_ACT` to `primary_framework` enum | Governance Profile §2.1 | Additive | **High** |
| Recommend ML-DSA-65 and other PQC algorithms in `cryptographic_identity` and `security.attestation.signature` | Core §6.3, §10.3 | Additive (recommendation widening) | **High** |
| Add `public_key.not_before`, `public_key.not_after` | Core §6.3 | Additive | High |
| Add Governance Profile `trust` object | Governance Profile new §2.x | Additive | Medium |
| Add `lifecycle.rotation_policy` | Core §5.6 | Additive | Medium |
| Add `policy_references[]` | **Runtime Operations Profile §4.7** | New profile member | High |
| Add `evidence_bundle_ref` sibling to `governance_record_ref` | Governance Profile | Additive | Medium |
| Add Governance Profile `runtime_controls` (kill_switch, execution_ring, isolation_level) | Governance Profile new §2.x | Additive | Medium |
| Add `risk_classification.red_team_assessment` | Governance Profile §2.3 | Additive | Low |
| Author `runtime/microsoft-agt` vendor profile | `profiles/runtime/microsoft-agt/` | New (depends on vendor-extensions proposal) | Medium |

All changes are additive. None require a major version bump. The two highest-leverage changes are (a) the framework enum widening and (b) PQC algorithm recommendations, both of which are quick wins that align ADL with where serious governance practice has moved in 2026.

---

## 6. Alternatives

### A. Mirror PolicyDocument inside ADL `permissions`

Translate AGT's `PolicyDocument` rules into ADL `permissions` constructs (priorities, conditions, actions).

**Rejected because:** ADL `permissions` is intentionally outcome-oriented (allowed hosts, denied paths). Adding rule priority, conditions, and actions makes ADL a policy language. Policy languages already exist (Cedar, OPA/Rego, AGT PolicyDocument). The right ADL primitive is a *reference* to an external policy (G5), not a copy of its shape.

### B. Add OWASP Agentic Top 10 as a separate profile

Create `urn:adl:profile:owasp-agentic:1.0` that adds per-control members.

**Rejected because:** The Governance Profile already provides `control_mappings[]` with `framework` and `control_id`. Adding OWASP as a value to those existing structures is one enum entry. A separate profile duplicates the mechanism.

### C. Keep all AGT-specific declarations in a vendor profile

Put trust scores, rings, kill switches, evidence bundles, and PQC algorithms exclusively in `https://microsoft.com/adl/agt/v1`.

**Rejected because:** Trust scoring, kill switches, evidence bundles, and PQC are not Microsoft-specific. Gemini Enterprise has trust scoring. AWS Bedrock Agents will need PQC. Every governance runtime needs kill switches. Pushing universal concerns into a vendor profile fragments the ecosystem.

### D. Wait for the OWASP Agentic Top 10 to reach v2

The current OWASP Agentic Top 10 is v1 (2025). One could argue for waiting.

**Rejected because:** AGT, Gemini's Model Armor messaging, and CrewAI's policy framework all reference v1 today. The enum is additive; v2 can be added later without breaking change. Waiting forfeits immediate ecosystem alignment.

---

## 7. References

- [Microsoft Agent Governance Toolkit (AGT)](https://github.com/microsoft/agent-governance-toolkit/)
- [OWASP Agentic Top 10](https://genai.owasp.org/llm-top-10/)
- [NIST FIPS 204 — Module-Lattice-Based Digital Signature Standard (ML-DSA)](https://csrc.nist.gov/pubs/fips/204/final)
- [NIST FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)](https://csrc.nist.gov/pubs/fips/203/final)
- [NIST FIPS 205 — Stateless Hash-Based Digital Signature Standard (SLH-DSA)](https://csrc.nist.gov/pubs/fips/205/final)
- [SPIFFE / SVID](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/)
- [Cedar Policy Language](https://www.cedarpolicy.com/)
- [OPA / Rego](https://www.openpolicyagent.org/)
- [EU AI Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- ADL Specification: `versions/0.1.0/spec.md` (Sections 5.6, 6.3, 9, 10)
- ADL Governance Profile: `profiles/governance/1.0/profile.md`
- ADL Registry Profile: `profiles/registry/1.0/profile.md`
- Vendor Extensions Proposal: `proposals/2026-03-14-vendor-extensions.md`
- Critical Gap Remediation Proposal: `proposals/2026-02-16-critical-gap-remediation.md`
- Companion proposal: `proposals/2026-05-18-gemini-enterprise-interop.md`
