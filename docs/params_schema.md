# Params Schema

This file defines the canonical `params_schema` format used across the app.

Each animation may expose a `params_schema` JSON array on the animation record. Each entry describes one parameter:

- `key` (string) - unique parameter key
- `type` (string) - one of: `number`, `color`, `select`, `boolean`
- `label` (string) - human-friendly label
- `default` - default value for the parameter
- `min`, `max`, `step` - applicable to `number`
- `options` - array of `{ value, label }` for `select`

Example:

```json
[  
  {"key":"speed","type":"number","label":"Speed","default":1.0,"min":0,"max":5,"step":0.01},
  {"key":"hue","type":"number","label":"Hue","default":200,"min":0,"max":360,"step":1},
  {"key":"color","type":"color","label":"Accent Color","default":"#00bcd4"},
  {"key":"style","type":"select","label":"Style","default":"soft","options":[{"value":"soft","label":"Soft"},{"value":"sharp","label":"Sharp"}]}
]
```

The runtime and UI components should treat `params_schema` as the source of truth for control generation and validation.
