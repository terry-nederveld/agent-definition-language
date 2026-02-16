---
id: introduction
title: 1. Introduction
sidebar_position: 1
description: The Agent Definition Language (ADL) provides a standard format for describing AI agents, enabling discovery, interoperability, deployment, and security.
keywords: [adl, agent definition language, ai agents, specification]
---

# Agent Definition Language (ADL) Specification

<div className="version-badge">

| | |
|---|---|
| **Version** | `0.1.0` |
| **Status** | Draft |
| **Format** | JSON (snake_case member names) |

</div>

:::info Specification Status
This specification is currently in **draft** status. Breaking changes may occur before the 1.0 release. We welcome feedback through [GitHub Issues](https://github.com/adl-spec/agent-definition-language/issues).
:::

## 1.1 Purpose

The Agent Definition Language (ADL) provides a standard format for describing AI agents. ADL documents are JSON objects that describe an agent's identity, capabilities, tools, permissions, and runtime requirements. This specification describes the structure of ADL documents, the semantics of their members, and conformance requirements for implementations.

ADL serves a similar role for AI agents that OpenAPI serves for REST APIs, AsyncAPI for event-driven architectures, and WSDL for web services. It enables:

- **Discovery:** Agents can be found and understood programmatically.
- **Interoperability:** Agents can interact with tools, resources, and other agents using a common description format.
- **Deployment:** Runtime environments can provision and configure agents based on declared requirements.
- **Security:** Permission boundaries and security requirements are explicitly declared and enforceable.

## 1.2 Goals

- **Portable:** ADL documents describe agents independent of any specific runtime, platform, or provider.
- **Interoperable:** ADL documents can be transformed into other formats (A2A Agent Cards, MCP configurations) and consumed by diverse tooling.
- **Extensible:** ADL supports profiles that add domain-specific requirements without changing the core specification.
- **Secure:** Permission boundaries, authentication, and security constraints are first-class concepts.
- **Machine-readable:** ADL documents are validated against JSON Schema and can be processed programmatically.
- **Human-friendly:** Clear naming conventions and structures that are easy to read and author.

## 1.3 Relationship to Other Specifications

ADL builds upon and interoperates with:

- **JSON [RFC8259]** - ADL documents are valid JSON.
- **JSON Schema** - ADL documents are validated against JSON Schema; tool parameters use JSON Schema for types.
- **A2A Protocol** - ADL documents can generate A2A Agent Cards.
- **Model Context Protocol (MCP)** - ADL documents can generate MCP server configurations; tools, resources, and prompts align with MCP primitives.
- **OpenAPI** - ADL can reference OpenAPI specifications for HTTP-based tools.
- **W3C DIDs / Verifiable Credentials** - ADL supports DIDs for cryptographic identity and VCs for attestations.

:::tip Key Concept
ADL is to AI agents what **OpenAPI** is to REST APIs. It provides a machine-readable, vendor-neutral way to describe what an agent is, what it can do, and how it should operate.
:::
