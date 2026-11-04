# AOH workspace guidance

- Talk to your team's orchestrator (for example **Trade Capture Orchestrator**) for team work. Use **Equities Orchestrator** only for work that spans teams.
- Orchestrators delegate only to the subagents in their own `agents` frontmatter. Subagents call nobody.
- Each agent's rules come from its `config.md` chain under `.github/aoh/knowledge/`, injected by hooks. Detailed material lives in skills and is pulled on demand.
- No edits before the human approves a plan. Every subagent ends with the JSON status report.
- Agent instructions, knowledge files and folder names are conventions, not security boundaries.
