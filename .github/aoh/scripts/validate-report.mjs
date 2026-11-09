#!/usr/bin/env node
// Validate subagent status reports against subagent-result.schema.json.
// Usage: npm run validate-reports -- <file | dir> [...]
// A file may be pure JSON or a markdown reply; for markdown the last ```json block is used.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from './lib/mini-schema.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(join(here, '../schemas/subagent-result.schema.json'), 'utf8'));

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const blocks = [...text.matchAll(/```json\s*\n([\s\S]*?)```/g)];
    if (blocks.length === 0) throw new Error('not JSON and no ```json block found');
    return JSON.parse(blocks.at(-1)[1]);
  }
}

function collect(target) {
  if (!statSync(target).isDirectory()) return [target];
  return readdirSync(target)
    .filter((f) => f.endsWith('.json') || f.endsWith('.md'))
    .sort()
    .map((f) => join(target, f));
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('usage: validate-report <file | dir> [...]');
  process.exit(2);
}

let failed = 0;
let count = 0;
for (const file of targets.flatMap(collect)) {
  count++;
  let errors;
  try {
    errors = validate(schema, extractJson(readFileSync(file, 'utf8')));
  } catch (e) {
    errors = [e.message];
  }
  if (errors.length) {
    failed++;
    console.log(`FAIL ${file}`);
    for (const e of errors) console.log(`  - ${e}`);
  } else {
    console.log(`ok   ${file}`);
  }
}
if (count === 0) {
  console.error('no report files found');
  process.exit(2);
}
console.log(`\n${count - failed}/${count} reports valid`);
process.exit(failed ? 1 : 0);
