---
name: equities-trade-capture-trade-id-format
description: Trade Capture team (fictional example). Use when creating, parsing, validating or reviewing trade IDs — defines the trade ID format and every validation rule.
---

# Trade ID format (fictional example)

```
EQ-YYYYMMDD-NNNNNN
```

| Part | Rule |
|---|---|
| `EQ` | Literal prefix, upper case |
| `YYYYMMDD` | The trade date, which must be a real calendar date (`20240230` is invalid) |
| `NNNNNN` | Six digits, `000001` to `999999` (`000000` is invalid) |

- Separators are single hyphens. No spaces, no lower case, no leading or trailing whitespace.
- Validation returns `{ valid: true }` or `{ valid: false, reason: '<short reason>' }`. It does not throw for bad input, including non-strings.
- Valid: `EQ-20240115-000042`. Invalid: `eq-20240115-000042`, `EQ-20241332-000001`, `EQ-20240115-000000`, `EQ-20240115-42`.
