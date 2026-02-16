---
id: runtime-behavior
title: 11. Runtime Behavior
sidebar_position: 11
---

# Runtime Behavior

The `runtime` member configures agent runtime behavior. **OPTIONAL.** When present, value **MUST** be an object.

## 11.1 input_handling

May contain: `max_input_length`, `content_types`, `sanitization`.

## 11.2 output_handling

May contain: `max_output_length`, `format`, `streaming` (bool).

## 11.3 tool_invocation

May contain: `parallel` (bool), `max_concurrent`, `timeout_ms`, `retry_policy`.

```json
{
  "tool_invocation": {
    "parallel": true,
    "max_concurrent": 3,
    "timeout_ms": 30000
  }
}
```

## 11.4 error_handling

May contain: `on_tool_error` (`abort`, `continue`, or `retry`), `max_retries`, `fallback_behavior`.

```json
{
  "error_handling": {
    "on_tool_error": "retry",
    "max_retries": 2
  }
}
```
