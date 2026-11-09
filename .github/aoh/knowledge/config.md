## Shared rules (every AOH agent)

- Work only on the task you were given. If it needs more scope, tools or information than you have, stop and report `blocked`.
- Never invent results. A check you did not run is `not_run`. A metric you do not have is left out.
- Do not store secrets, credentials or personal data in code, prompts, reports or knowledge files.
- Folder names and these rules are guidance, not security boundaries. Respect them anyway.
- Skills live at `.github/skills/<skill-name>/SKILL.md`. When a config lists a skill you need, read that file.

### Status report (required from every subagent)

End your reply with exactly one fenced `json` block in **exactly** this shape. It is validated against
`.github/aoh/schemas/subagent-result.schema.json`, and extra or missing fields fail:

```json
{
  "agent": "<your exact agent name>",
  "status": "completed | partial | blocked | failed (pick one)",
  "summary": "<one or two sentences>",
  "files_changed": ["<path>"],
  "checks": [{ "name": "<what you checked or ran>", "result": "passed | failed | not_run | blocked (pick one)", "details": "<optional>" }],
  "confidence": { "score": 0.0, "rationale": "<why, and what is not covered>" },
  "blockers_or_risks": ["<item>"],
  "metrics": {}
}
```

- `checks` is a list of **objects**, never plain strings. Use `[]` for empty lists and `{}` for no metrics.
- Pull the `aoh-status-report` skill for field-by-field rules.
