# Agentic Orchestration Harness (AOH)

**AOH** is a division-level agentic orchestration framework built around VS Code GitHub Copilot custom agents. It provides a standardized skeleton for organizing agents, sub-agents, skills, workflows, helper scripts, memory banks, and execution observability across teams.

### Core Capabilities

- **Hierarchical orchestration:** A division-level orchestrator can discover and coordinate team orchestrators and agents across teams. Each team-level orchestrator can access its team's agents, sub-agents, skills, tools, scripts, and workflows.
- **Execution and observability layer:** Integrate different types of lifecycle hooks to capture agent-session state, prompts, tool calls and their inputs/outputs, execution events, errors, token usage, and other available runtime metadata. Maintain structured state and auditable execution traces, subject to the data exposed by the VS Code and Copilot runtime.
- **Modular team structure:** Maintain team-specific directories for custom agents, sub-agents, reusable skills, workflow definitions, and helper scripts (`.sh` and `.ps1`).
- **Agent memory banks:** Provide dedicated, persistent memory stores for individual agents and sub-agents to retain relevant context, decisions, conventions, and accumulated knowledge.
- **Workflow management:** Support predefined workflows and dynamically generated workflows, with explicit stage transitions and human approval checkpoints.
- **Shared framework and conventions:** Establish common schemas, directory structures, configuration, state management, logging, and reusable utilities across teams.

### Proposed Architecture

- **Division layer:** Division orchestrator, team registry, shared framework utilities, cross-team visibility, and division-wide workflows.
- **Team layer:** Team orchestrator, team-specific agents and sub-agents, skills, tools, workflows, scripts, and memory banks.
- **Execution layer:** Lifecycle hooks, session-state tracking, tool and prompt capture, token-usage reporting, event logging, and audit trails.
- **Agent layer:** Individual custom agents and sub-agents operating through the existing VS Code Copilot runtime.
