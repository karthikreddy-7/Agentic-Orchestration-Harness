#!/usr/bin/env node
// AOH context hook: pushes an agent's config.md chain into its context.
//
//   subagentStart (repo hook, aoh-context.json): agent name comes from stdin `agentName`.
//   sessionStart (agent-scoped hook in each orchestrator's frontmatter): name comes from --agent.
//   Manual preview: node .github/hooks/aoh-context.mjs --agent "Trade Capture Developer" --print
//
// Prints one JSON object on stdout: { "additionalContext": "..." }, or {} when the agent
// has no knowledge folder (e.g. built-in subagents). Diagnostics go to stderr only.

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContext } from '../aoh/scripts/lib/context.mjs';

const knowledgeRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../aoh/knowledge');

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function readStdin() {
  if (process.stdin.isTTY) return {};
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const input = argValue('--agent') ? {} : await readStdin();
const agent =
  argValue('--agent') ?? input.agentName ?? input.agent_name ?? input.agentDisplayName ?? input.agent_display_name;

if (!agent) {
  console.error('aoh-context: no agent name (pass --agent or provide agentName on stdin)');
  process.stdout.write('{}\n');
  process.exit(0);
}

const context = buildContext(knowledgeRoot, agent);
if (!context) {
  console.error(`aoh-context: no single knowledge folder for "${agent}"; nothing injected`);
  process.stdout.write('{}\n');
  process.exit(0);
}

if (process.argv.includes('--print')) {
  process.stdout.write(context.text);
} else {
  process.stdout.write(JSON.stringify({ additionalContext: context.text }) + '\n');
}
