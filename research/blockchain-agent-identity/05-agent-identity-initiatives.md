# 05 — Agent Identity Initiatives (Prior and Parallel Art)

**Part of:** [Blockchain and Agent Identity research](./README.md)

ADL is not entering an empty field. This document maps the active work on AI-agent identity so the proposal builds on convergence rather than reinventing it. The headline: the ecosystem is converging on **DIDs + Verifiable Credentials + scoped delegation**, with the ledger treated as an optional substrate — exactly the layering in [02](./02-decentralized-identity-primitives.md).

## 1. Know Your Agent (KYA) and KYA-OS (DIF)

"**Know Your Agent**" reframes KYC/KYE for non-human actors: a framework for managing the identities, behaviors, and permissions of AI agents. The concrete specification, **KYA-OS** (Know Your Agent Operating System), was donated by **Vouched** in **March 2026** and is now governed by the **Decentralized Identity Foundation (DIF)** through its **Trusted AI Agents Working Group (TAAWG)**. Salient points for ADL:

- **Primitives:** DIDs for agent identity; **VCs for delegation**, represented as "tamper-evident credentials with explicit scope," verifiable without prior coordination between parties.
- **Protocol-agnostic:** originated around MCP (as "MCP-I") but explicitly extended to "any Agentic AI protocol."
- **Conformance tiers:** Level 1 — foundational, using *existing* identifiers; Level 2 — full DID verification with credential-based delegation; Level 3 — enterprise lifecycle management with **immutable auditing**.

The tiering is directly instructive for ADL: it validates an **incremental** model where the strongest, immutable-audit tier is opt-in — the same posture our trade-off analysis ([04](./04-tradeoffs-risks-and-privacy.md)) demands.

## 2. Academic: "AI Agents with Decentralized Identifiers and Verifiable Credentials"

A 2026 research paper (arXiv 2511.02841, accepted at ICAART 2026) proposes equipping each agent with a self-controlled identity made of a **ledger-anchored DID** plus third-party-issued, **DID-bound VCs**. Agents authenticate at the start of a dialogue by proving DID ownership, then exchange self-hosted credentials to establish cross-domain trust "spontaneously" (no prior relationship). Its most important caution for us: it flags **limitations once the agent's LLM is in sole charge of its security procedures** — reinforcing the key-custody constraint in [04 §3](./04-tradeoffs-risks-and-privacy.md). It uses a ledger-anchored DID but frames the ledger as the registry, not the store — consistent with our anchoring model.

## 3. Agent protocols: A2A and MCP

- **A2A (Agent-to-Agent).** Agents publish an **Agent Card**; trust is evaluated from it. ADL already generates A2A Agent Cards (spec §15.1) and the repo ships an A2A discovery demo. A2A is a *discovery/interaction* layer; it does not itself standardize a decentralized identity substrate — leaving room for ADL's passport to be the verifiable identity artifact behind the card.
- **MCP (Model Context Protocol).** The KYA work began as MCP-I (an identity layer for MCP) before generalizing. MCP is where much of the agent-tool interaction happens, so an identity model that travels across MCP and A2A (which ADL's passport can) is valuable.

## 4. Delegation: OAuth / OAuth-style grants vs. VCs

Two camps for "the agent is allowed to act for the principal":

- **Token-based (OAuth 2.x, token exchange, rich authorization requests).** Mature, ubiquitous, but centralized on an authorization server and oriented to live sessions rather than portable, offline-verifiable, long-lived attestations.
- **Credential-based (delegation VCs).** Portable, offline-verifiable, scoped, revocable via status lists, and not tied to one authorization server — the direction KYA-OS and the academic work take.

For ADL the two are complementary: a passport can *declare* the delegation credential / authority model while runtime sessions still use OAuth where appropriate. ADL should not pick a winner; it should let the passport reference the delegation evidence.

## 5. EBSI and regulatory rails

The **European Blockchain Services Infrastructure (EBSI)** is publishing conformance criteria for EU Digital Identity Wallets, with `did:ebsi` support being mandated in that context, and has shipped compliance layers that allow redaction while preserving chain integrity. For agents that must interoperate with EU public-sector identity, the substrate choice may be partly *dictated* by regulation — another reason ADL must keep the substrate pluggable rather than opinionated.

## 6. Where ADL fits

| Layer | Owner in the ecosystem | ADL's role |
|-------|------------------------|------------|
| Trust framework / KYA policy | DIF TAAWG (KYA-OS), EBSI | ADL passport supplies the machine-readable agent declaration these frameworks evaluate. |
| Delegation credentials | W3C VC 2.0, KYA-OS | ADL can *reference* delegation VCs from the passport. |
| Identifier + key control | W3C DID Core, Controlled IDs | Already in ADL (`id`, `cryptographic_identity`). |
| **Verifiable provenance / anchoring** | did:webvh, KERI, ledgers | **The gap ADL should fill** with a substrate-agnostic anchor. |
| Discovery / interaction | A2A, MCP | ADL already generates Agent Cards / MCP config. |

The clear, defensible niche for ADL is the **anchoring/provenance row**, expressed so it composes with everyone else's choices in the other rows. That is what the proposal targets — and deliberately *not* a competing delegation or credential format.

→ Continue to [06 — Findings and Recommendations](./06-findings-and-recommendations.md)
</content>
