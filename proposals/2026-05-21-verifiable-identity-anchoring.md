# Proposal: Verifiable Identity Anchoring for ADL Passports

**Date:** 2026-05-21
**Status:** Draft
**ADL Version:** draft (0.3.0)
**Affects:** versions/draft/spec.md, versions/draft/spec-manifest.yaml, versions/draft/schema.json, versions/draft/schema-strict.json; new profile `profiles/identity-anchor/`
**Background research:** [`research/blockchain-agent-identity/`](../research/blockchain-agent-identity/README.md) — landscape, standards, trade-offs, prior art, and findings. This proposal states the decision; the research carries the evidence.

## Summary

Give an ADL passport an OPTIONAL, **substrate-agnostic** way to anchor a proof of its own state — and of its agent's key history and revocation status — to an external **verifiable data registry (VDR)**, which **MAY** be a blockchain but **MAY** equally be a transparency log, a `did:webvh` history file, or a KERI key-event log. The passport stays off-chain, self-contained, and compact; only PII-free *proofs* (digests, status pointers) are committed to the registry. This adds a third principle to the passport model — **verifiable provenance** — via a minimal new core member (`anchor`, Section 6.5) plus a new **Identity Anchoring Profile** for the operational, registry-heavy details.

## Motivation

ADL already does the easy 80% of agent identity: a stable `id` (HTTPS URI, `did:web`, or URN), a `cryptographic_identity` (DID and/or public key), and a passport that can be signed and integrity-checked via JCS canonicalization (Sections 6, 10.3, 18.1). What it does **not** yet provide is a way for a counterparty to verify, *without trusting the issuer's own server*, that:

- this passport existed in this exact state at a given time (provenance / timestamp),
- the signing key was the authoritative key at that time and how key authority has moved (key history),
- the passport has not since been revoked or superseded (status), and
- none of the above was silently rewritten by a compromised or coerced issuer (tamper-evidence, anti-equivocation).

These are precisely the properties that distributed-ledger technology was built to provide — but the research ([findings 06](../research/blockchain-agent-identity/06-findings-and-recommendations.md)) is emphatic on three points that shape this proposal:

1. **Identity belongs off-chain; only proofs belong near a chain.** A self-contained, offline-verifiable passport cannot live on a ledger without breaking the passport model. The honest role for a ledger is *anchoring* compact, PII-free proofs ([finding F1](../research/blockchain-agent-identity/06-findings-and-recommendations.md#1-findings)).
2. **A blockchain is one substrate, not the only one.** `did:webvh` and KERI deliver verifiable key history and tamper-evidence with no chain at all; a public ledger earns its cost only at the high-assurance, cross-jurisdiction, or coercion-resistant end ([finding F2, F3](../research/blockchain-agent-identity/06-findings-and-recommendations.md#1-findings)). ADL must therefore model an **abstract registry**, never a specific chain.
3. **The ecosystem has converged on DIDs + Verifiable Credentials + scoped delegation** (W3C VC 2.0 reached Recommendation in May 2025; DIF's *Know Your Agent* / KYA-OS work; EBSI). ADL's defensible niche is the **verifiable-provenance / anchoring** layer that *composes* with that work — not a competing credential or delegation format ([finding F6](../research/blockchain-agent-identity/06-findings-and-recommendations.md#1-findings)).

Doing nothing leaves ADL's trust story dependent on the continued honesty and availability of whatever server hosts the passport — exactly the dependency that high-assurance, cross-organizational agent interactions cannot accept.

## Goals and non-goals

**Goals**
- A minimal, OPTIONAL core hook so any passport — including a plain signed `did:web` one — can declare a verifiable anchor.
- Strict substrate-agnosticism: a blockchain is one selectable `type` among several.
- Privacy by construction: never anchor the passport body or personal data; anchor only PII-free digests/commitments and status pointers.
- Incremental adoption: degrade cleanly to today's signed-passport behavior; moving substrates is a re-anchor, not a redesign.

**Non-goals**
- Defining a new credential or delegation format (reuse W3C VCs by reference).
- Mandating any ledger, naming any chain in normative text, or requiring on-chain writes.
- Specifying registry internals (consensus, batching, fees) — those are the registry's concern.

## Details

### Part A — Passport model: add the *verifiable provenance* principle (Section 1.3)

Add a third principle to Section 1.3, after "Separation of declaration from operations":

> 3. **Verifiable provenance (OPTIONAL).** A passport **MAY** anchor a proof of its own state, its agent's key history, and its revocation status to an external verifiable data registry, so that a counterparty can confirm provenance, ordering, and status **without** depending solely on the issuer's infrastructure. The passport itself remains off-chain and self-contained; only compact, PII-free proofs are anchored. The choice of registry — blockchain, transparency log, DID history log, or key-event log — is a deployment decision and **MUST NOT** be assumed by consumers.

This preserves principles 1 and 2 (the passport stays self-contained and operational detail stays external) and frames anchoring as an additive, optional guarantee.

### Part B — New Section 6.5: Identity Anchoring (core, minimal)

Add `anchor` as an OPTIONAL top-level member, documented in a new Section 6.5 (Discovery remains 6.4; no renumbering).

> **6.5 Identity Anchoring**
>
> The `anchor` member binds the passport to an external **verifiable data registry (VDR)** that records a tamper-evident proof of the passport's state and, optionally, the agent's revocation status. **OPTIONAL.** When present, value **MUST** be an object.
>
> | Member            | Type   | Required | Description |
> |-------------------|--------|----------|-------------|
> | registry          | object | REQUIRED | The verifiable data registry the proof is committed to. |
> | anchored_digest   | string | REQUIRED | Base64url digest of the **anchoring input** (see below). |
> | digest_algorithm  | string | REQUIRED | Digest algorithm; **MUST** be one of `sha-256`, `sha-384`, `sha-512`. |
> | anchored_at       | string | OPTIONAL | ISO 8601 timestamp asserted by the issuer. The registry is the authoritative time source; this value is advisory. |
> | controller        | string | OPTIONAL | URI/DID of the controlling principal (delegation root). See the Identity Anchoring Profile for delegation evidence. |
> | status            | object | OPTIONAL | Revocation/suspension pointer (see below). |
>
> **registry object:**
>
> | Member    | Type   | Required | Description |
> |-----------|--------|----------|-------------|
> | type      | string | REQUIRED | One of `blockchain`, `transparency_log`, `did_log`, `kel`, `other`. |
> | uri       | string | REQUIRED | Locator for the registry (e.g. log endpoint, DID history URL, chain explorer base, or `did:webvh`/KERI identifier). **MUST** be a valid URI [RFC3986]. |
> | network   | string | OPTIONAL | Registry-specific network/instance identifier (e.g. a chain or ledger name). Consumers **MUST NOT** require any particular value. |
> | proof_ref | string | OPTIONAL | Reference to the specific entry within the registry (e.g. transaction id, block + index, log entry id, or SCID version id). |
>
> **status object** (revocation/suspension; reuses the W3C Bitstring Status List model):
>
> | Member  | Type    | Required | Description |
> |---------|---------|----------|-------------|
> | type    | string  | REQUIRED | Status mechanism, e.g. `bitstring_status_list`. |
> | uri     | string  | REQUIRED | Locator for the status list/registry. **MUST** be a valid URI [RFC3986]. |
> | index   | integer | OPTIONAL | Index of this passport's entry within the status list. |
> | purpose | string  | OPTIONAL | `revocation` or `suspension`. |
>
> **Anchoring input.** `anchored_digest` **MUST** be computed over the JCS [RFC8785] canonicalization of the ADL document with the `anchor` member **and** any `security.attestation.signature` removed. This mirrors the signature-removal rule in Section 18.1 and lets the digest, the on-registry proof, and an in-document signature coexist without circular dependency.
>
> **Privacy.** The anchoring input, the `anchored_digest`, and anything written to the registry **MUST NOT** contain personal data or secrets. Because ADL documents already exclude secrets (Section 18.2) and discourage embedded PII (Section 18.9), anchoring a digest of a well-formed passport is privacy-safe; implementations **MUST NOT** anchor the passport body, `provider.contact`, or `metadata.authors` content to the registry.
>
> **Consumption.** A consumer that does not understand anchoring **MUST** ignore the `anchor` member and **MAY** still use the passport. A consumer that verifies an anchor **MUST** follow Section 18 (anchor verification). The presence of `anchor` does not by itself make a passport more trustworthy than its signature; it adds independently verifiable provenance, ordering, and status.

#### Worked example (substrate-agnostic)

The *same* `did:web` agent, anchored two different ways. Only the `anchor.registry.type` differs.

Anchored to a transparency log (no blockchain):

```json
{
  "adl_spec": "0.3.0",
  "name": "Invoice Processor",
  "version": "2.0.0",
  "description": "Processes and routes invoices.",
  "data_classification": { "sensitivity": "confidential" },
  "id": "https://acme.example.com/agents/invoice-processor",
  "cryptographic_identity": {
    "did": "did:web:acme.example.com:agents:invoice-processor",
    "public_key": { "algorithm": "Ed25519", "value": "MCowBQYDK2Vw..." }
  },
  "anchor": {
    "registry": {
      "type": "transparency_log",
      "uri": "https://transparency.acme.example.com/adl",
      "proof_ref": "leaf:91827"
    },
    "anchored_digest": "9f2c...base64url...",
    "digest_algorithm": "sha-256",
    "anchored_at": "2026-05-20T12:00:00Z",
    "status": {
      "type": "bitstring_status_list",
      "uri": "https://acme.example.com/status/agents",
      "index": 412,
      "purpose": "revocation"
    }
  }
}
```

Anchored to a public ledger (high-assurance variant) — identical document, different registry:

```json
{
  "anchor": {
    "registry": {
      "type": "blockchain",
      "uri": "https://anchor.example/ledger",
      "network": "example-l2",
      "proof_ref": "tx:0xabc123/4"
    },
    "anchored_digest": "9f2c...base64url...",
    "digest_algorithm": "sha-256",
    "anchored_at": "2026-05-20T12:00:00Z"
  }
}
```

A `did:webvh` deployment sets `registry.type = "did_log"` and points `uri` at the verifiable history; a KERI deployment sets `type = "kel"`. No member names a specific chain.

### Part C — Section 10.3 Attestation (small addition)

Add to Section 10.3: an `attestation` **MAY** be accompanied by an `anchor` (Section 6.5). When both a `security.attestation.signature` and an `anchor` are present, a verifier that checks provenance **MUST** verify the signature (Section 18.1) **and** **SHOULD** confirm the `anchored_digest` matches the anchoring input and that the registry entry referenced by `proof_ref` commits to that digest. No new attestation member is required; the anchor lives under the top-level `anchor` member and the attestation continues to govern the in-document signature.

### Part D — Identity Anchoring Profile (`urn:adl:profile:identity-anchor:1.0`)

The operational, registry-heavy detail does **not** belong in core (passport principle 2). It goes in a new profile created at `profiles/identity-anchor/` (README.md, COMPATIBILITY.md, `1.0/profile.md`, `1.0/schema.json`), composed via `allOf` per Section 13.1. The profile adds one member:

> **`identity_anchor`** (REQUIRED when the profile is declared) — an object carrying:
>
> | Member              | Type   | Required | Description |
> |---------------------|--------|----------|-------------|
> | accepted_registries | array  | OPTIONAL | Trust list of registries (by `type`+`uri`) this agent's relying parties recognize. |
> | anchor_history      | array  | OPTIONAL | Prior anchors and key-rotation events, each with `anchored_digest`, `registry`, `effective_date`, and optional `superseded_by`. Provides verifiable key/passport history (research requirement R3). |
> | status_registry     | object | OPTIONAL | Full status-registry configuration (list URI, format, refresh interval) beyond the compact core `anchor.status` pointer. |
> | delegation          | array  | OPTIONAL | References (URIs) to W3C Verifiable Credentials expressing scoped, revocable delegation from the controller/principal to this agent. ADL references VCs; it does not redefine them. |
> | verification_policy | object | OPTIONAL | e.g. `must_verify_anchor` (boolean): whether relying parties are expected to treat anchor verification as mandatory for this agent. |

Validation rules (IDA-01 … IDA-0n), a worked example, and the JSON Schema follow the existing registry-profile structure. The profile is independent (no dependencies) and **MAY** be declared as a sibling of `registry`, `governance`, or `portfolio`.

This split keeps core minimal (one optional member) while giving high-assurance deployments a place for trust lists, history, delegation references, and policy — mirroring how the governance profile externalizes operational detail into a governance record.

### Part E — Security Considerations (add subsections to Section 18)

- **Anchor verification and trust.** Define the verification duty: confirm `anchored_digest` equals the digest of the anchoring input; confirm the registry entry at `proof_ref` commits to that digest; confirm key authority via key history where available; check `status` for revocation/suspension. A verifier **MUST NOT** treat presence of an `anchor` as proof of trustworthiness without performing these checks. An anchor that fails to resolve or verify **MUST** be treated as no better than an unanchored passport, and **SHOULD** raise a warning.
- **Anchoring and privacy.** Restate the prohibition on anchoring the passport body or any personal data; note that a hash *of personal data* may itself be regulated as personal data, so anchored content **MUST** be PII-free (cross-reference Sections 18.2, 18.9, and research [04 §2](../research/blockchain-agent-identity/04-tradeoffs-risks-and-privacy.md#2-privacy-and-the-gdpr--erasure-tension)).
- **Substrate availability and decentralization theater.** Warn that a registry anchor delivers its benefit only if verification does not collapse onto a single trusted resolver/gateway; otherwise a transparency log or `did:webvh` gives comparable assurance at lower cost. Implementations **SHOULD** document how they verify anchors and what they fall back to when the registry is unavailable.
- **Key custody.** Note that signing/anchoring keys **SHOULD NOT** be controllable by the agent's model/prompt surface; they belong with the runtime/host or an HSM/KMS (research [04 §3](../research/blockchain-agent-identity/04-tradeoffs-risks-and-privacy.md#3-key-management--the-actual-hard-part)).

### Part F — Schema and manifest changes

1. Add `$defs/anchor`, `$defs/anchor_registry`, `$defs/anchor_status` to `versions/draft/schema.json`; add `"anchor": { "$ref": "#/$defs/anchor" }` to top-level `properties`. `anchor` is not added to `required`.
2. Apply the same additions to `versions/draft/schema-strict.json`.
3. Update `versions/draft/spec-manifest.yaml` to register Section 6.5.
4. Create `profiles/identity-anchor/1.0/schema.json` (composed via `allOf`, `unevaluatedProperties: false`) and register the profile in `profiles/manifest.yaml`.
5. Add example documents under `versions/draft/examples/` (anchored passport) and a profile example (`anchored-agent.adl.json`).

## Alternatives

### A. Put the passport (or DID document) directly on a blockchain
**Rejected.** Breaks the passport model's self-contained, offline-verifiable, substrate-agnostic design, and collides with data-protection erasure rights (research [04 §2](../research/blockchain-agent-identity/04-tradeoffs-risks-and-privacy.md#2-privacy-and-the-gdpr--erasure-tension)). Storage is the one thing a ledger is worst at ([03 §2](../research/blockchain-agent-identity/03-ledger-and-anchoring-models.md#2-what-a-blockchain-is-bad-at)).

### B. Mandate a specific DID method or ledger (e.g. `did:ion`, `did:ebsi`)
**Rejected.** Picks a governance regime and a cost profile for all adopters and ages badly. ADL's value is interoperability; the registry must be pluggable. The proposal instead models an abstract VDR with a `type` discriminator.

### C. Require anchoring for all passports
**Rejected.** Most agents do not need ledger-grade provenance; signed `did:web` is sufficient. Mandatory anchoring imposes cost/latency at agent churn rates (research [04 §1](../research/blockchain-agent-identity/04-tradeoffs-risks-and-privacy.md#1-cost-and-latency)) and would block adoption. Anchoring is OPTIONAL and incremental.

### D. Define a new ADL-native delegation/credential format
**Rejected.** The ecosystem has converged on W3C VCs and DIF's KYA-OS for delegation (research [05](../research/blockchain-agent-identity/05-agent-identity-initiatives.md)). ADL should *reference* delegation VCs (Part D `delegation`), not compete with them.

### E. Use only `did:webvh` / KERI and never mention blockchain
**Rejected as too narrow.** `did:webvh`/KERI cover most cases and are the recommended default, but a minority of high-assurance, cross-jurisdiction, or coercion-resistant deployments genuinely benefit from a public ledger ([03 §6](../research/blockchain-agent-identity/03-ledger-and-anchoring-models.md#6-decision-logic-when-does-a-verifier-actually-need-a-chain)). The abstract-registry design serves both without privileging either.

## Open questions (for review)

- Should `anchored_digest` cover the passport alone, or the passport bound to its key-history reference?
- Should normative text recommend a default substrate (e.g. `did:webvh`), or stay strictly neutral?
- How should an anchored passport interact with `lifecycle.status` (does `retired` imply a revoked status entry)?
- Minimum verifier duty: must conforming verifiers check the anchor when present, or only when policy requires it?

(Carried from research [06 §3](../research/blockchain-agent-identity/06-findings-and-recommendations.md#3-open-questions-left-for-the-proposal--review).)

## References

**Background research (this repository)**
- [Blockchain & Agent Identity research package](../research/blockchain-agent-identity/README.md) — and documents [01](../research/blockchain-agent-identity/01-problem-and-requirements.md)–[06](../research/blockchain-agent-identity/06-findings-and-recommendations.md).

**Specifications**
- [W3C Decentralized Identifiers (DID) Core](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials Data Model 2.0 (Recommendation, 2025)](https://www.w3.org/TR/vc-data-model-2.0/)
- [W3C Controlled Identifiers 1.0](https://www.w3.org/TR/cid-1.0/)
- [W3C Bitstring Status List 1.0](https://www.w3.org/TR/vc-bitstring-status-list/)
- [did:webvh — "did:web + Verifiable History" v1.0](https://identity.foundation/didwebvh/v1.0/)
- [KERI specification (Trust over IP)](https://trustoverip.github.io/kswg-keri-specification/)
- [Sidetree / ION (Bitcoin)](https://github.com/decentralized-identity/ion)
- [RFC 8785 — JSON Canonicalization Scheme (JCS)](https://datatracker.ietf.org/doc/html/rfc8785)
- [RFC 8615 — Well-Known URIs](https://datatracker.ietf.org/doc/html/rfc8615)
- [RFC 3986 — URI](https://datatracker.ietf.org/doc/html/rfc3986)

**Ecosystem**
- [DIF & Vouched — Know Your Agent Operating System (KYA-OS)](https://blog.identity.foundation/kya-os/)
- [AI Agents with Decentralized Identifiers and Verifiable Credentials (arXiv 2511.02841)](https://arxiv.org/abs/2511.02841)

**ADL spec sections referenced**
- Section 1.3 Design Model; Section 6 Agent Identity; Section 10.3 Attestation; Section 13 Profiles; Section 18 Security Considerations — [`versions/draft/spec.md`](../versions/draft/spec.md).
</content>
