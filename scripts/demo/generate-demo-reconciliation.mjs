#!/usr/bin/env node
/**
 * Demonstration fixtures for the till-reconciliation case study.
 *
 * The real files carry a restaurant's daily takings and bank details — never
 * publishable. This recreates the exact column layout the app expects
 * (src/reconcile.ts in the `reconciliation-caisse` project) with invented
 * numbers, so the capture shows the real three-state UI (new / consistent /
 * conflict) without exposing anything real.
 *
 * Output: scripts/demo/out/reconciliation/
 *   recap-DEMO.xlsx        — annual recap, sheet "AVRIL", 3 days pre-filled
 *   ReportZStats_1_501.xlsx, CA_1_501.xlsx   — day 3: no prior data   -> new (green)
 *   ReportZStats_1_502.xlsx, CA_1_502.xlsx   — day 7: matches recap  -> consistent (orange)
 *   ReportZStats_1_503.xlsx, CA_1_503.xlsx   — day 12: differs       -> conflict (red)
 */
import ExcelJS from 'exceljs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'out', 'reconciliation');
await mkdir(outDir, { recursive: true });

const DAYS = [
  { day: 3, z: 501, caTTC: 1842.5, ttc21: 1200.0, ttc12: 420.0, ttc6: 222.5, cartes: 1300.0, virement: 100.0, cash: 442.5, prefill: null },
  { day: 7, z: 502, caTTC: 2105.0, ttc21: 1400.0, ttc12: 480.0, ttc6: 225.0, cartes: 1500.0, virement: 150.0, cash: 455.0, prefill: 'match' },
  { day: 12, z: 503, caTTC: 1990.75, ttc21: 1300.0, ttc12: 450.0, ttc6: 240.75, cartes: 1400.0, virement: 120.0, cash: 470.75, prefill: 'conflict' },
];

// ---------- Recap workbook: one sheet, "AVRIL" ----------
const recap = new ExcelJS.Workbook();
const ws = recap.addWorksheet('AVRIL');
ws.getRow(1).values = ['SAINT-EXEMPLE — CAISSES 2026 (démonstration)'];
ws.getRow(2).values = [
  'Jour', 'Z N°', 'Total TVAC', 'Total 21%', 'Total 12%', 'Total 6%',
  'Paiements cartes', 'Virement client', 'CASH',
];
for (let day = 1; day <= 30; day++) {
  const row = ws.getRow(2 + day);
  row.getCell(1).value = day;
  const entry = DAYS.find((d) => d.day === day);
  if (entry?.prefill === 'match') {
    row.getCell(2).value = entry.z;
    row.getCell(3).value = entry.caTTC;
    row.getCell(4).value = entry.ttc21;
    row.getCell(5).value = entry.ttc12;
    row.getCell(6).value = entry.ttc6;
    row.getCell(7).value = entry.cartes;
    row.getCell(8).value = entry.virement;
    row.getCell(9).value = entry.cash;
  } else if (entry?.prefill === 'conflict') {
    // Deliberately wrong numbers already sitting in the recap, so the app
    // flags a conflict instead of silently overwriting them.
    row.getCell(2).value = entry.z;
    row.getCell(3).value = entry.caTTC - 300; // wrong on purpose
    row.getCell(4).value = entry.ttc21;
    row.getCell(5).value = entry.ttc12;
    row.getCell(6).value = entry.ttc6;
    row.getCell(7).value = entry.cartes - 300;
    row.getCell(8).value = entry.virement;
    row.getCell(9).value = entry.cash;
  }
}
await recap.xlsx.writeFile(join(outDir, 'recap-DEMO.xlsx'));

// ---------- One ReportZStats + CA pair per day ----------
async function writeFlatSheet(filename, headers, values) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('Sheet1');
  sheet.getRow(1).values = headers;
  sheet.getRow(2).values = values;
  await wb.xlsx.writeFile(join(outDir, filename));
}

for (const d of DAYS) {
  const openDate = `${String(d.day).padStart(2, '0')}/04/2026 22:15`;
  const closeDate = `${String(d.day).padStart(2, '0')}/04/2026 23:58`;
  await writeFlatSheet(
    `ReportZStats_1_${d.z}.xlsx`,
    ["Rapport Z", "Date d'ouverture", 'Date de fermeture', 'CA TTC', 'TTC 21%', 'TTC 12%', 'TTC 6%', 'Tickets'],
    [d.z, openDate, closeDate, d.caTTC, d.ttc21, d.ttc12, d.ttc6, 47]
  );
  await writeFlatSheet(
    `CA_1_${d.z}.xlsx`,
    ['Date', 'Cash', 'Carte banque', 'Virement bancaire'],
    [`${String(d.day).padStart(2, '0')}/04/2026`, d.cash, d.cartes, d.virement]
  );
}

console.log(`Demo fixtures written to ${outDir}`);
console.log('Load order in the app: recap-DEMO.xlsx first, then all ReportZStats_*/CA_* together.');
