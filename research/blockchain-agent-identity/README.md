# Research: Blockchain and Distributed Ledgers as a Substrate for Agent Identity

**Date:** 2026-05-21
**Status:** Research note (informative; not normative)
**Drives proposal:** [`proposals/2026-05-21-verifiable-identity-anchoring.md`](../../proposals/2026-05-21-verifiable-identity-anchoring.md)

## Purpose

This directory holds the background research behind the *Verifiable Identity Anchoring* proposal for ADL. It exists so that the proposal itself can stay short and decision-focused: the proposal states **what** ADL should change and **why**, while these documents carry the **evidence** — the technology landscape, the standards, the trade-offs, and the prior art.

Nothing in this directory is normative. It does not change the ADL specification. It is the record of how we arrived at the proposal's recommendation.

## The question we set out to answer

> Can blockchain / distributed-ledger technology serve as the *ground* on which an AI agent's identity is captured and verified — and if so, how should ADL and its passport model use it?

The short answer that emerges from the research: **partially, and only for one specific job.** Blockchain is a poor place to *store* an agent's identity but a strong place to *anchor* it — to provide a decentralized, tamper-evident record that a passport (and the keys behind it) existed, in a given state, at a given time, and has or has not been revoked. The valuable property is **verifiable, ledger-backed provenance and ordering without a trusted intermediary**, not storage. Crucially, several modern approaches (e.g. `did:webvh`, KERI) deliver most of that property *without* a blockchain at all, which means ADL should treat "the chain" as one interchangeable backing for an abstract **verifiable data registry**, never as a hard dependency.

## Documents

| # | Document | What it covers |
|---|----------|----------------|
| 00 | [README.md](./README.md) | This index and the headline finding |
| 01 | [01-problem-and-requirements.md](./01-problem-and-requirements.md) | Why agent identity is hard; the threat model; requirements an identity substrate must satisfy |
| 02 | [02-decentralized-identity-primitives.md](./02-decentralized-identity-primitives.md) | DIDs, Verifiable Credentials, controlled identifiers, status lists — the W3C standards layer |
| 03 | [03-ledger-and-anchoring-models.md](./03-ledger-and-anchoring-models.md) | Where (and whether) a ledger fits: anchored vs. ledgerless DID methods, anchoring/timestamping patterns, on-chain status registries |
| 04 | [04-tradeoffs-risks-and-privacy.md](./04-tradeoffs-risks-and-privacy.md) | Cost, latency, key management, sustainability, governance, and the blockchain/GDPR tension |
| 05 | [05-agent-identity-initiatives.md](./05-agent-identity-initiatives.md) | Prior and parallel art: KYA-OS / DIF, the DID+VC agents research, A2A, MCP, OAuth delegation |
| 06 | [06-findings-and-recommendations.md](./06-findings-and-recommendations.md) | Synthesis: the design decisions the research recommends for ADL (the bridge to the proposal) |

## How to read this

- If you only want the conclusion, read **06**.
- If you want to challenge the conclusion, read **03** and **04** — that is where the case for and against a ledger is argued.
- If you are implementing the proposal, **02** and **06** are the working references.

## Method and limitations

This is a literature and standards review conducted in May 2026, combining the author's prior knowledge with targeted web research. It is a desk study: no benchmarking, no proof-of-concept implementation, and no legal review was performed. Cost, latency, and regulatory statements are drawn from the cited secondary sources and should be re-validated before any production commitment. Sources are listed inline in each document and consolidated in [06](./06-findings-and-recommendations.md#sources).
</content>
</invoke>
