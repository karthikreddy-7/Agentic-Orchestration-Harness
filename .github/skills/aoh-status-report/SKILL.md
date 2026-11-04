---
name: aoh-status-report
description: Use when writing or checking an AOH subagent status report — the JSON block every subagent must end its reply with. Gives the field rules and a complete example.
---

# AOH status report

End your reply with exactly one fenced `json` block. It is validated against
`.github/aoh/schemas/subagent-result.schema.json`; extra fields are rejected.

| Field | Rule |
|---|---|
| `agent` | Your exact agent name, e.g. `"Trade Capture Developer"` |
| `status` | `completed` (done as asked), `partial` (some done), `blocked` (cannot proceed without something), `failed` (tried and it did not work) |
| `summary` | One or two sentences on what was done or found |
| `files_changed` | Every file you created or edited; `[]` if none |
| `checks` | `{ "name", "result", "details"? }` with result `passed` / `failed` / `not_run` / `blocked` |
| `confidence` | `{ "score": 0..1, "rationale": "why" }`. Say what is *not* covered |
| `blockers_or_risks` | Strings; `[]` if none |
| `metrics` | Only real numbers you have, e.g. `{ "tests_passed": 6 }`; `{}` if none. Never estimate |

## Example

```json
{
  "agent": "Trade Capture Developer",
  "status": "completed",
  "summary": "Added validateTradeId() to trades.mjs with four tests.",
  "files_changed": ["examples/equities/trade-capture/trades.mjs", "examples/equities/trade-capture/trades.test.mjs"],
  "checks": [{ "name": "npm test", "result": "passed", "details": "8 tests, 0 failures" }],
  "confidence": { "score": 0.8, "rationale": "Covers format and calendar dates; leap years not tested." },
  "blockers_or_risks": [],
  "metrics": { "tests_passed": 8 }
}
```

A report is a self-assessment. Its shape is checked; its truth is not. Be accurate.
