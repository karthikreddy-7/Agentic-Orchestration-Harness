// Builds an agent's AOH context: every config.md from the knowledge root down
// to the folder named after the agent, concatenated in order. The folder's
// position in the tree is the only thing that says which division and team an
// agent belongs to; there is no registry.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// "Trade Capture Developer" -> "trade-capture-developer"
export function agentFolderName(agentName) {
  return String(agentName).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// All folders under the knowledge root that are named `folderName`.
export function findAgentFolders(knowledgeRoot, folderName) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (!statSync(full).isDirectory()) continue;
      if (entry === folderName) found.push(full);
      walk(full);
    }
  };
  if (existsSync(knowledgeRoot)) walk(knowledgeRoot);
  return found;
}

// The config.md files from the root down to `agentDir`, in injection order.
export function configChain(knowledgeRoot, agentDir) {
  const parts = relative(knowledgeRoot, agentDir).split(sep).filter(Boolean);
  const dirs = [knowledgeRoot];
  for (const p of parts) dirs.push(join(dirs.at(-1), p));
  return dirs.map((d) => join(d, 'config.md')).filter((f) => existsSync(f));
}

// Returns { text, files } or null when the agent has no knowledge folder
// (for example a built-in subagent that AOH does not manage).
export function buildContext(knowledgeRoot, agentName) {
  const folders = findAgentFolders(knowledgeRoot, agentFolderName(agentName));
  if (folders.length !== 1) return null;
  const files = configChain(knowledgeRoot, folders[0]);
  const body = files
    .map((f) => {
      const rel = relative(knowledgeRoot, f).split(sep).join('/');
      return `<!-- .github/aoh/knowledge/${rel} -->\n${readFileSync(f, 'utf8').trim()}`;
    })
    .join('\n\n');
  return {
    files,
    text: `# AOH context for ${agentName}\n\nThese rules are mandatory. They are listed from the widest layer (shared) to the narrowest (you).\n\n${body}\n`,
  };
}
