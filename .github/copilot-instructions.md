# AOH workspace guidance

- Talk to your team's orchestrator (for example **Trade Capture Orchestrator**) for team work. Use **Equities Orchestrator** only for work that spans teams.
- Orchestrators delegate only to the subagents in their own `agents` frontmatter. Subagents call nobody.
- Each agent's rules (knowledge) come from `.github/aoh/knowledge/shared/` plus its own `config.md` chain, pushed by hooks. Skills are reference manuals, pulled on demand.
- No edits before the human approves a plan. Every subagent ends with the JSON status report.
- Agent files, knowledge files and folder names are conventions, not security boundaries.
