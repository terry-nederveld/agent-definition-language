---
id: metadata
title: 12. Metadata
sidebar_position: 12
description: Add metadata for discovery, licensing, documentation, and organizational information.
keywords: [adl, metadata, license, authors, tags, discovery]
---

import CodeTabs from '@site/src/components/CodeTabs';
import authorsYaml from '@site/_yaml-sources/snippets/metadata/authors.yaml';
import licenseYaml from '@site/_yaml-sources/snippets/metadata/license.yaml';
import documentationYaml from '@site/_yaml-sources/snippets/metadata/documentation.yaml';
import repositoryYaml from '@site/_yaml-sources/snippets/metadata/repository.yaml';
import tagsYaml from '@site/_yaml-sources/snippets/metadata/tags.yaml';

# Metadata

The `metadata` member provides additional information for discovery, attribution, and licensing. **OPTIONAL.** When present, value **MUST** be an object.

:::tip Discovery and Attribution
Well-defined metadata improves agent discoverability in registries and provides clear attribution and licensing information.
:::

## 12.1 authors

Array of author objects. Each **MAY** contain `name`, `email`, `url`.

<CodeTabs yaml={authorsYaml} />

## 12.2 license

String: SPDX license identifier or URI to license document.

<CodeTabs yaml={licenseYaml} />

## 12.3 documentation

String: URI to documentation.

<CodeTabs yaml={documentationYaml} />

## 12.4 repository

String: URI to source repository.

<CodeTabs yaml={repositoryYaml} />

## 12.5 tags

Array of strings. **SHOULD** be lowercase, alphanumeric and hyphens only.

<CodeTabs yaml={tagsYaml} />
