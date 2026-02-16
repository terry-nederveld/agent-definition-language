---
id: permissions
title: 9. Permissions
sidebar_position: 9
---

# Permissions

The `permissions` member defines the agent's operational boundaries. **OPTIONAL.** When present, value **MUST** be an object containing one or more permission domain members. Permissions operate deny-by-default; runtimes **SHOULD** enforce declared permissions.

| Domain          | Description                    |
|-----------------|--------------------------------|
| network         | Network access boundaries      |
| filesystem      | Filesystem access boundaries   |
| environment     | Environment variable access    |
| execution       | Process execution boundaries   |
| resource_limits | Resource consumption limits   |

Permissions operate on a **deny-by-default** model: capabilities not explicitly granted are denied. Runtimes **SHOULD** enforce declared permissions. Runtimes that cannot enforce a permission domain **SHOULD** warn users before execution.

## 9.2 network

May contain: `allowed_hosts` (array of host patterns), `allowed_ports`, `allowed_protocols`, `deny_private` (bool). Host patterns support exact match and `*.example.com`.

```json
{
  "network": {
    "allowed_hosts": ["api.semanticscholar.org", "arxiv.org"],
    "allowed_protocols": ["https"],
    "deny_private": true
  }
}
```

## 9.3 filesystem

May contain: `allowed_paths` (array of `{ path, access }` where access is `read`, `write`, or `read_write`), `denied_paths`.

```json
{
  "filesystem": {
    "allowed_paths": [
      { "path": "/data/papers/**", "access": "read" },
      { "path": "/data/notes/**", "access": "read_write" }
    ]
  }
}
```

## 9.4 environment

May contain: `allowed_variables`, `denied_variables` (patterns with wildcards, e.g., `APP_*`).

## 9.5 execution

May contain: `allowed_commands`, `denied_commands`, `allow_shell` (bool).

## 9.6 resource_limits

May contain: `max_memory_mb`, `max_cpu_percent`, `max_duration_sec`, `max_concurrent`.

```json
{
  "resource_limits": {
    "max_memory_mb": 2048,
    "max_duration_sec": 300
  }
}
```
