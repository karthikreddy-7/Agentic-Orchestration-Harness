# AOH hooks

Hooks are the **push** half of AOH's context model: they inject each agent's `config.md` chain from `.github/aoh/knowledge/`.

| Hook | Where it is registered | Fires for | Agent name from |
|---|---|---|---|
| `subagentStart` | `aoh-context.json` (repository hook) | every subagent | stdin `agentName` |
| `sessionStart` | `hooks:` frontmatter of each `*-orchestrator.agent.md` | the selected orchestrator | `--agent "<name>"` argument |

Both run `aoh-context.mjs`, which returns `{ "additionalContext": "..." }`. Copilot prepends it to the subagent's first message, or adds it to the session for orchestrators. Agents without a knowledge folder, such as built-in subagents, get nothing injected.

Preview what an agent receives:

```bash
npm run context -- "Trade Capture Developer"
```

## Notes

- Hooks need a trusted workspace. In the Local harness they also need `chat.useHooks`.
- Hook failures and timeouts are **fail-open**: the agent runs without its context. Every agent's instructions therefore say to load the chain itself if the `# AOH context for …` block is missing.
- The hook reads only files under `.github/aoh/knowledge/`.
- **Trace (`features.hook_trace` in `aoh.yaml`, on in the example):** each firing appends one line to `.aoh/logs/hook-trace.log` with the time, event, agent name and number of config files injected. It never logs prompts or file contents. Use it to confirm hooks actually fire; set it to `false` to turn it off.
