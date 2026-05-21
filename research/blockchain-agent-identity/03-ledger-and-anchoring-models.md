# 03 — Ledger and Anchoring Models

**Part of:** [Blockchain and Agent Identity research](./README.md)

This is the core technical document: *where* a distributed ledger fits as a substrate for agent identity, what it actually buys, and what competes with it. The conclusion previewed: a ledger is one valid backing for a **verifiable data registry (VDR)**, and its distinctive value is **decentralized, append-only, globally-ordered tamper-evidence** — most useful for key history and revocation, never for the passport or any personal data.

## 1. What a blockchain genuinely provides

Strip away the hype and a public distributed ledger provides four properties that are hard to get elsewhere simultaneously:

1. **Append-only tamper-evidence** — entries cannot be silently altered or removed after the fact.
2. **Global total ordering** — everyone sees the same sequence of events; this defeats *equivocation* (showing different histories to different verifiers).
3. **Availability without a single host** — no one server's downtime blocks verification.
4. **Censorship/coercion resistance** — no single party can be compelled to rewrite or suppress an entry undetectably.

Map these to the threat model in [01](./01-problem-and-requirements.md#3-threat-model): properties (1)–(4) are precisely the answers to *issuer/registry coercion with history rewriting* and *equivocation/forking*. They are **not** needed for impersonation, tampering, or basic revocation, all of which ordinary signatures and a reachable server already solve. So the honest scope of "blockchain for agent identity" is narrow but real.

## 2. What a blockchain is bad at

- **Storage.** On-chain storage is expensive, world-readable, and effectively permanent — the opposite of what you want for a document that should be self-contained, compact, and possibly contain references to people (see [04](./04-tradeoffs-risks-and-privacy.md)).
- **Mutability and erasure.** Immutability collides head-on with data-protection erasure rights.
- **Latency and cost per write.** Confirmation times and fees make per-agent, per-update on-chain writes impractical at agent churn rates (requirement R9).
- **Throughput.** Naïve "one transaction per DID operation" does not scale — which is exactly why batching protocols (§4) exist.

The design rule that falls out: **commit proofs, not data.** Only digests, commitments, key-event hashes, and status pointers go near a chain; the passport and any PII stay off-chain.

## 3. DID methods, classified by substrate

| Method | Substrate / VDR | History? | Ledger needed? | Notes for ADL |
|--------|-----------------|----------|----------------|----------------|
| `did:key` | none (self-contained) | no | no | Static key as an identifier; good for ephemeral agents; no rotation, no revocation. |
| `did:peer` | none (pairwise, exchanged out of band) | within relationship | no | For private agent-to-agent pairings; not publicly resolvable. |
| `did:web` | DNS + HTTPS | **no** | no | What ADL already recommends. Simple, but the controller can silently rewrite the DID document and there is no verifiable history. |
| `did:webvh` | DNS + HTTPS **+ append-only log file** | **yes** | **no** | "did:web + Verifiable History." Adds self-certifying identifiers (SCIDs), pre-rotation key security, and a verifiable chain of document versions — *ledger-like history without a ledger.* v1.0 finalized in 2025; implementations in Python/TS/Rust/Go. **Strong default for ADL.** |
| `did:ion` | **Bitcoin** via Sidetree | yes | yes | Batches tens of thousands of operations into a single on-chain anchor (IPFS for content, Bitcoin for ordering). No new consensus needed; nodes derive state deterministically. |
| `did:ethr` | **Ethereum** (ERC-1056) | yes | yes | Long-lived; identity was never Ethereum's priority, so traction in the identity world is comparatively limited. |
| `did:ebsi` | **EBSI ledger** (EU) | yes | yes | European Blockchain Services Infrastructure; gaining mandate weight as EBSI publishes conformance criteria for EU Digital Identity Wallets. Relevant if ADL targets EU public-sector interop. |
| `did:cheqd` | **cheqd network** (Cosmos) | yes | yes | Purpose-built for SSI with payment rails for credential ecosystems. |
| KERI (`did:keri` / OOBI) | **witness network** (ledgerless or ledger-portable) | yes | no (optional) | See §5. Decouples identity entirely from any specific ledger. |

The spread of this table is itself the finding: **you can get verifiable history, key rotation, and tamper-evidence with or without a blockchain.** `did:webvh` and KERI deliver most of the security goal on the no-ledger side; `did:ion`/`did:ebsi`/etc. deliver it with stronger censorship-resistance and global ordering at higher operational cost.

## 4. Anchoring patterns (the "commit proofs, not data" toolkit)

These are the patterns ADL should care about, because they let a passport stay off-chain while gaining ledger-backed properties.

- **Hash / digest anchoring (proof of existence + timestamp).** Publish `H(canonical_passport)` to a ledger or log. Later, anyone can prove the exact passport existed at or before that block's time and has not changed. This is the minimal, privacy-safe anchor. Note the GDPR caveat (see [04](./04-tradeoffs-risks-and-privacy.md)): a hash *of personal data* can itself be treated as personal data, so anchor digests of documents that are themselves PII-free, or use keyed/commitment hashes.
- **Batching / roll-ups (Sidetree).** Instead of one transaction per operation, aggregate many operations off-chain (content in IPFS), anchor a single commitment on-chain, and let nodes deterministically reconstruct state. This is how `did:ion` makes per-DID economics viable and is the template for any high-volume agent anchoring.
- **Transparency logs (Certificate-Transparency-style).** Append-only, cryptographically verifiable logs (Merkle trees) with public monitors. They give tamper-evidence and (via gossip/monitoring) equivocation detection *without* a token, miner, or consensus chain. Often the best cost/assurance trade-off, and a natural fit for a self-hosted or consortium VDR.
- **Verifiable history files (`did:webvh`).** The history *is* the anchor: a signed, hash-chained log served from the same web origin as the DID, independently verifiable from genesis to deactivation.
- **Status registries.** Publish a Bitstring Status List (or a smart-contract status registry) so revocation/suspension flips a bit without re-issuing the passport.

## 5. KERI: identity without a ledger at all

KERI (Key Event Receipt Infrastructure) deserves its own note because it is the strongest "you might not need a blockchain" argument. KERI gives each identifier a **self-certifying identifier (SCID)** and a hash-chained **Key Event Log (KEL)**. Trust in the log's integrity and non-equivocation comes from **witnesses** that sign receipts (forming Key Event Receipt Logs), not from a global consensus chain. It is **ledger-less** (needs no chain) or **ledger-portable** (not locked to any one chain), and its **pre-rotation** scheme — committing to the *next* key's hash in advance — is a notably strong, post-quantum-friendly answer to key compromise (requirement R3). The KERI specification is being advanced under Trust over IP.

For ADL, KERI is evidence that the *abstract* requirement ("verifiable, non-equivocating key history") can be satisfied by witness networks just as well as by a chain — reinforcing substrate-agnosticism (R8).

## 6. Decision logic: when does a verifier actually need a chain?

```
Need tamper-evidence over the passport?            -> sign it (JCS). No registry needed.       [today's ADL]
Need verifiable KEY HISTORY / rotation?            -> did:webvh or KERI.  No chain required.
Need cheap REVOCATION decoupled from re-issuance?  -> status list (web/log/contract).
Need GLOBAL ORDERING / equivocation resistance
  across mutually distrusting orgs?                -> append-only log (CT-style) OR ledger.
Need CENSORSHIP/COERCION resistance with no
  trusted operator at all (e.g. adversarial,
  cross-jurisdiction, public-good registries)?     -> public distributed ledger (did:ion-style
                                                       batched anchoring).  <-- the real "blockchain" case
Always:                                            -> commit proofs, never the passport or PII.
```

The number of agent deployments that truly land on the last line is small but non-zero (high-assurance, cross-jurisdiction, regulator-facing, or public-infrastructure agents). The right architecture serves *all* of these rows through **one abstraction** — a verifiable data registry reference whose `type` selects the substrate — so that moving from "signed `did:web`" to "ledger-anchored" is a configuration change, not a redesign. That abstraction is what the proposal adopts.

→ Continue to [04 — Trade-offs, Risks, and Privacy](./04-tradeoffs-risks-and-privacy.md)
</content>
