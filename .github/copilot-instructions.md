# AOH workspace guidance

- Use `aoh-orchestrator` as the only user-facing AOH agent.
- Delegate specialist work only to subagents listed by the immediate caller in its `agents` frontmatter.
- Keep each delegated task bounded by an explicit objective, file scope, edit permission, constraints, and required status report.
- Route subagent reports to the human for an acceptance or next-step decision. Do not claim that the orchestrator independently verified implementation quality.
- Treat agent instructions, skill ownership, and folder names as conventions, not security boundaries.
- Follow the host's actual tool permissions and approval controls for consequential actions.
