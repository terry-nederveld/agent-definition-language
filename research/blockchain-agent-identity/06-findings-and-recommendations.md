# 06 — Findings and Recommendations

**Part of:** [Blockchain and Agent Identity research](./README.md)

This document distills the research into the design decisions that feed the [Verifiable Identity Anchoring proposal](../../proposals/2026-05-21-verifiable-identity-anchoring.md). It is the bridge from "what we learned" to "what ADL should do."

## 1. Findings

- **F1 — Identity belongs off-chain; only proofs belong near a chain.** A passport that is self-contained, offline-verifiable, and substrate-agnostic (ADL's existing design) cannot live on a ledger. The only architecturally honest use of a ledger is **anchoring** compact, PII-free proofs. ([01](./01-problem-and-requirements.md#5), [03 §2](./03-ledger-and-anchoring-models.md#2), [04 §2](./04-tradeoffs-risks-and-privacy.md#2))
- **F2 — A blockchain's distinctive value is narrow but real:** append-only tamper-evidence, global ordering (anti-equivocation), host-independent availability, and coercion-resistance. These matter for *issuer-coercion* and *cross-org equivocation* threats — not for impersonation, tampering, or basic revocation, which signatures and a reachable server already handle. ([03 §1](./03-ledger-and-anchoring-models.md#1))
- **F3 — You usually don't need a chain to get verifiable history.** `did:webvh` (web + verifiable history, SCIDs, pre-rotation) and KERI (witness-based, ledgerless, pre-rotation) deliver verifiable key history and tamper-evidence without a blockchain. A chain is warranted only at the high-assurance / adversarial / regulator-facing end. ([03 §3–§5](./03-ledger-and-anchoring-models.md#3-did-methods-classified-by-substrate))
- **F4 — The model layer is already standardized and ledger-neutral.** DID Core, VC Data Model 2.0 (W3C Rec, May 2025), Controlled Identifiers 1.0, and Bitstring Status List 1.0 cover identifiers, claims, key control, and revocation. ADL is already aligned (DIDs, JCS signing, `verifiable_credential` attestation type). ([02](./02-decentralized-identity-primitives.md))
- **F5 — Revocation/status is the highest-value externalized signal** and should change without re-issuing the passport. ([02 §4](./02-decentralized-identity-primitives.md#4-status-and-revocation-bitstring-status-list), [04 §7](./04-tradeoffs-risks-and-privacy.md#7-constraints-handed-to-the-proposal))
- **F6 — The ecosystem is converging on DIDs + VCs + scoped delegation** (KYA-OS / DIF TAAWG, the ICAART 2026 paper, EBSI). ADL's defensible niche is the **verifiable-provenance/anchoring** layer that composes with those, not a competing credential or delegation format. ([05](./05-agent-identity-initiatives.md))
- **F7 — Privacy, cost, key custody, and decentralization-theater are the real risks.** They constrain the design more than any technical limitation: PII-free anchors, batching, host/HSM-held keys, and verification that does not collapse onto one resolver. ([04](./04-tradeoffs-risks-and-privacy.md))

## 2. Recommendation for ADL

**Add a substrate-agnostic anchoring capability to the passport — not a blockchain dependency.**

Concretely, the research recommends that the proposal:

1. **Extend the passport model with a third principle — *verifiable provenance*** — alongside "self-contained trust signals" and "separation of declaration from operations." The passport stays off-chain and compact; a *proof* of its state and key history is anchored to an external verifiable data registry.
2. **Add a minimal, OPTIONAL anchor to core Agent Identity** (a new §6.5) modeled as a reference to an abstract **verifiable data registry**, with a `type` discriminator (`blockchain` | `transparency_log` | `did_log` | `kel` | `other`), the registry locator, the **anchored digest** of the canonical passport, the digest algorithm, an anchor timestamp, and an optional **status/revocation** pointer. No member names a specific chain.
3. **Reuse, do not reinvent, the proof model.** Anchored digests use the same JCS canonicalization ADL already mandates (§10.3/§18.1); status reuses the Bitstring Status List concept; delegation is *referenced* as a VC, not redefined.
4. **Push the heavier, operational pieces into a profile** (an *Identity Anchoring Profile*) — accepted-registry trust lists, anchor rotation history, status-registry configuration, federation of anchors — consistent with passport principle 2 and the existing registry/governance-record pattern.
5. **Forbid putting the passport body or any personal data on-chain;** require PII-free, commitment-style digests; assume batching; and add Security Considerations covering key custody, decentralization theater, and the privacy/erasure tension.
6. **Default to the cheapest sufficient substrate.** Guidance should steer most adopters to signed `did:web`/`did:webvh`, reserve full ledger anchoring for the high-assurance case, and make moving between substrates a re-anchor, not a redesign.

This gives ADL a credible answer to "how can blockchain ground agent identity?" — *as one selectable substrate behind a verifiable-provenance abstraction* — while staying honest about when a chain is and isn't worth it.

## 3. Open questions left for the proposal / review

- Should the anchor digest cover the passport alone, or the passport **plus** its key-history reference (binding identity changes to the anchor)?
- Should ADL recommend a specific default substrate (e.g. `did:webvh`) in normative text, or stay strictly neutral and leave it to profiles/deployment?
- How does an anchored passport interact with `lifecycle.status` (e.g. does `retired` imply revoked on the status registry)?
- Minimum verification duties: must a conforming verifier check the anchor when present, or only when policy requires it?

These are deliberately left for the proposal and its review, not pre-decided here.

## Sources

Consolidated from the research across documents 01–05:

- [Verifiable Credentials 2.0 is now a W3C Recommendation (W3C News, 2025)](https://www.w3.org/news/2025/the-verifiable-credentials-2-0-family-of-specifications-is-now-a-w3c-recommendation/)
- [W3C Press: Verifiable Credentials 2.0 (2025)](https://www.w3.org/press-releases/2025/verifiable-credentials-2-0/)
- [Verifiable Credentials Overview (W3C TR)](https://www.w3.org/TR/vc-overview/)
- [did:webvh — DID method "did:web + Verifiable History" v1.0 (DIF / Identity Foundation)](https://identity.foundation/didwebvh/v1.0/)
- [did:webvh information site](https://didwebvh.info/latest/)
- [Announcing did:webvh v0.5 (W3C public-credentials list, Jan 2025)](https://lists.w3.org/Archives/Public/public-credentials/2025Jan/0009.html)
- [DIF & Vouched advance agentic identity with KYA-OS (DIF blog)](https://blog.identity.foundation/kya-os/)
- [Know Your Agent (KYA) overview](https://mhrsntrk.com/blog/know-your-agent-kya)
- [Vouched — Building a trust framework for AI agents (Know Your Agent)](https://www.vouched.id/learn/blog/building-a-trust-framework-for-ai-agents-why-know-your-agent-matters)
- [AI Agents with Decentralized Identifiers and Verifiable Credentials (arXiv 2511.02841, ICAART 2026)](https://arxiv.org/abs/2511.02841)
- [decentralized-identity/ion — ION (Sidetree on Bitcoin)](https://github.com/decentralized-identity/ion)
- [cheqd — Understanding the SSI stack (DID method landscape)](https://cheqd.io/blog/understanding-the-ssi-stack-through-5-trends-and-challenges/)
- [Decentralized Identity in Practice: Benchmarking Latency, Cost, and Privacy (arXiv)](https://arxiv.org/pdf/2601.20716)
- [KERI specification (Trust over IP)](https://trustoverip.github.io/kswg-keri-specification/)
- [KERI: Key Event Receipt Infrastructure (original paper, arXiv 1907.02143)](https://arxiv.org/pdf/1907.02143)
- [Slaughter and May — When decentralisation meets regulation: blockchain and GDPR](https://www.slaughterandmay.com/insights/new-insights/when-decentralisation-meets-regulation-how-blockchain-and-gdpr-can-coexist/)
- [Privacy World — EU DPAs on blockchain and the right to be forgotten (2025)](https://www.privacyworld.blog/2025/05/from-blocks-to-rights-privacy-and-blockchain-in-the-eyes-of-the-eu-data-protection-authorities/)
- [TechGDPR — GDPR right to be forgotten in blockchain](https://techgdpr.com/blog/gdpr-right-to-be-forgotten-blockchain/)

*Standards referenced (normative homes, for the proposal's reference list):* W3C DID Core; W3C Verifiable Credentials Data Model 2.0; W3C Controlled Identifiers 1.0; W3C Bitstring Status List 1.0; RFC 8785 (JCS); RFC 8615 (well-known URIs); RFC 3986 (URI); RFC 8141 (URN).
</content>
