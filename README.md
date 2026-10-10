# Agentic Orchestration Harness (AOH)

**AOH** is a division-level agentic orchestration framework built around VS Code GitHub Copilot custom agents. It provides a standardized skeleton for organizing agents, sub-agents, skills, workflows, helper scripts, memory banks, and execution observability across teams.

This README uses **GMT (Global Markets Technology)** as its example division, with **Alpha** and **Beta** as example teams. These names demonstrate the convention; adopters should replace them with their own division and team names.

### Core Capabilities

- **Hierarchical orchestration:** A division-level orchestrator can coordinate team orchestrators and agents across teams. Each team-level orchestrator can access its team's agents, skills, tools, scripts, and workflows, plus applicable division-wide skills.
- **Execution and observability layer:** Integrate different types of lifecycle hooks to capture agent-session state, prompts, tool calls and their inputs/outputs, execution events, errors, token usage, and other available runtime metadata. Maintain structured state and auditable execution traces, subject to the data exposed by the VS Code and Copilot runtime.
- **Modular team structure:** Maintain team-specific directories for workflows, helper scripts (`.sh` and `.ps1`), and memory. Keep VS Code agent definitions in the supported shared agent directory and identify their ownership through filename prefixes.
- **Agent memory banks:** Provide dedicated, persistent memory stores for individual agents and sub-agents to retain relevant context, decisions, conventions, and accumulated knowledge.
- **Workflow management:** Support predefined workflows and dynamically generated workflows, with explicit stage transitions and human approval checkpoints.
- **Shared framework and conventions:** Establish common schemas, directory structures, configuration, state management, logging, and reusable utilities across teams.

### Proposed Architecture

- **Division layer:** GMT orchestrator, team registry, shared framework utilities, cross-team visibility, division-wide skills, and division-wide workflows.
- **Team layer:** Alpha and Beta orchestrators, team-specific agents, skills, tools, workflows, scripts, and memory banks.
- **Execution layer:** Lifecycle hooks, session-state tracking, tool and prompt capture, token-usage reporting, event logging, and audit trails.
- **Agent layer:** Individual custom agents and sub-agents operating through the existing VS Code Copilot runtime.

### Proposed Folder Structure

```text
Agentic-Orchestration-Harness/
├── .github/
│   ├── copilot-instructions.md
│   ├── agents/
│   │   ├── gmt-division-orchestrator.agent.md
│   │   ├── gmt-alpha-team-orchestrator.agent.md
│   │   ├── gmt-alpha-market-data.agent.md
│   │   ├── gmt-beta-team-orchestrator.agent.md
│   │   └── gmt-beta-risk-analyst.agent.md
│   ├── skills/
│   │   ├── cross-team-coordination/       # GMT-wide
│   │   │   └── SKILL.md
│   │   ├── market-data-validation/         # Alpha team
│   │   │   └── SKILL.md
│   │   └── risk-analysis/                  # Beta team
│   │       └── SKILL.md
│   └── instructions/
│       ├── security.instructions.md
│       └── workflow-format.instructions.md
├── aoh/
│   ├── config/
│   │   └── defaults.yaml
│   ├── registry/
│   │   └── teams.yaml
│   └── schemas/
│       ├── execution-event.schema.json
│       └── workflow.schema.json
├── teams/
│   ├── alpha/
│   │   ├── memory/
│   │   ├── scripts/
│   │   └── workflows/
│   └── beta/
│       ├── memory/
│       ├── scripts/
│       └── workflows/
├── workflows/
│   ├── division/
│   └── shared/
├── runtime/
│   ├── adapters/
│   │   └── vscode/
│   ├── hooks/
│   └── state/
├── scripts/
│   ├── powershell/
│   └── shell/
└── tests/
    ├── schemas/
    └── scripts/
```

### Naming and Ownership Conventions

- **Agents:** Store workspace custom agents directly in `.github/agents/` as `.agent.md` files. Prefix filenames with `gmt-` and include the owning team for team agents, such as `gmt-alpha-market-data.agent.md`. Keep the directory flat so agent discovery does not depend on nested-folder behavior.
- **Skills:** Put each skill directory directly under `.github/skills/`, with a unique capability-based name such as `cross-team-coordination`, `market-data-validation`, or `risk-analysis`. Use the required `name` and `description` fields in each `SKILL.md` frontmatter; `name` must match the skill directory and follow VS Code's lowercase, hyphenated naming rules. State ownership in the description (for example, `GMT-wide` or `Alpha team`) rather than using namespace prefixes. VS Code discovers workspace skills from `.github/skills/` for the workspace; ownership labels are organizational, not access controls that limit which agents can discover or invoke a skill. Do not use this layout as a security boundary for confidential team knowledge. A skill may include supporting scripts, examples, or other resources within its own directory; reference these files from its `SKILL.md`.
- **Orchestration:** Configure the GMT orchestrator with the team orchestrators it may delegate to. Configure each team orchestrator with only its own agents and any approved shared agents. When an agent declares subagents in `agents`, include the `agent` tool in its `tools` list. Use handoffs where a defined next step is useful, and grant tools according to each agent's responsibilities.
- **Instructions:** Use `.github/copilot-instructions.md` for concise repository-wide guidance and `.github/instructions/*.instructions.md` for scoped rules, with `applyTo` patterns where appropriate.
- **Workflows and scripts:** Put cross-team or division workflows in `workflows/division/` or `workflows/shared/`; keep team-owned workflows and scripts in `teams/<team>/`. Put framework-wide utilities in the top-level `scripts/` directory.
- **Memory and runtime state:** Keep persistent team memory separate from generated execution state. Define retention, access, and sensitive-data handling before collecting prompts, tool inputs/outputs, or other session data. Runtime hooks and captured metadata depend on the selected VS Code/Copilot harness and its available APIs; the folder layout alone does not enable capture.
