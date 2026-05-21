# 02 — Decentralized Identity Primitives

**Part of:** [Blockchain and Agent Identity research](./README.md)

This document surveys the standards layer that sits *above* any ledger. The key point: the identity model agents need is largely already standardized by the W3C, and most of it is ledger-neutral. A ledger, where used at all, plugs in underneath as a "verifiable data registry."

## 1. Decentralized Identifiers (DIDs)

A **DID** is a URI of the form `did:<method>:<method-specific-id>` that resolves to a **DID document** describing public keys, authentication methods, and service endpoints. DIDs are designed to be controlled by the subject (or its controller) rather than issued by a central registrar. **DID Core** is a W3C Recommendation.

The `<method>` is the pluggable part. The method decides *where* the binding between the identifier and its current key material is recorded and how it is updated — i.e., what the **verifiable data registry (VDR)** is. The VDR can be DNS+HTTPS, an append-only log, a witness network, or a blockchain. This abstraction is the most important architectural idea for ADL: **the identifier and its document are standardized; the substrate is swappable.**

ADL already supports DIDs in two places (spec §6.1 `id` and §6.3 `cryptographic_identity.did`) and explicitly recommends `did:web` as an `id` form. So ADL is already "on" the DID model; the open question is only which methods/VDRs to anchor against.

A taxonomy of relevant methods appears in [03](./03-ledger-and-anchoring-models.md). For now: `did:web` (DNS+TLS, no history), `did:webvh` (DNS+TLS **plus** a verifiable append-only history, no chain), `did:key` (static, self-contained), `did:peer` (pairwise), and ledger-anchored methods (`did:ion`, `did:ethr`, `did:ebsi`, `did:cheqd`).

## 2. Verifiable Credentials (VCs)

A **Verifiable Credential** is a tamper-evident, cryptographically signed set of claims made by an **issuer** about a **subject**, presentable by a **holder** to a **verifier**. The triangle — issuer → holder → verifier — is the heart of the model, and it works *without* the verifier contacting the issuer at presentation time (offline-verifiable, requirement R1).

The **Verifiable Credentials Data Model v2.0** became a W3C Recommendation on **15 May 2025**, alongside a family of companion Recommendations:

- **VC Data Model 2.0** — the core data model.
- **VC Data Integrity 1.0** + **EdDSA** and **ECDSA** cryptosuites — embedded proofs.
- **Securing VCs using JOSE and COSE** — enveloped proofs (JWT/CWT style).
- **Controlled Identifiers (CIDs) 1.0** — a generalization of the identifier-controls-keys notion beyond DIDs (see §3).
- **Bitstring Status List 1.0** — standardized revocation/suspension (see §4).

(The VC JSON Schema spec and the Data Integrity BBS cryptosuite remained Candidate Recommendations as of May 2025.)

**Why VCs matter for agents:** they are the natural carrier for the claims a counterparty actually cares about — "this agent is operated by Acme," "it passed safety eval X," "principal P delegated scope S to it until time T." ADL's `security.attestation.type` already enumerates `verifiable_credential`, so VCs are an acknowledged extension point. Delegation (requirement R6) is best expressed as a VC, which is precisely the route the KYA-OS work takes (see [05](./05-agent-identity-initiatives.md)).

## 3. Controlled Identifiers (CIDs)

**Controlled Identifiers 1.0** (W3C Recommendation, 2025) abstracts the "an identifier is controlled by a set of verification methods/keys" idea so it is not exclusively tied to the `did:` scheme. This matters for ADL because an agent's `id` may be an `https:` URI rather than a DID. CIDs let the same key-control and proof machinery apply whether the identifier is a DID or an HTTPS URL — which keeps ADL's existing "HTTPS URI recommended" posture compatible with verifiable key control.

## 4. Status and revocation: Bitstring Status List

A credential or passport that cannot be revoked is a liability. **Bitstring Status List 1.0** (W3C Recommendation, 2025) defines a compact, privacy-respecting mechanism: the issuer publishes a long bitstring (a status list), and each credential carries an index into it. To check status, a verifier fetches the (heavily cached, herd-privacy-preserving) list and reads one bit. Status can flip — revoked, suspended, reinstated — **without re-issuing or re-distributing the credential.**

This maps directly onto ADL requirement **R4** (revocation decoupled from re-issuance) and onto the passport model's principle 2 (separation of declaration from operations). It also illustrates a general truth: **status is the part of identity that changes most and benefits most from being externalized.** Where that status list is published — a web URL, a transparency log, or a smart contract — is again a substrate choice, not a model choice.

## 5. Proofs, canonicalization, and ADL's existing alignment

ADL's signing model (JCS canonicalization per RFC 8785, then sign the digest; verify by removing the signature, re-canonicalizing, and checking against the key in `cryptographic_identity`) is conceptually the same as **VC Data Integrity** with a JCS-style transformation. The algorithm choices also line up: ADL recommends Ed25519/EdDSA and allows ECDSA P-256+; the VC EdDSA and ECDSA cryptosuites are the W3C-blessed equivalents. This is good news for the proposal — ADL does not need to invent a proof format; it can describe anchoring proofs in terms the VC ecosystem already understands.

## 6. The layered picture

```
+-----------------------------------------------------------+
|  Trust frameworks / governance (who may issue what)       |  <- policy, e.g. KYA-OS, EBSI conformance
+-----------------------------------------------------------+
|  Credentials & delegation: W3C VC 2.0, status lists       |  <- claims & revocation
+-----------------------------------------------------------+
|  Identifiers & key control: DID Core, Controlled IDs      |  <- "who", key binding
+-----------------------------------------------------------+
|  Verifiable Data Registry (the substrate)                 |  <- DNS+TLS | append-only log | witnesses | BLOCKCHAIN
+-----------------------------------------------------------+
```

The blockchain question lives entirely in the **bottom layer**. Everything an agent-identity system needs to *express* lives in the three layers above it and is already standardized and ledger-neutral. The next document examines the bottom layer.

→ Continue to [03 — Ledger and Anchoring Models](./03-ledger-and-anchoring-models.md)
</content>
