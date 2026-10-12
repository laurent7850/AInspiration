#!/usr/bin/env node
// Static check: every literal t('key') call in src/ must resolve in the
// namespace it is called from, for fr, en and nl.
//
// i18next has no fallback namespace here: a key that lives in common.json but
// is called from useTranslation('features') renders the raw key on the page
// ("animatedStats.audit" under the 30 min card, 2026-08-29 → 2026-10-12).
//
// Resolution rules mirrored from src/i18n.ts and react-i18next:
//   - useTranslation('ns') or useTranslation(['ns', ...]) → first entry is the
//     default namespace; bare useTranslation() → 'common'
//   - 'ns:key' prefix and { ns: 'x' } option override it
//   - { returnObjects: true } may legitimately resolve to an object
// Template-literal keys are skipped (they cannot be resolved statically).
//
// Usage: node scripts/check-i18n-keys.mjs   (exit 1 when a key is missing)

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const langs = ['fr', 'en', 'nl'];

const locales = {};
for (const lang of langs) {
  locales[lang] = {};
  const dir = path.join(root, 'public/locales', lang);
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    locales[lang][file.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
}

const lookup = (obj, key) =>
  key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['test', '__tests__'].includes(entry.name)) sourceFiles(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

const problems = [];
let dynamicKeys = 0;

for (const file of sourceFiles(path.join(root, 'src'))) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).split(path.sep).join('/');

  const hooks = [...src.matchAll(/useTranslation\(\s*(?:\[([^\]]*)\]|['"]([^'"]+)['"])?\s*\)/g)];
  if (hooks.length === 0) continue; // t() came from a prop or a helper: not resolvable here
  const first = hooks[0];
  const defaultNs = first[1]
    ? first[1].split(',')[0].trim().replace(/['"]/g, '')
    : first[2] || 'common';

  for (const m of src.matchAll(/\bt\(\s*(['"`])([^'"`]*)\1\s*(,|\))/g)) {
    const [, quote, raw, next] = m;
    if (quote === '`' && raw.includes('${')) { dynamicKeys++; continue; }
    const call = src.slice(m.index, m.index + 200);
    const nsOption = /^[^)]*\{[^}]*\bns:\s*['"]([a-zA-Z]+)['"]/.exec(call);
    const returnObjects = next === ',' && /^[^)]*returnObjects/.test(call);

    let ns = defaultNs;
    let key = raw;
    if (raw.includes(':')) [ns, key] = raw.split(/:(.*)/s);
    if (nsOption) ns = nsOption[1];

    const missing = [];
    for (const lang of langs) {
      const nsObj = locales[lang][ns];
      if (!nsObj) { missing.push(`${lang} (namespace ${ns} has no file)`); continue; }
      const value = lookup(nsObj, key);
      if (value === undefined) missing.push(lang);
      else if (typeof value === 'object' && !returnObjects) missing.push(`${lang} (object, not a string)`);
    }
    if (missing.length) {
      const line = src.slice(0, m.index).split('\n').length;
      problems.push(`${rel}:${line}  ${ns}:${key}  missing in ${missing.join(', ')}`);
    }
  }
}

if (problems.length) {
  console.error(`[i18n-keys] ${problems.length} unresolved key(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`[i18n-keys] every literal key resolves in fr/en/nl (${dynamicKeys} dynamic keys skipped).`);
