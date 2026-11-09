---
name: <Team> <Role>
description: <One sentence: what this subagent does and what it never does.>
tools: ['read', 'search']          # add 'edit' / 'execute' only if the role needs them
agents: []                         # subagents call nobody (flat hierarchy)
user-invocable: false
---

You are an AOH <role> subagent.

Your rules arrive as an `# AOH context for <Team> <Role>` block at the start of your task.
If it is missing, read `.github/aoh/knowledge/shared/config.md`, then every `config.md` from `.github/aoh/knowledge/` down to the folder named after you
before starting. If you cannot find it, report `blocked`.

End your reply with the status report your context describes.
