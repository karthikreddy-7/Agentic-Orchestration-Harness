#!/usr/bin/env node
// Local consistency check for the AOH configuration. Run: npm run check
//  agents     name/description/tools present, unique names; only *Orchestrator agents are
//             user-invocable; every `agents:` entry resolves; delegating agents have the
//             `agent` tool; subagents delegate to nobody (flat hierarchy); orchestrators
//             carry a sessionStart hook that passes their own name
//  knowledge  every agent has exactly one knowledge folder with a config.md
//  workflows  every agent named in a workflow exists
//  skills     SKILL.md name matches its folder; skills named in config.md files exist
//  schema     parses, uses only enforced keywords, example reports pass/fail as named

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate, unsupportedKeywords } from './lib/mini-schema.mjs';
import { agentFolderName, findAgentFolders } from './lib/context.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const knowledgeRoot = join(root, '.github/aoh/knowledge');
const problems = [];
const rel = (p) => relative(root, p).split(sep).join('/');

// Just enough YAML for top-level frontmatter keys: `key: value` and `key: ['a', 'b']`.
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const raw = kv[2].trim();
    if (raw.startsWith('[')) {
      out[key] = raw.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else if (raw === 'true' || raw === 'false') {
      out[key] = raw === 'true';
    } else {
      out[key] = raw.replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

function walk(dir, match, out = []) {
  for (const entry of existsSync(dir) ? readdirSync(dir) : []) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, match, out);
    else if (match(entry)) out.push(full);
  }
  return out;
}

// ---- agents ----
const agentsDir = join(root, '.github/agents');
const agents = readdirSync(agentsDir)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const text = readFileSync(join(agentsDir, file), 'utf8');
    return { file, text, fm: frontmatter(text) };
  });

const names = new Map();
for (const { file, fm } of agents) {
  if (!fm) { problems.push(`${file}: missing frontmatter`); continue; }
  for (const key of ['name', 'description', 'tools']) {
    if (fm[key] == null || fm[key] === '') problems.push(`${file}: missing "${key}"`);
  }
  if (fm.name) {
    if (names.has(fm.name)) problems.push(`${file}: duplicate name "${fm.name}" (also in ${names.get(fm.name)})`);
    names.set(fm.name, file);
  }
}

const isOrchestrator = (fm) => /Orchestrator$/.test(fm.name ?? '');

function checkRefs(where, list) {
  for (const target of list) {
    if (target === '*') problems.push(`${where}: "agents: ['*']" defeats the allow-list`);
    else if (!names.has(target)) problems.push(`${where}: "${target}" does not match any agent name (case-sensitive)`);
  }
}

for (const { file, text, fm } of agents) {
  if (!fm?.name) continue;
  const userFacing = fm['user-invocable'] !== false;
  if (isOrchestrator(fm) && !userFacing) problems.push(`${file}: orchestrators must be user-invocable`);
  if (!isOrchestrator(fm) && userFacing) problems.push(`${file}: subagents must set user-invocable: false`);

  if (fm.agents == null) { problems.push(`${file}: no "agents" list (VS Code then allows ALL agents); use [] for none`); continue; }
  if (!Array.isArray(fm.agents)) { problems.push(`${file}: "agents" must be a list`); continue; }
  checkRefs(file, fm.agents);
  if (fm.agents.length && !(fm.tools ?? []).includes('agent')) problems.push(`${file}: lists agents but lacks the "agent" tool`);
  if (!isOrchestrator(fm) && fm.agents.length) problems.push(`${file}: subagents must not delegate (flat hierarchy); use agents: []`);
  for (const target of fm.agents) {
    if (/Orchestrator$/.test(target)) problems.push(`${file}: may not call another orchestrator ("${target}")`);
  }

  if (isOrchestrator(fm)) {
    if (!/^\s+sessionStart:/m.test(text) || !text.includes(`aoh-context.mjs --agent "${fm.name}"`)) {
      problems.push(`${file}: needs an agent-scoped sessionStart hook running aoh-context.mjs --agent "${fm.name}"`);
    }
  }

  // ---- knowledge ----
  const folder = agentFolderName(fm.name);
  const found = findAgentFolders(knowledgeRoot, folder);
  if (found.length === 0) problems.push(`${file}: no knowledge folder "${folder}/" under .github/aoh/knowledge/`);
  else if (found.length > 1) problems.push(`${file}: ${found.length} knowledge folders named "${folder}/": ${found.map(rel).join(', ')}`);
  else if (!existsSync(join(found[0], 'config.md'))) problems.push(`${rel(found[0])}: missing config.md`);
}

if (!existsSync(join(knowledgeRoot, 'config.md'))) problems.push('.github/aoh/knowledge/config.md (shared layer) is missing');

// ---- workflows ----
for (const wf of walk(knowledgeRoot, (f) => f.endsWith('.md') && f !== 'config.md' && f !== 'README.md')) {
  if (!rel(wf).includes('/workflows/')) continue;
  checkRefs(rel(wf), frontmatter(readFileSync(wf, 'utf8'))?.agents ?? []);
}

// ---- skills ----
const skillsDir = join(root, '.github/skills');
const skills = new Set();
for (const dir of existsSync(skillsDir) ? readdirSync(skillsDir) : []) {
  const file = join(skillsDir, dir, 'SKILL.md');
  if (!existsSync(file)) { problems.push(`.github/skills/${dir}: missing SKILL.md`); continue; }
  const fm = frontmatter(readFileSync(file, 'utf8'));
  if (fm?.name !== dir) problems.push(`.github/skills/${dir}/SKILL.md: name "${fm?.name}" must equal folder name`);
  if (!fm?.description) problems.push(`.github/skills/${dir}/SKILL.md: missing description`);
  skills.add(dir);
}
for (const cfg of walk(knowledgeRoot, (f) => f === 'config.md')) {
  const section = readFileSync(cfg, 'utf8').split(/^### Skills you can pull/m)[1] ?? '';
  for (const [, skill] of section.matchAll(/^- `([a-z0-9-]+)`/gm)) {
    if (!skills.has(skill)) problems.push(`${rel(cfg)}: lists skill "${skill}" which does not exist`);
  }
}

// ---- schema ----
const schemaDir = join(root, '.github/aoh/schemas');
let schema;
try {
  schema = JSON.parse(readFileSync(join(schemaDir, 'subagent-result.schema.json'), 'utf8'));
} catch (e) {
  problems.push(`subagent-result.schema.json: ${e.message}`);
}
if (schema) {
  for (const k of unsupportedKeywords(schema)) problems.push(`schema keyword not enforced by validator: ${k}`);
  const exDir = join(schemaDir, 'examples');
  for (const f of existsSync(exDir) ? readdirSync(exDir).filter((x) => x.endsWith('.json')) : []) {
    const errors = validate(schema, JSON.parse(readFileSync(join(exDir, f), 'utf8')));
    if (f.startsWith('valid-') && errors.length) problems.push(`examples/${f}: should pass: ${errors.join('; ')}`);
    if (f.startsWith('invalid-') && !errors.length) problems.push(`examples/${f}: should be rejected but passed`);
  }
}

if (problems.length) {
  console.log(`AOH config check: ${problems.length} problem(s)`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
const orchestrators = agents.filter((a) => a.fm && isOrchestrator(a.fm)).length;
console.log(`AOH config check: ok (${orchestrators} orchestrators, ${agents.length - orchestrators} subagents, ${skills.size} skills, schema valid)`);
