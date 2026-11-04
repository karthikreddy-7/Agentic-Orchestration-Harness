# AOH templates

Copy-me starting points. They live here, outside `.github/agents/`, so VS Code does not load them as real agents.

| Template | Copy to |
|---|---|
| `orchestrator.agent.md` | `.github/agents/<team>-orchestrator.agent.md` |
| `subagent.agent.md` | `.github/agents/<team>-<role>.agent.md` |
| `config.md` | `.github/aoh/knowledge/<division>/<team>/<agent-folder>/config.md` (or any layer) |

Then run `npm run check`.
