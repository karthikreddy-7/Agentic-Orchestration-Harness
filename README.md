# Agentic Orchestration Harness (AOH)

**AOH** is a project-agnostic orchestration convention and optional tooling layer for VS Code agent workspaces. Install it in the workspace repository's `.github/` directory so that its agent customizations and framework assets travel with the project. AOH can be used with a single agent in a small repository or extended with team-specific agents and workflows in a larger organization.

The names **GMT**, **Alpha**, and **Beta** are examples only. AOH does not require a division/team hierarchy, a particular source-tree layout, or any particular business domain.

## Design Principles

- **Portable by default:** Keep workspace agent, skill, instruction, and hook files in the VS Code-supported `.github/` locations; keep AOH-owned assets under `.github/aoh/`.
- **Layered, not hierarchical by default:** Start with one orchestrator and add team or specialist agents only when their responsibilities, tools, or context need to differ.
- **One source of truth:** Agent behavior belongs in agent definitions, reusable procedures in skills, path-scoped rules in instructions, and executable workflow definitions in AOH's workflow catalog. Avoid duplicating these in a second registry.
- **Project-aware, not project-invasive:** AOH should not impose a layout on application source code. Workflows and scripts operate on the repository's existing paths.
- **Runtime-aware:** VS Code customization surfaces do not have identical capabilities in every agent runtime. In particular, lifecycle hooks and their available event data depend on the active harness; hooks are optional integrations, not a portable enforcement or telemetry guarantee.
- **Safe state handling:** Separate committed policy and configuration from generated run state. Do not collect full prompts, tool arguments, outputs, secrets, or personal data by default.
- **Least privilege:** Use agent tool declarations and available runtime approvals to reduce risk. Agent names, prompt instructions, skills, and folder ownership conventions are not security boundaries.

## Proposed Architecture

AOH has three concerns with explicit boundaries:

1. **VS Code customization surface (`.github/`):** Native workspace discovery for custom agents, skills, instructions, and optional hooks. This is the user-facing integration layer.
2. **AOH framework (`.github/aoh/`):** Project-level AOH configuration, reusable workflow definitions, schemas, templates, validation utilities, and runtime adapters. All framework-owned, committed assets live here.
3. **Workspace runtime data (`.aoh/`):** Generated run state, local logs, caches, and optional workspace memory. This directory is runtime output, not framework installation; ignore it by default and apply explicit retention and data-handling rules.

The application repository remains the project layer and keeps its existing source, tests, build system, and CI layout. AOH references those paths rather than moving or mirroring them.

### Proposed Folder Structure

```text
<workspace-repo>/
├── .github/
│   ├── copilot-instructions.md          # Short, repository-wide agent guidance
│   ├── agents/                           # VS Code-discovered; keep definitions flat
│   │   ├── aoh-orchestrator.agent.md     # The only user-facing AOH agent
│   │   ├── GMT-<specialist>.subagent.md  # Division-level specialist
│   │   ├── Alpha-<specialist>.subagent.md
│   │   └── Beta-<specialist>.subagent.md
│   ├── skills/                           # VS Code-discovered skill directories
│   │   ├── aoh-workflow/                 # Optional shared skill
│   │   │   └── SKILL.md
│   │   └── <capability-name>/
│   │       ├── SKILL.md
│   │       ├── scripts/                  # Optional: helpers used only by this skill
│   │       └── resources/                # Optional: skill-specific references/templates
│   ├── instructions/                     # Auto-applied rules selected by file path
│   │   ├── security.instructions.md      # Example: security rules for matching files
│   │   └── <area>.instructions.md        # Example: area-specific coding conventions
│   ├── hooks/                            # Optional; harness-dependent integration
│   │   └── aoh-hooks.json
│   └── aoh/                              # AOH-owned, committed framework assets
│       ├── aoh.yaml                      # Project identity and feature switches
│       ├── schemas/
│       ├── workflows/
│       │   ├── shared/                   # Workflows usable across the project
│       │   ├── GMT/                      # Optional division-owned workflows
│       │   ├── Alpha/                    # Optional team-owned workflows
│       │   └── Beta/
│       ├── scripts/                      # AOH-wide utilities, validators, adapters
│       ├── templates/
│       └── knowledge/                    # Curated, reviewed, versioned project knowledge
├── .aoh/                                 # Generated/local state; add to .gitignore
│   ├── state/
│   ├── runs/
│   ├── logs/
│   └── memory/                           # Optional; exclude sensitive or transient data
├── .vscode/                              # Optional workspace settings and MCP config
│   └── mcp.json
├── src/                                  # Existing project layout; not prescribed by AOH
└── tests/
```

Do not put AOH agent definitions under `.github/aoh/agents/`: VS Code workspace agents are discovered from `.github/agents/`. Likewise, keep skill directories directly under `.github/skills/`, scoped instruction files under `.github/instructions/`, and optional hook configuration under `.github/hooks/`. Keep every AOH workflow—shared, division-owned, or team-owned—under `.github/aoh/workflows/`, grouped by ownership there; do not create a second team-workflow tree. Reserve `.github/workflows/` for GitHub Actions.

### Layer Responsibilities

| Layer | Owns | Does not imply |
|---|---|---|
| Workspace agents | Roles, allowed delegation targets, tool declarations, handoffs | Isolation or authorization enforced by directory ownership |
| Skills | Reusable task procedures and supporting resources | A private skill namespace or a substitute for tool permissions |
| Instructions | Repository-wide guidance and rules auto-applied to files matched by `applyTo` | A workflow engine or deterministic policy enforcement |
| `.github/aoh/` | AOH config, workflow definitions, schemas, templates, validators, adapters | VS Code-native discovery for arbitrary AOH files |
| `.aoh/` | Generated run state, logs, caches, optional local memory | A committed or automatically synchronized knowledge base |
| Project source tree | Existing application and team-owned source/tests | A prescribed AOH directory structure |

## Operating Model

- **One orchestrator, many subagents:** AOH defines one user-facing orchestrator. All specialists are subagents, not additional orchestrators or user-facing agents. Use division-wide `GMT-<specialist>.subagent.md` and team-specific `Alpha-<specialist>.subagent.md` / `Beta-<specialist>.subagent.md` definitions as needed.
- **Configure every delegation edge at the caller:** The orchestrator lists only its direct subagents in its `agents` frontmatter. A subagent that needs to delegate lists its own allowed child subagents in its own `agents` frontmatter and includes the `agent` tool. A nested subagent is invocable only when the immediate caller explicitly lists it; do not rely on a global registry or implicit transitive access. Use `agents: []` for a leaf subagent that cannot delegate.
- **Delegate with a bounded task:** The orchestrator invokes a configured subagent through the runtime's agent/subagent tool, passing the objective, relevant context, permitted file or path scope, constraints, and expected result format. This is an internal delegation: the child performs its assigned work and returns its result to the caller; it is not a user-facing handoff.
- **Subagents may make scoped repository changes:** A subagent can be configured with edit tools and instructions to change exactly one file, a named set of files, or a bounded path. Read-only subagents should not receive edit tools. Each task must say whether edits are allowed, list the intended scope, and require the subagent to report any out-of-scope changes or blockers rather than silently expanding scope. Since agents can share the workspace, avoid concurrent assignments that write the same files.
- **Require a structured completion report:** Every subagent returns a concise status block to its caller, whether it edited files or only analyzed them. At minimum report `status` (`completed`, `partial`, `blocked`, or `failed`), a result summary, files changed (or `none`), checks run and outcomes (or `not run`), blockers/risks, and a self-assessed confidence score with a short rationale. Include useful available metrics such as elapsed time or test counts, but do not invent unavailable values. Confidence and agent-reported checks are informational, not independent proof of correctness.
- **Orchestrator routes the result to the human:** The orchestrator summarizes the returned status, changes, checks, confidence, and unresolved risks, then asks the human whether to accept the work or approve the next workflow step. Per this AOH operating model, it does not independently re-review the implementation or claim to verify its quality by manually inspecting the subagent's changes. If the report is incomplete or blocked, it reports that plainly and asks how to proceed instead of presenting the work as successful.
- **Approval is an explicit workflow decision:** Human approval means accepting the reported result or authorizing the next stage. It does not roll back already-written workspace changes, prove correctness, or replace any separate approval mechanism required before a risky tool action. If edits must not happen before approval, the workflow must use a separate planning/approval stage before delegating implementation.
- **Keep subagents out of the user-facing picker:** Set `user-invocable: false` on every subagent. Keep `disable-model-invocation: false` (or omit it, since the default is `false`) when callers must invoke that subagent. Visibility and invocability are separate controls.
- **Bound nested delegation:** Define only the caller-to-child relationships needed for a task. In VS Code's Local harness, subagents cannot invoke further subagents by default; enable `chat.subagents.allowInvocationsFromSubagents` for nested delegation. Local nesting is limited to five levels. Verify equivalent behavior and limits in other harnesses, avoid cycles and unnecessary depth, and require each parent to summarize child results and remain accountable for its final output.
- **Use handoffs for user-directed transitions:** A handoff changes the active user-facing agent; it is distinct from an orchestrator invoking a subagent to complete its own task.
- **Use scoped instructions for file-based rules:** Put rules that should automatically accompany work on particular files in `.github/instructions/*.instructions.md` and define an `applyTo` glob, such as `src/api/**`. This is for path-based coding conventions (for example, API security rules), not agent identity, task procedures, or access control. Put short rules that apply to all work in `.github/copilot-instructions.md`.
- **Keep ownership organizational:** Prefixes, descriptions, and team folders help people navigate the setup, but workspace skills may be available across the workspace and agent declarations are not an access-control mechanism.
- **Keep hook integrations optional:** Local lifecycle hooks may provide useful event handling, but do not assume they run in Agent Host sessions or expose complete prompts, model context, or exact token usage. Core workflows must remain usable without hooks.
- **Keep state out of source control by default:** Add `.aoh/` to the repository's `.gitignore`. Commit only reviewed, non-sensitive reference knowledge under `.github/aoh/knowledge/`. Define retention, redaction, and access before enabling persistent memory or audit logging.
- **Use MCP only when needed:** A project may configure an MCP server for external state or domain tools in `.vscode/mcp.json` (or an organization-managed location). Do not require an MCP server for the baseline AOH architecture.
- **Validate rather than assume:** Provide schema and configuration validation for AOH-owned manifests; test native customization discovery and optional hooks in the VS Code versions and runtimes the project intends to support.

## Naming and Configuration Conventions

- **Orchestrator:** Keep the sole user-facing AOH orchestrator in `.github/agents/aoh-orchestrator.agent.md`.
- **Subagents:** Name division specialists `.github/agents/GMT-<specialist>.subagent.md` and team specialists `.github/agents/Alpha-<specialist>.subagent.md` or `.github/agents/Beta-<specialist>.subagent.md`. Give each a stable frontmatter `name`, set `user-invocable: false`, and declare child subagents only in that caller's `agents` list. VS Code's canonical custom-agent suffix is `.agent.md`; current VS Code documentation also says it detects any `.md` file in `.github/agents/`, allowing AOH to use `.subagent.md` as a naming convention. If targeting another host, verify that it discovers this suffix or use `.agent.md` filenames while retaining the subagent role in frontmatter.
- **Skills and helper scripts:** Put each skill in `.github/skills/<skill-name>/SKILL.md`. Set the required `name` to match the directory name and provide a clear `description` that explains when to use it. Put scripts and other resources used only by that skill under its directory (for example, `.github/skills/<skill-name>/scripts/` or `resources/`) and reference them from `SKILL.md`. Put shared AOH utilities—such as manifest validators or runtime adapters—under `.github/aoh/scripts/`. Put product/application scripts in the project's normal source layout, not in AOH.
- **Instructions:** Keep `.github/copilot-instructions.md` concise. Put focused rules in `.github/instructions/*.instructions.md` and use `applyTo` patterns when they should apply only to specific project paths.
- **AOH configuration:** Keep project identity, enabled features, and references to workflows in `.github/aoh/aoh.yaml`. Do not duplicate agent definitions or delegation allow-lists in a separate registry unless a concrete integration requires a generated index.
- **Delegation reports:** Define the required status-block fields in the orchestrator/subagent instructions or a shared skill, and keep the same contract at every nested delegation boundary. Treat self-reported confidence and metrics as estimates; label missing checks as `not run`, not as passing.
- **Workflows:** Put all reusable workflow definitions under `.github/aoh/workflows/`. Group them in `shared/` or by owner (for example `GMT/`, `Alpha/`, `Beta/`); these are organizational subfolders of one workflow catalog, not separate registries. Team workflows belong here too—there is no parallel `.github/aoh/teams/<team>/workflows/` tree.
- **Paths:** Use workspace-relative paths and forward slashes in configuration intended to work across Windows, macOS, and Linux. Resolve paths from the workspace root in executable tooling rather than assuming the process working directory.
- **Generated files:** Keep local run outputs under `.aoh/`, not alongside committed definitions. Never store secrets in agent prompts, skills, instructions, registries, or workflow files.

## Adoption Path

1. Add the minimal `.github/agents/`, `.github/skills/`, `.github/instructions/`, and `.github/aoh/` structure to the target repository.
2. Define only the project-specific identity and enabled features in `.github/aoh/aoh.yaml`; begin without teams, hooks, external memory, or mandatory MCP services.
3. Add the single user-facing orchestrator and explicitly scope its tools and direct subagents. Add specialist subagents only for distinct responsibilities; configure any nested delegation in each immediate caller's own definition.
4. Add reusable procedures as skills and project workflows under `.github/aoh/workflows/`; refer to existing source and test paths.
5. Add `.aoh/` to `.gitignore`. If runtime persistence, telemetry, or hooks are later enabled, document supported runtimes, data captured, retention, and redaction first.
6. Validate agent/skill discovery, workflow references, path portability, and any optional runtime integrations before adopting AOH across repositories.
