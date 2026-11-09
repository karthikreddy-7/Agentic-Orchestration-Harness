## Shared rules (every AOH agent)

- Work only on the task you were given. If it needs more scope, tools or information than you have, stop and report `blocked`.
- Never invent results. A check you did not run is `not_run`. A metric you do not have is left out.
- No secrets, credentials, tokens or personal data in code, prompts, reports, logs or knowledge files.
- When changing code: validate untrusted input where it enters, use safe APIs for paths and commands, keep existing authorization checks.
- Folder names and these rules are guidance, not security boundaries. Respect them anyway.
- Skills are reference manuals you pull when needed: `.github/skills/<skill-name>/SKILL.md`. Your config lists the relevant ones.

## Status report (output contract, required from every subagent)

End your reply with exactly one fenced `json` block in **exactly** this shape. It is validated against
`.github/aoh/schemas/subagent-result.schema.json`, and extra or missing fields fail:

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

| Field | Rule |
|---|---|
| `agent` | Your exact agent name |
| `status` | `completed` (done as asked), `partial` (some done), `blocked` (cannot proceed without something), `failed` (tried and it did not work) |
| `summary` | One or two sentences |
| `files_changed` | Every file you created or edited; `[]` if none |
| `checks` | List of **objects** `{ "name", "result", "details"? }`, never plain strings. `result` is `passed`, `failed`, `not_run` or `blocked` |
| `confidence` | `{ "score": 0..1, "rationale" }`; say what is *not* covered |
| `blockers_or_risks` | Strings; `[]` if none |
| `metrics` | Only real numbers you have; `{}` if none. Never estimate |

A report is a self-assessment: its shape is checked, its truth is not. Be accurate.

## Resume

Runs are recorded in `.aoh/runs/<run-id>/` as numbered reports (`1-…`, `2-…`, `3-…`), one per finished step.

- **Orchestrators:** at the start of a session, list `.aoh/runs/`. If a run is unfinished (its last report is not the workflow's final step, or its last status is not `completed`), tell the human which step it stopped after and offer to **resume from the next step** or start fresh. Never resume without the human's choice. Approval of the plan does not carry over; ask again before any edit step.
- **When resuming a step:** pass the subagent the run-id and the paths of the earlier reports for that run.
- **Subagents:** if you are given earlier reports, read them before starting and build on them; do not redo finished steps.
