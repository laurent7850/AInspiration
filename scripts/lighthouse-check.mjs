#!/usr/bin/env node
/**
 * Lighthouse budgets for the weekly health check (mobile emulation, the
 * scoring Google uses). Fails when a category drops below its budget.
 *
 *   node scripts/lighthouse-check.mjs [https://site]
 *   LH_MIN_PERF=0.5 LH_MIN_A11Y=0.9 LH_MIN_BP=0.8 LH_MIN_SEO=0.9   (defaults)
 *
 * Needs Chrome/Chromium on the machine (present on ubuntu-latest runners).
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SITE = (process.argv[2] || process.env.SITE_URL || 'https://ainspiration.eu').replace(/\/+$/, '');
const PAGES = ['/', '/solutions', '/blog'];
const BUDGET = {
  performance: Number(process.env.LH_MIN_PERF ?? 0.5),
  accessibility: Number(process.env.LH_MIN_A11Y ?? 0.9),
  'best-practices': Number(process.env.LH_MIN_BP ?? 0.8),
  seo: Number(process.env.LH_MIN_SEO ?? 0.9),
};
const CATEGORIES = Object.keys(BUDGET);

const dir = mkdtempSync(join(tmpdir(), 'lh-'));
const rows = [];
const failures = [];

for (const path of PAGES) {
  const url = SITE + path;
  const out = join(dir, path.replace(/[^a-z0-9]+/gi, '_') + '.json');
  try {
    execFileSync(
      'npx',
      [
        '--yes', 'lighthouse@12', url,
        '--output=json', `--output-path=${out}`, '--quiet',
        `--only-categories=${CATEGORIES.join(',')}`,
        '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
      ],
      { stdio: ['ignore', 'inherit', 'inherit'], shell: process.platform === 'win32', timeout: 240_000 }
    );
  } catch (err) {
    failures.push(`${path}: lighthouse did not run (${err.message.split('\n')[0]})`);
    continue;
  }
  const report = JSON.parse(readFileSync(out, 'utf8'));
  const scores = Object.fromEntries(CATEGORIES.map((c) => [c, report.categories[c]?.score ?? 0]));
  for (const c of CATEGORIES) {
    if (scores[c] < BUDGET[c]) failures.push(`${path}: ${c} ${Math.round(scores[c] * 100)} < budget ${Math.round(BUDGET[c] * 100)}`);
  }
  const lcp = report.audits['largest-contentful-paint']?.displayValue || '';
  const cls = report.audits['cumulative-layout-shift']?.displayValue || '';
  rows.push(`| ${path} | ${CATEGORIES.map((c) => Math.round(scores[c] * 100)).join(' | ')} | ${lcp} | ${cls} |`);
}

const table = [
  `## Lighthouse (mobile) — ${SITE}`,
  '',
  '| Page | Perf | A11y | Best practices | SEO | LCP | CLS |',
  '|---|---|---|---|---|---|---|',
  ...rows,
  '',
  `Budgets: ${CATEGORIES.map((c) => `${c} ≥ ${Math.round(BUDGET[c] * 100)}`).join(', ')}`,
  '',
  ...(failures.length ? ['### ❌ Below budget', ...failures.map((f) => `- ${f}`), ''] : ['✅ All pages within budget', '']),
].join('\n');

console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, table + '\n');
process.exit(failures.length ? 1 : 0);
