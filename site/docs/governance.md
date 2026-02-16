---
id: governance
title: Governance
sidebar_position: 101
description: Governance model for the ADL specification project including roles and decision-making processes.
keywords: [adl, governance, open source, decision making]
---

# Governance

This document describes the governance model for the Agent Definition Language (ADL) specification project.

:::info Open Development
ADL is developed openly. All decisions are documented, and consensus is sought among contributors.
:::

## Principles

1. **Openness:** Development happens in public; all decisions are documented
2. **Consensus:** Major decisions seek rough consensus among contributors
3. **Meritocracy:** Influence is earned through contribution
4. **Stability:** Breaking changes require strong justification

## Roles

### Contributors

Anyone who contributes to the project:

- Submit issues and pull requests
- Participate in discussions
- Provide feedback on specifications

### Maintainers

Trusted contributors with merge permissions:

- Review and merge pull requests
- Triage issues
- Guide specification development
- Enforce contribution guidelines

### Specification Editors

Responsible for specification text quality:

- Ensure consistency and clarity
- Resolve editorial disputes
- Maintain specification style

## Decision Making

### Routine Decisions

Made by maintainers through pull request review:

- Bug fixes
- Documentation improvements
- Minor clarifications

### Significant Decisions

Require broader input and discussion:

- New specification features
- Breaking changes
- Profile additions
- Governance changes

Process:
1. Open an issue describing the proposal
2. Allow time for community feedback (minimum 2 weeks)
3. Seek consensus among maintainers
4. Document the decision

### Dispute Resolution

If consensus cannot be reached:

1. Extend discussion period
2. Seek additional perspectives
3. Maintainers vote (majority wins)
4. Decision is documented with rationale

## Specification Versioning

### Semantic Versioning

ADL follows [Semantic Versioning](https://semver.org/):

- **MAJOR:** Breaking changes
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, clarifications

### Draft Versions

Versions with `-draft` suffix are unstable:

- Subject to breaking changes
- Not recommended for production

### Stable Versions

Versions without `-draft` suffix:

- Backward compatibility guaranteed within major version
- Breaking changes require major version bump

## Standardization Governance

When ADL is submitted to standards bodies:

- Project governance continues for open-source version
- Standards body governance applies to formal standard
- Effort to keep versions aligned

## Changes to Governance

This governance document may be updated:

1. Propose changes via pull request
2. Allow 4-week comment period
3. Require maintainer consensus
4. Document rationale for changes
