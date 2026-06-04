# 04 — Trade-offs, Risks, and Privacy

**Part of:** [Blockchain and Agent Identity research](./README.md)

A ledger is not free. This document collects the costs and hazards that any "blockchain for agent identity" design must price in, and derives the constraints the ADL proposal must respect.

## 1. Cost and latency

- **Per-write cost.** Direct on-chain writes carry transaction fees and confirmation latency (seconds to minutes, sometimes more). At agent churn rates (create/version/retire many times an hour), per-agent-per-update writes are economically and operationally untenable (requirement R9).
- **Mitigation = batching.** Roll-up/Sidetree-style anchoring amortizes one on-chain write across thousands of operations, which is the only way ledger economics work at agent scale. Any ADL anchoring guidance must assume batching, not naïve per-document writes.
- **Verification cost.** Verifiers may need a node, a light client, or a trusted resolver/gateway — which can quietly re-introduce a central dependency (see §5). Transparency logs and `did:webvh` are far cheaper to verify than full chains.

## 2. Privacy and the GDPR / erasure tension

This is the single most important constraint and it is sharp:

- **Immutability vs. the right to erasure.** GDPR Article 17 (and similar regimes) grant a right to deletion. A public ledger is, by design, append-only and effectively undeletable. Putting personal data on-chain creates an unresolvable conflict.
- **Hashes are not a safe loophole by default.** Regulators have held that a hash *pointing to / derived from* personal data can itself be personal data. A naïve "just store the hash" approach is **not** automatically compliant. Guidance (e.g. from EU data-protection authorities) leans toward storing only **proof-of-existence commitments** — keyed hashes or cryptographic commitments that do not function as identifiers of a person — and keeping the underlying data off-chain and deletable.
- **Encrypt-and-throw-away-the-key.** A complementary pattern: store only encrypted data (if anything beyond a commitment must be stored) and delete the key elsewhere to render the on-chain ciphertext permanently unusable. EBSI launched compliance layers in this spirit, allowing redaction while preserving chain integrity.
- **Implication for ADL.** The anchor must commit to digests of **PII-free** content (a passport that already, per spec §18.2/§18.9, should not embed secrets or unnecessary personal data), and the spec must *forbid* anchoring the passport body or any personal data. Anchor the proof; keep the document — and any contact/author info — off-chain. This is fully consistent with the passport model's existing separation of declaration from operations.

## 3. Key management — the actual hard part

Cryptographic identity is only as strong as key custody, and agents make this worse ([01](./01-problem-and-requirements.md#2)):

- **Who holds the key?** Not the LLM. The literature is explicit that an LLM "in sole charge" of its own security procedures is a risk; signing keys should sit with the runtime/host or an HSM/KMS, gated from prompt-injectable surfaces.
- **Rotation and recovery.** Keys leak. The system must support rotation without breaking historical verification, and recovery without a central reset authority. `did:webvh` (verifiable history) and KERI (pre-rotation) are the strongest answers; bare `did:web` and `did:key` are the weakest.
- **Compromise window.** Verifiable key history (R3) limits damage: a stolen-then-rotated key cannot be used to forge "old, still-valid" passports if the history shows when authority moved.

## 4. Sustainability and operations

- **Energy / footprint.** Proof-of-work chains carry an environmental cost that is hard to justify for an identity anchor; proof-of-stake, permissioned ledgers, transparency logs, and `did:webvh` are far lighter. If a ledger is used, prefer low-footprint substrates.
- **Operational burden.** Running nodes, monitors, witnesses, or anchoring services is real ongoing work. Many teams will (and should) start with `did:web` + signed passport and adopt anchoring only when a concrete threat (cross-org equivocation, regulator audit) justifies it.

## 5. Decentralization theater

A frequent failure mode: a system *claims* decentralization but in practice everyone reads through one resolver, one gateway, or one indexer — re-creating the single point of trust/failure the ledger was supposed to remove. ADL guidance should warn implementers that **a ledger anchor only delivers its benefit if verification does not collapse back onto a single trusted intermediary.** If verification will go through one vendor's resolver anyway, a transparency log or `did:webvh` gives most of the value at a fraction of the cost and complexity.

## 6. Governance and lock-in

- **Who governs the registry?** Public chain, EU institution (EBSI), consortium, or a single vendor — each implies a different trust and longevity profile. Picking a chain is picking a governance regime.
- **Longevity.** Identity anchors may need to outlive the agent by years (audit). The substrate's expected lifetime and exit/migration story matter. Substrate-agnosticism (R8) is the hedge: ADL should let the *same passport* be re-anchored to a different VDR without changing its identity model.

## 7. Constraints handed to the proposal

From all of the above, the proposal **must**:

1. Keep the passport and all personal/secret data **off-chain**; anchor only PII-free digests/commitments and status pointers. *(privacy, §2)*
2. Be **substrate-agnostic**: model an abstract verifiable data registry whose `type` may be a blockchain, a transparency log, a `did:webvh` history, or a KERI KEL — never hard-wire a chain. *(R8, §6)*
3. Make anchoring **OPTIONAL** and **incrementally adoptable**, degrading cleanly to today's signed `did:web` passport. *(R8, R9)*
4. Assume **batching** for any on-chain economics and **never** require per-agent on-chain writes. *(R9, §1)*
5. Treat **revocation/status** as the highest-value externalized signal and model it explicitly. *(R4)*
6. Warn against **decentralization theater** and weak key custody in Security Considerations. *(§3, §5)*

→ Continue to [05 — Agent Identity Initiatives](./05-agent-identity-initiatives.md)
</content>
