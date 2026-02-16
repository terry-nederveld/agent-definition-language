---
id: ietf
title: IETF (RFC Track)
sidebar_position: 2
description: Pathway for ADL standardization through the IETF RFC process.
keywords: [adl, ietf, rfc, internet standard, standardization]
---

# IETF (RFC Track)

The Internet Engineering Task Force (IETF) develops and promotes voluntary Internet standards, particularly the standards that comprise the Internet protocol suite. This document outlines the pathway for ADL standardization through the IETF RFC process.

:::info RFC Benefits
An RFC provides global recognition, rigorous review, and a permanent citable reference. RFCs are the foundation of Internet standards.
:::

## Overview

| Attribute | Details |
|-----------|---------|
| Organization | IETF |
| Process | Internet-Draft to RFC |
| Track Options | Standards Track, Informational, Experimental |
| IPR Model | IETF Trust / BCP 78 |
| Timeline | 12-36+ months |

## Why IETF?

- **Internet standards authority:** Global recognition for network protocols
- **Rigorous review:** Multiple review stages ensure quality
- **Interoperability focus:** Strong emphasis on implementation experience
- **Permanent record:** RFCs are stable, citable references

## RFC Track Options

### Standards Track

Most rigorous path for normative specifications:

- Requires working group adoption
- Multiple implementations required
- Proposed Standard to Internet Standard progression

### Informational

For specifications that don't require the full standards process:

- Can be published without working group
- Suitable for initial ADL publication
- May later be elevated to Standards Track

### Experimental

For specifications requiring implementation experience:

- Lower barrier to publication
- Clearly marked as experimental
- Good for gathering feedback

## Relevant Working Groups

Potential IETF areas and working groups:

- **Applications and Real-Time Area (ART):** JSON, HTTP, media types
- **Security Area (SEC):** Authentication, authorization, identity

A new working group could be proposed if existing groups aren't suitable.

## Current Status

- **Phase:** Community Draft
- **Internet-Draft:** Not yet submitted
- **Working Group:** None identified

## Next Steps

1. Finalize specification text
2. Convert to IETF XML format (xml2rfc)
3. Submit initial Internet-Draft
4. Identify potential sponsors/champions
5. Present at IETF meeting

## Key Requirements

### Implementation Experience

RFCs benefit from (and Standards Track requires) multiple independent implementations.

### IANA Considerations

ADL defines:
- Media type: `application/adl+json`
- Potential profile registry

### Security Considerations

Must address:
- Document integrity
- Sensitive data handling
- Permission enforcement

## Resources

- [IETF](https://www.ietf.org/)
- [How to Write an RFC](https://www.ietf.org/standards/process/informal/)
- [RFC Editor](https://www.rfc-editor.org/)
- [xml2rfc](https://xml2rfc.tools.ietf.org/)
