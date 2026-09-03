/**
 * One-off capture driver for the till-reconciliation case study.
 *
 * This tool is not one of the seven simple "load and screenshot" targets in
 * capture.mjs — it needs synthetic files uploaded through two dropzones
 * before there is anything on screen worth capturing. Kept separate so
 * capture.mjs stays a flat list of URLs.
 *
 * Prerequisites:
 *   1. node scripts/demo/generate-demo-reconciliation.mjs
 *   2. the `reconciliation-caisse` project's dev server running (npm run dev)
 *
 * Usage:
 *   node scripts/captures/capture-reconciliation.mjs <dev-server-url>
 */
import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const fixtures = join(root, 'scripts', 'demo', 'out', 'reconciliation');
const outDir = join(root, 'public', 'images', 'realisations');
const url = process.argv[2] ?? 'http://localhost:5180';

await mkdir(outDir, { recursive: true });

const zFiles = [501, 502, 503].map((z) => join(fixtures, `ReportZStats_1_${z}.xlsx`));
const caFiles = [501, 502, 503].map((z) => join(fixtures, `CA_1_${z}.xlsx`));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.setViewportSize({ width: 1600, height: 1000 });

await page.goto(url, { waitUntil: 'networkidle' });

await page.locator('#recap-input').setInputFiles(join(fixtures, 'recap-DEMO.xlsx'));
await page.waitForTimeout(500);
await page.locator('#src-input').setInputFiles([...zFiles, ...caFiles]);
await page.waitForTimeout(1200);

await page.locator('button:has-text("Calculer la réconciliation")').click();
await page.waitForTimeout(800);

// Two spots in the page hardcode the real client's name (App.tsx:143 and
// :159) — out of scope to edit their source for a screenshot. Neutralising
// both here, in the capture script, keeps the anonymisation rule without
// touching their repo.
await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  if (h1) h1.style.display = 'none';
  for (const code of document.querySelectorAll('code')) {
    if (code.textContent?.includes('SAINT KILDA')) {
      code.textContent = 'RECAP ANNUEL.xlsx';
    }
  }
});

const file = join(outDir, 'reconciliation-caisse.jpg');
await page.screenshot({ path: file, type: 'jpeg', quality: 82, fullPage: false });
console.log(`ok   reconciliation-caisse -> ${file}`);

await browser.close();
