---
id: errors
title: 16. Errors
sidebar_position: 16
---

# Errors

Implementations **SHOULD** return errors in a consistent format:

```json
{
  "errors": [
    {
      "code": "ADL-1001",
      "title": "Invalid JSON",
      "detail": "Unexpected token at line 42, column 15",
      "source": { "pointer": "/tools/0/name" }
    }
  ]
}
```

The `source` object **MAY** contain: `pointer` (JSON Pointer to the error location), `line` (1-indexed), `column` (1-indexed).

## Error Codes

| Code     | Category | Description |
|----------|----------|-------------|
| ADL-1001 | Parse    | Invalid JSON syntax |
| ADL-1002 | Parse    | Document is not a JSON object |
| ADL-1003 | Schema   | Missing required member |
| ADL-1004 | Schema   | Invalid member type |
| ADL-1005 | Schema   | Invalid enum value |
| ADL-1006 | Schema   | Value does not match pattern |
| ADL-2001 | Semantic | Unsupported ADL version |
| ADL-2002 | Semantic | Duplicate tool name |
| ADL-2003 | Semantic | Duplicate resource name |
| ADL-2004 | Semantic | Duplicate prompt name |
| ADL-2005 | Semantic | Invalid timestamp format |
| ADL-2006 | Semantic | Invalid URI format |
| ADL-2007 | Semantic | Invalid JSON Schema |
| ADL-3001 | Profile  | Profile requirements not satisfied |
| ADL-3002 | Profile  | Unknown profile |
| ADL-4001 | Security | Weak key algorithm |
| ADL-4002 | Security | Invalid signature |
| ADL-4003 | Security | Expired attestation |
