---
id: terminology
title: 3. Terminology
sidebar_position: 3
description: Definitions of key terms used throughout the ADL specification.
keywords: [adl, terminology, definitions, glossary]
---

# Terminology

The following terms are used throughout this specification:

| Term | Definition |
|------|------------|
| **ADL document** | A JSON object that conforms to this specification. |
| **agent** | An AI system capable of autonomous operation within defined boundaries, described by an ADL document. |
| **tool** | A function or capability that an agent can invoke (equivalent to "function" in function-calling). |
| **resource** | A data source that an agent can read from (e.g., vector store, knowledge base, file system). |
| **prompt** | A predefined prompt template that an agent can use. |
| **profile** | A set of additional requirements and members that extend the core ADL specification for specific domains. |
| **permission domain** | A category of system access (network, filesystem, etc.) that defines operational boundaries. |
| **runtime** | The system or environment that executes an agent based on its ADL definition. |
| **model** | The LLM or other AI model that powers the agent's reasoning. |
