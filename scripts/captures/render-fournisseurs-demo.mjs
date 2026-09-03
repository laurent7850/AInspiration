/**
 * Renders a screenshot of the demo supplier workbook's first sheet.
 *
 * No spreadsheet viewer is installed in this environment (no LibreOffice), so
 * rather than shell out to one, this rebuilds the sheet as HTML using the
 * exact same fixture data as scripts/demo/generate-demo-fournisseurs.py and
 * the exact same colours (#2F5496 header, #D6E4F0 category band) — then
 * screenshots that. The two files must be kept in sync by hand; if the
 * Python fixture data changes, mirror it in FIXTURE below.
 */
import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'public', 'images', 'realisations');
await mkdir(outDir, { recursive: true });

const HEADERS = ['Code Produit', 'Article / Description', 'Quantité', 'Prix Unitaire', 'TVA', 'Montant'];

const FIXTURE = [
  { cat: 'FRAIS', rows: [
    ['F-1042', 'Beurre de baratte doux 250 g', '24', '2,85 €', '6 %', '68,40 €'],
    ['F-1078', 'Crème épaisse 35 % — 1 L', '12', '4,10 €', '6 %', '49,20 €'],
    ['F-1155', 'Œufs plein air calibre M — plaque de 30', '8', '6,95 €', '6 %', '55,60 €'],
    ['F-1203', 'Pâte feuilletée pur beurre 2 kg', '6', '11,40 €', '6 %', '68,40 €'],
    ['F-1310', 'Lardons fumés 500 g', '10', '4,75 €', '6 %', '47,50 €'],
  ]},
  { cat: 'SEC', rows: [
    ['S-2011', 'Farine T55 — sac 25 kg', '4', '18,90 €', '6 %', '75,60 €'],
    ['S-2046', 'Riz arborio 5 kg', '6', '13,25 €', '6 %', '79,50 €'],
    ['S-2088', "Huile d'olive vierge extra 5 L", '3', '42,00 €', '6 %', '126,00 €'],
    ['S-2130', 'Sel de Guérande 1 kg', '12', '2,40 €', '6 %', '28,80 €'],
    ['S-2177', 'Poivre noir concassé 500 g', '4', '9,80 €', '6 %', '39,20 €'],
  ]},
  { cat: 'CONGELÉ', rows: [
    ['C-3005', 'Frites fraîches surgelées 10 mm — 2,5 kg', '20', '4,35 €', '6 %', '87,00 €'],
    ['C-3062', 'Petits pois extra-fins 2,5 kg', '8', '5,60 €', '6 %', '44,80 €'],
    ['C-3118', 'Framboises entières 1 kg', '6', '8,90 €', '6 %', '53,40 €'],
  ]},
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin:0; font-family: Arial, sans-serif; background:#fff; }
  table { border-collapse: collapse; width: 1600px; }
  th, td { border: 1px solid #CCCCCC; padding: 8px 12px; font-size: 14px; text-align: left; }
  th { background:#2F5496; color:#fff; font-weight:bold; text-align:center; }
  td:nth-child(3), td:nth-child(4), td:nth-child(6) { text-align: right; }
  td:nth-child(5) { text-align: center; }
  .cat td { background:#D6E4F0; color:#2F5496; font-weight:bold; }
  .tabsbar { display:flex; gap:2px; background:#e8e8e8; padding:6px 6px 0; width:1600px; box-sizing:border-box; }
  .tab { padding:8px 18px; font-size:13px; font-family: Arial, sans-serif; border-radius:4px 4px 0 0; }
  .tab.active { background:#fff; font-weight:bold; border:1px solid #ccc; border-bottom:none; }
  .tab:not(.active) { background:#d8d8d8; color:#555; }
</style></head><body>
  <div class="tabsbar">
    <div class="tab active">Verhaegen Traiteur</div>
    <div class="tab">Cave Saint-Roch</div>
    <div class="tab">Marée du Nord</div>
    <div class="tab">Primeurs Vanderlinden</div>
    <div class="tab">Fromagerie Lambrecht</div>
    <div class="tab">Distri Boissons</div>
    <div class="tab">Hygiène Pro</div>
  </div>
  <table>
    <tr>${HEADERS.map((h) => `<th>${h}</th>`).join('')}</tr>
    ${FIXTURE.map(
      (block) =>
        `<tr class="cat"><td colspan="6">${block.cat}</td></tr>` +
        block.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
    ).join('')}
  </table>
</body></html>`;

const tmp = join(root, 'scripts', 'demo', 'out', '_fournisseurs-preview.html');
await writeFile(tmp, html, 'utf-8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(`file://${tmp}`);
await page.screenshot({
  path: join(outDir, 'factures-fournisseurs.jpg'),
  type: 'jpeg',
  quality: 85,
  clip: { x: 0, y: 0, width: 1600, height: 1000 },
});
await browser.close();
console.log('ok   factures-fournisseurs');
