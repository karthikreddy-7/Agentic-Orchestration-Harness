---
name: <Team> Orchestrator
description: User-facing orchestrator for <Team> work. <Who it plans with and delegates to.>
tools: ['agent', 'read', 'search', 'edit']
agents: ['<Division> Architect', '<Team> Developer', '<Team> Reviewer']
hooks:
  sessionStart:
    - type: command
      command: node .github/hooks/aoh-context.mjs --agent "<Team> Orchestrator"
      timeoutSec: 10
---

<Copy the body of .github/agents/trade-capture-orchestrator.agent.md and replace the agent name.>
