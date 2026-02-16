---
id: profiles
title: 13. Profiles
sidebar_position: 13
---

# Profiles

The `profiles` member declares which profiles the document conforms to. **OPTIONAL.** Value **MUST** be an array of profile identifiers (URIs or registered names). When a profile is declared: the document **MUST** satisfy all profile requirements, **MAY** use profile-defined members, and validators **SHOULD** check profile-specific rules.

Profiles **MUST NOT** redefine core ADL members; they **MAY** add top-level members, add members to existing objects, define validation rules, or require specific values for optional members.

## Standard Profiles

| Profile | Identifier | Status |
|---------|------------|--------|
| Governance | `urn:adl:profile:governance:1.0` | Draft |
| Healthcare | `urn:adl:profile:healthcare:1.0` | Placeholder |
| Financial | `urn:adl:profile:financial:1.0` | Placeholder |

Additional profiles may be registered (e.g., IANA profile registry).

## Example Usage

```json
{
  "adl": "0.1.0",
  "name": "Compliance Review Agent",
  "description": "Reviews documents for regulatory compliance.",
  "version": "1.0.0",
  "profiles": ["urn:adl:profile:governance:1.0"],
  "compliance_framework": {
    "primary_framework": "SOC2_TYPE_II"
  }
}
```

See the [Profiles section](/profiles) for detailed profile specifications.
