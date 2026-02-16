---
id: model-configuration
title: 7. Model Configuration
sidebar_position: 7
---

# Model Configuration

## 7.1 model

AI model configuration. **OPTIONAL.** When omitted, the runtime determines the model. When present, value **MUST** be an object:

| Member         | Type   | Required | Description                    |
|----------------|--------|----------|--------------------------------|
| provider       | string | OPTIONAL | Model provider (e.g., anthropic, openai) |
| name           | string | OPTIONAL | Model identifier               |
| version        | string | OPTIONAL | Model version                  |
| context_window | number | OPTIONAL | Max context window (tokens)    |
| temperature    | number | OPTIONAL | Sampling temperature (0.0-2.0) |
| max_tokens     | number | OPTIONAL | Max output tokens              |
| capabilities   | array  | OPTIONAL | Required model capabilities    |

`capabilities` values may include: `function_calling`, `vision`, `code_execution`, `streaming`.

## 7.2 system_prompt

System prompt for the agent. **OPTIONAL.** Value **MUST** be a string or an object. When an object, it **MUST** contain `template` (string, REQUIRED) and **MAY** contain `variables` (object). Variables in templates use `{{variable_name}}`.
