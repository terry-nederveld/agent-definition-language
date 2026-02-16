---
id: production
title: Production Agent
sidebar_position: 4
description: A complete production-ready ADL document with identity, permissions, security, and all optional features.
keywords: [adl, production, example, security, permissions, complete]
---

import CodeTabs from '@site/src/components/CodeTabs';
import productionYaml from '@site/_yaml-sources/examples/production.yaml';
import identityYaml from '@site/_yaml-sources/snippets/production/identity.yaml';
import cryptoIdentityYaml from '@site/_yaml-sources/snippets/production/cryptographic-identity.yaml';
import permissionsYaml from '@site/_yaml-sources/snippets/production/permissions.yaml';
import securityYaml from '@site/_yaml-sources/snippets/production/security.yaml';
import runtimeYaml from '@site/_yaml-sources/snippets/production/runtime.yaml';

# Production Agent Example

This example demonstrates a full production-style agent with identity, model configuration, tools, resources, prompts, permissions, security, runtime settings, and metadata.

:::info Complete Reference
This example uses all major ADL features. Use it as a reference when building production agents.
:::

## Document

<CodeTabs yaml={productionYaml} title="research-assistant.adl" />

## Sections Breakdown

### Identity

The agent has a unique identifier and provider information:

<CodeTabs yaml={identityYaml} />

### Cryptographic Identity

For secure agent identification:

<CodeTabs yaml={cryptoIdentityYaml} />

### Permissions (Deny-by-Default)

:::warning Security Model
Network and filesystem access is explicitly defined. Any access not explicitly granted is **denied**.
:::

<CodeTabs yaml={permissionsYaml} />

### Security

Authentication and encryption requirements:

<CodeTabs yaml={securityYaml} />

### Runtime Configuration

How the agent should execute:

<CodeTabs yaml={runtimeYaml} />

## Notes

:::tip Production Checklist
- Use `$schema` to enable IDE validation and autocomplete
- Define explicit permissions (deny-by-default)
- Configure security requirements (authentication, encryption)
- Set attestation with appropriate expiration dates
- Include comprehensive metadata for discovery
:::
