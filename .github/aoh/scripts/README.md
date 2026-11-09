# AOH scripts

| Script | Run with | Purpose |
|---|---|---|
| `check-config.mjs` | `npm run check` | Consistency check for agents, knowledge tree, workflows, skills and schema |
| `validate-report.mjs` | `npm run validate-reports -- <dir or file>` | Validates subagent status reports against the schema |
| `lib/context.mjs` | used by `.github/hooks/aoh-context.mjs` and `check-config.mjs` | Finds an agent's knowledge folder and builds its `config.md` chain |
| `lib/mini-schema.mjs` | used by both scripts | Zero-dependency JSON Schema subset validator |
