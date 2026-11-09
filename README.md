# Agentic Orchestration Harness (AOH)

**AOH** is a copyable harness for VS Code / GitHub Copilot custom agents. Each team talks to its own team orchestrator; cross-team work goes to a division orchestrator. Orchestrators delegate bounded tasks to generic subagents. Each agent's rules come from a **layered knowledge tree** (shared → division → team → agent) that a hook pushes in automatically, plus **layered skills** that agents pull only when they need them. Every subagent returns a schema-checked status report, and a human approves before anything is edited.

> The example organisation (an **Equities** division with **Trade Capture** and **Risk Analytics** teams) is fictional. Replace it with your own; AOH does not depend on any business domain.

## Why

One Copilot agent doing everything loses context and overreaches. AOH splits the work:

- **Bounded agents:** each subagent has one role, the fewest tools that role needs, and an explicit list of who it may call.
- **Right context, not all context:** an agent receives only the rules of the layers it belongs to, and loads detailed material on demand.
- **Structured returns:** every subagent ends with the same JSON status report, so results can be checked, not just read.
- **Human in the loop:** plans are approved before edits; results are accepted or rejected by a person.

## Architecture

```text
  User-facing orchestrators (pick one in the agent picker)
  ┌────────────────────────────┐ ┌─────────────────────────┐ ┌──────────────────────────────┐
  │ Trade Capture Orchestrator │ │ Equities Orchestrator   │ │ Risk Analytics Orchestrator  │
  │ day-to-day team work       │ │ cross-team work only    │ │ day-to-day team work         │
  └──────┬─────────────────────┘ └──────┬──────────────────┘ └──────┬───────────────────────┘
         │ agents: allow-list           │                           │
         ▼                              ▼                           ▼
   Equities Architect ◄─────────── all three may call it ──────────►
   Trade Capture Developer ◄── TC + Equities        Risk Analytics Developer ◄── RA + Equities
   Trade Capture Reviewer  ◄── TC + Equities        Risk Analytics Reviewer  ◄── RA + Equities

  Flat: orchestrators call subagents; subagents call nobody (one level of nesting).

  sessionStart (agent-scoped hook) ──► orchestrator's own config.md chain
  subagentStart hook ──► invoked subagent's config.md chain:
      knowledge/config.md → equities/config.md → equities/<team>/config.md → <agent>/config.md

  Each subagent ──► JSON status report ──► .aoh/runs/<run-id>/ ──► npm run validate-reports
```

### Which orchestrator to use

| Work | Talk to | It may call |
|---|---|---|
| Inside one team (most work) | that team's orchestrator | Equities Architect, its own team's Developer and Reviewer |
| Across teams | Equities Orchestrator | Equities Architect, every team's Developer and Reviewer |

The hierarchy is **flat on purpose**. The Equities Orchestrator calls team subagents directly instead of calling team orchestrators, because:

- a subagent cannot talk to the human, so a team orchestrator running as a subagent could not stop for plan approval;
- nested subagents need `chat.subagents.allowInvocationsFromSubagents` turned on for every user.

Team orchestrators and the Equities Orchestrator are peers that share the same specialists. Team-level context still reaches those specialists, because their `config.md` chain includes their team.

### Three locations

| Location | What lives there | Committed |
|---|---|---|
| `.github/` | What VS Code discovers itself: agents, skills, instructions, hooks | yes |
| `.github/aoh/` | The framework: config, knowledge tree, schema, scripts, templates | yes |
| `.aoh/` | Runtime output: run reports, logs, local state | no (gitignored) |

### Folder structure

```text
.github/
├── copilot-instructions.md                  # short, repo-wide rules
├── agents/                                  # generic role definitions, kept flat
│   ├── equities-orchestrator.agent.md       # user-facing, cross-team work
│   ├── trade-capture-orchestrator.agent.md  # user-facing, team work
│   ├── risk-analytics-orchestrator.agent.md # user-facing, team work
│   ├── equities-architect.agent.md
│   ├── trade-capture-developer.agent.md
│   ├── trade-capture-reviewer.agent.md
│   ├── risk-analytics-developer.agent.md
│   └── risk-analytics-reviewer.agent.md
├── skills/                                  # pulled on demand, named by layer
│   ├── aoh-status-report/SKILL.md           # shared
│   ├── equities-<topic>/SKILL.md            # division
│   └── equities-trade-capture-<topic>/SKILL.md   # team
├── instructions/                            # applyTo path-scoped coding rules
│   └── <area>.instructions.md
├── hooks/
│   ├── aoh-context.json                     # registers the context hooks
│   └── aoh-context.mjs                      # loads the config.md chain
└── aoh/
    ├── aoh.yaml                             # project identity, runs dir, extension points
    ├── knowledge/                           # PUSHED: layered rules, one config.md per layer
    │   ├── config.md                        # shared: every agent
    │   └── equities/
    │       ├── config.md                    # division rules, regulations, workflows
    │       ├── workflows/                   # division workflows
    │       ├── equities-orchestrator/config.md
    │       ├── equities-architect/config.md
    │       ├── trade-capture/
    │       │   ├── config.md                # team rules, dos and don'ts
    │       │   ├── trade-capture-orchestrator/config.md
    │       │   ├── trade-capture-developer/config.md
    │       │   └── trade-capture-reviewer/config.md
    │       └── risk-analytics/
    │           ├── config.md
    │           ├── risk-analytics-orchestrator/config.md
    │           ├── risk-analytics-developer/config.md
    │           └── risk-analytics-reviewer/config.md
    ├── schemas/subagent-result.schema.json  # the status contract
    ├── scripts/                             # check-config, validate-report
    └── templates/                           # copy-me agent and config.md templates
.aoh/                                        # gitignored runtime output
└── runs/<run-id>/*.json
examples/equities/trade-capture/             # demo code the quickstart works on
```

## How context reaches an agent

AOH separates **what an agent must always know** from **what it may need**.

### Push: hooks inject the config chain (mandatory)

Agent files stay generic: a role, tools, and who they may call. Everything specific to the division, team or agent lives in `config.md` files, which hold rules, regulations, workflows, and dos and don'ts.

1. A subagent is invoked. The `subagentStart` hook receives its `agentName`, for example `Trade Capture Developer`.
2. The hook converts the name to a folder name (`trade-capture-developer`) and finds that folder anywhere under `.github/aoh/knowledge/`.
3. It walks from the knowledge root down to that folder and concatenates every `config.md` on the way:
   `knowledge/config.md` → `equities/config.md` → `equities/trade-capture/config.md` → `equities/trade-capture/trade-capture-developer/config.md`
4. It returns the result as `additionalContext`, which Copilot prepends to the subagent's first message.

Orchestrators are different: they are the agent the user selected, and the `sessionStart` event does not say which agent that is. So each orchestrator declares its own **agent-scoped** `sessionStart` hook in its frontmatter and passes its own name to the same loader, which then injects its chain. For example, the Trade Capture Orchestrator gets shared + Equities + Trade Capture + its own config. Agent-scoped hooks run only while that agent is selected. If the host does not fire them, the orchestrator's first instruction is to load its own config chain itself.

**There is no registry.** An agent's division and team are wherever its folder sits in the tree. Moving an agent to another team means moving its folder.

Keep each `config.md` short. It is injected every time, so it costs context on every call.

### Pull: skills by layer (on demand)

Detailed material such as procedures, reference tables and long checklists goes into skills, which an agent loads only when the task matches the skill's description. Skills are named by layer so the taxonomy stays visible in the flat `.github/skills/` folder:

| Layer | Skill name pattern | Example |
|---|---|---|
| shared | `aoh-<topic>` | `aoh-status-report` |
| division | `<division>-<topic>` | `equities-trade-lifecycle` |
| team | `<division>-<team>-<topic>` | `equities-trade-capture-booking-checks` |

Each layer's `config.md` names the skills relevant to that layer, so an agent knows what it can pull without having it all injected.

## Operating model

- **Orchestrators face users; subagents don't.** Only `*-orchestrator` agents appear in the agent picker. Every subagent sets `user-invocable: false`.
- **Routing at the caller.** Each agent's `agents:` frontmatter is an explicit allow-list of the agents it may call. Leaf agents use `agents: []`. Names are case-sensitive. Never use `['*']`.
- **Nesting is capped.** VS Code subagents cannot call further subagents unless `chat.subagents.allowInvocationsFromSubagents` is on, and depth is limited to five. AOH uses one level: orchestrators call specialists, and specialists call nobody.
- **Least-privilege tools.**

  | Agent | Tools |
  |---|---|
  | Orchestrators (team and division) | `agent`, `read`, `search`, `edit` (edit only to save reports under `.aoh/runs/`) |
  | Architect, Reviewers | `read`, `search` |
  | Developers | `read`, `search`, `edit`, `execute` (execute only for named test commands) |

- **Scoped edits.** Each team's `config.md` declares its write scope; developers edit only inside it, and orchestrators never delegate edits outside it. `applyTo` instruction files add coding rules when an agent works on matching paths.
- **Human approval gate.** The orchestrator never delegates an edit until the human has explicitly approved the plan.
- **Folder names are not security boundaries.** Instructions, config files and folder layout guide agents; they do not enforce anything. Real limits come from the tools an agent is given and the host's approval prompts.

### The status contract

Every subagent ends its reply with one fenced `json` block matching `.github/aoh/schemas/subagent-result.schema.json`:

```json
{
  "agent": "Trade Capture Developer",
  "status": "completed",
  "summary": "Added validateTradeId() with four tests.",
  "files_changed": ["examples/equities/trade-capture/trades.mjs", "examples/equities/trade-capture/trades.test.mjs"],
  "checks": [{ "name": "npm test", "result": "passed", "details": "6 tests, 0 failures" }],
  "confidence": { "score": 0.8, "rationale": "Covers format and checksum; lowercase input not covered." },
  "blockers_or_risks": [],
  "metrics": { "tests_passed": 6 }
}
```

`status` is one of `completed`, `partial`, `blocked` or `failed`. The orchestrator saves each report to `.aoh/runs/<run-id>/`, and `npm run validate-reports -- .aoh/runs/<run-id>` checks them. Reports are self-assessments: the orchestrator summarises them for the human and does not claim to have verified the work.

## Quickstart

Requires VS Code with GitHub Copilot (agent mode) and Node.js 22+.

1. Clone the repo and open it in VS Code. Trust the workspace so hooks can run.
2. Run `npm run check` to confirm the agents, knowledge tree and schema are consistent.
3. Open Copilot Chat, pick **Trade Capture Orchestrator** in the agent picker, and ask:
   > Add `validateTradeId()` with tests to the Trade Capture module.
4. The orchestrator asks the **Equities Architect** for a plan and shows it to you. Approve it.
5. The **Trade Capture Developer** implements it and runs `npm test`. The **Trade Capture Reviewer** reviews it.
6. Read the summary, then run `npm run validate-reports -- .aoh/runs/<run-id>`.

## Adding a subagent

1. Copy `.github/aoh/templates/subagent.agent.md` to `.github/agents/<agent-name>.agent.md`. Set `name`, `description`, `tools`, `agents: []` and `user-invocable: false`.
2. Create its knowledge folder in the right place in the tree, for example `knowledge/equities/risk-analytics/<agent-name>/config.md`. The folder name must be the agent `name` in lowercase with hyphens.
3. Add the agent's `name` to the `agents:` list of each orchestrator that should call it: its team orchestrator and, for team specialists, the division orchestrator.

To add a team, create `knowledge/<division>/<team>/config.md`, a `<team>-orchestrator` agent and knowledge folder (copy an existing team orchestrator, including its agent-scoped `sessionStart` hook), and its specialists. Add the specialists to the division orchestrator's `agents:` list.
4. If it edits files, make sure its team `config.md` declares a write scope.
5. Run `npm run check`.

## Replacing the example organisation

1. Rename `knowledge/equities/` to your division and the team folders to your teams.
2. Rewrite each `config.md` with your own rules. Delete agents and teams you don't need.
3. Rename the agent files and their `name` fields to match the new folders.
4. Update `project.name` in `aoh.yaml` and the write scopes in each team `config.md`.
5. Delete `examples/` once you are working on real code.
6. Run `npm run check`; it reports any agent without a knowledge folder and any `agents:` entry that doesn't resolve.

## Optional layers

The core (agents, knowledge push, status contract, approval gate) needs no external services.

- **MCP:** add servers in `.vscode/mcp.json` and grant them per agent with `tools: ['<server>/*']`. Not used by the example.
- **Persistent memory:** `.aoh/memory/` is reserved for it. Not implemented; decide retention and redaction before adding it.

## Limits and open problems

- **Hooks depend on the harness.** The context hooks use Copilot's `subagentStart` event and agent-scoped `sessionStart` hooks; behaviour may differ between the Copilot and Local harnesses. Hook failures and timeouts are fail-open, so an agent can run without its context. The orchestrator's instructions tell it to stop if a subagent reports missing context. Turn on `features.hook_trace` and check `.aoh/logs/hook-trace.log` to see whether they fire in your setup.
- **Reports are self-assessed.** The schema checks a report's shape, not whether it is true.
- **No evals yet.** There is no automated way to measure whether the agents do the right thing. That is the main gap.

## Commands

| Command | What it does |
|---|---|
| `npm run check` | Checks agent frontmatter, `agents:` references, knowledge folders and the schema |
| `npm test` | Runs the demo tests |
| `npm run validate-reports -- <dir or file>` | Validates status reports against the schema |
| `npm run context -- "<Agent Name>"` | Prints exactly what the hooks inject for that agent |
