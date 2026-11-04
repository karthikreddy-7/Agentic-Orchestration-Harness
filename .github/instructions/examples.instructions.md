---
description: Coding rules for the AOH demo code under examples/. Added to an agent's context whenever it works on these files.
applyTo: 'examples/**'
---

- Plain modern JavaScript: ES modules (`.mjs`), Node 20+, no dependencies.
- Tests use `node:test` and `node:assert/strict`, in a `*.test.mjs` file next to the module.
- Keep functions pure and small. No I/O, no globals, no clock.
- Run `npm test` after changes and report the real result.

`applyTo` decides when these rules are added to context. It does not stop an agent from editing other paths.
