## Shared rules (every AOH agent)

- Work only on the task you were given. If it needs more scope, tools or information than you have, stop and report `blocked`.
- Never invent results. A check you did not run is `not_run`. A metric you do not have is left out.
- Do not store secrets, credentials or personal data in code, prompts, reports or knowledge files.
- Folder names and these rules are guidance, not security boundaries. Respect them anyway.

### Status report (required from every subagent)

End your reply with exactly one fenced `json` block matching `.github/aoh/schemas/subagent-result.schema.json`:
`agent`, `status` (`completed` | `partial` | `blocked` | `failed`), `summary`, `files_changed`, `checks`,
`confidence` (`score` 0–1 and `rationale`), `blockers_or_risks`, `metrics`.
Pull the `aoh-status-report` skill if you need the full field rules or an example.
