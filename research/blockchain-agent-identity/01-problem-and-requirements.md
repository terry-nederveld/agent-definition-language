# 01 — The Problem and the Requirements

**Part of:** [Blockchain and Agent Identity research](./README.md)

## 1. What "agent identity" has to mean

When a counterparty — a peer agent, a gateway, an orchestrator, a registry, or a human operator — encounters an AI agent, it has to answer a chain of questions before it interacts:

1. **Who is this?** Is there a stable, globally unambiguous name for this agent?
2. **Is the thing in front of me actually that agent?** Can it prove control of the name, rather than merely asserting it (authentication)?
3. **Who stands behind it?** Which organization or person is the controller / principal, and is the agent authorized to act on their behalf (delegation)?
4. **Is what it shows me genuine and current?** Has its declaration (its ADL passport) been tampered with, and is the version I'm holding still valid, or has it been superseded or revoked?
5. **Can I check all of this without phoning a friend?** Can I verify the above without depending on a single server, vendor, or registry that could be down, compromised, or dishonest?

ADL today answers (1) and (2) well, partially answers (4), and largely defers (3) and (5). The agent gets an `id` (HTTPS URI, `did:web`, or URN), an optional `cryptographic_identity` (a DID and/or public key), and the passport can be signed via `security.attestation`, with integrity verified through JCS canonicalization (spec §6, §10.3, §18.1). What is missing is a **decentralized, tamper-evident record of provenance, key history, and revocation status** that a verifier can consult without trusting the issuer's own infrastructure. That gap is exactly the gap that ledger and ledger-adjacent technology is built to fill — see [03](./03-ledger-and-anchoring-models.md).

## 2. Why agents make this harder than human or service identity

Agent identity inherits all the hard parts of machine identity and adds new ones:

- **Volume and churn.** Agents are spun up, versioned, forked, and retired far faster than human accounts or even microservices. An identity system that requires a registration round-trip or a paid transaction per agent per change does not scale to this churn.
- **Delegated authority is the whole point.** An agent rarely acts for itself. It acts *for* a principal, often through a chain (user → org → orchestrator → sub-agent). Identity without verifiable, scoped, revocable delegation is close to useless for trust decisions. This is the core insight of the "Know Your Agent" framing (see [05](./05-agent-identity-initiatives.md)).
- **The agent may not be trustworthy with its own keys.** A recurring caution in the literature is that once an LLM is "in sole charge" of its security procedures, prompt injection and tool misuse can subvert key handling. This pushes key custody toward the runtime/host, not the model, and makes *external, independently verifiable* records of key state attractive.
- **Cross-organizational by default.** Agents increasingly transact across trust domains with no prior relationship. Verification therefore cannot assume a shared directory or a pre-established federation.
- **Ephemerality vs. accountability.** Agents are short-lived, but the actions they take (payments, data access, contracts) must remain auditable long after the agent is gone. The identity record needs a longer life than the agent.

## 3. Threat model

The substrate must hold up against at least:

| Threat | Description | What defends against it |
|--------|-------------|-------------------------|
| **Impersonation** | An attacker claims another agent's `id`. | Proof of control of a key bound to the id (DID auth, signature). |
| **Passport tampering** | A document is altered after review to widen permissions (privilege escalation, spec §18.10). | Canonical signing + integrity verification. |
| **Stale / replayed credentials** | A revoked or superseded passport is presented as current. | Revocation / status that does not depend on re-issuing or re-fetching the document. |
| **Key compromise** | The signing key is stolen; attacker signs malicious passports. | Verifiable key rotation history; pre-rotation; revocation. |
| **Issuer/registry compromise or coercion** | The server that hosts the passport or vouches for it is hacked or compelled to lie (including silently rewriting history). | A record the issuer cannot retroactively alter undetectably — i.e. tamper-*evidence* and append-only history. |
| **Registry unavailability** | The one server you trust is down. | Decentralized / replicated record; offline-verifiable proofs. |
| **Equivocation / forking** | The issuer shows different histories to different verifiers. | A globally consistent, ordered log (the strongest justification for a ledger). |
| **Confused-deputy / over-delegation** | Agent uses authority beyond its grant. | Scoped, verifiable delegation credentials. |

The two threats in this table that *specifically* motivate distributed-ledger technology are **issuer/registry coercion with silent history rewriting** and **equivocation/forking**. Most of the others are solved by ordinary public-key cryptography and a reachable server. Keeping that distinction crisp is the whole point of the research: it tells us exactly how much "blockchain" is actually warranted.

## 4. Requirements for an agent-identity substrate

Derived from the above, an identity substrate for ADL agents **should**:

- **R1 — Be self-describing and offline-verifiable.** A verifier should be able to check the core identity claims from the artifact in hand plus public keys, without a mandatory network call to the issuer. (Aligns with ADL passport principle 1: self-contained trust signals.)
- **R2 — Provide tamper-evidence over the passport.** Any change to declared identity, capabilities, or permissions must be detectable. (Already met by JCS signing.)
- **R3 — Provide tamper-evident key history.** A verifier should be able to confirm which key was authoritative at a given time and how authority moved (rotation), so a compromised-then-rotated key cannot be used to forge "old" passports.
- **R4 — Provide revocation/status that is cheap and decoupled from re-issuance.** Status must change without re-signing or re-distributing the passport (aligns with passport principle 2: separation of declaration from operations).
- **R5 — Be resistant to issuer dishonesty and unavailability.** No single party should be able to silently rewrite history or, by going offline, prevent verification.
- **R6 — Carry delegation.** Express, in a verifiable and scoped way, that a principal authorized this agent to act, and bound the scope.
- **R7 — Be privacy-preserving and regulation-compatible.** Must not require putting agent or principal personal data into an immutable, world-readable store (see [04](./04-tradeoffs-risks-and-privacy.md)).
- **R8 — Be substrate-agnostic and incrementally adoptable.** Must not force adoption of any one ledger, vendor, or even of a ledger at all; must degrade gracefully to today's `did:web` + signed passport.
- **R9 — Be affordable at agent scale.** No mandatory per-agent or per-update cost that breaks down under high churn.

## 5. What this implies before we even look at ledgers

Two requirements (R1, R8) already push hard against "store identity on a blockchain." A self-contained, offline-verifiable, substrate-agnostic passport that degrades to `did:web` cannot *live* on a chain. So the only architecturally honest role left for a ledger is **anchoring** — committing compact proofs (digests, key-event hashes, status pointers) to a verifiable data registry while the passport itself stays off-chain. The next documents test whether a ledger is even the best anchor, and at what cost.

→ Continue to [02 — Decentralized Identity Primitives](./02-decentralized-identity-primitives.md)
</content>
