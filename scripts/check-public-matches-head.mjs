// Refuses a production build whose public/ assets are not exactly the committed ones.
//
// Why this exists. On 2026-09-19 the site served a client's name for half an
// hour. Nothing in the code was wrong: a OneDrive sync conflict had put an old,
// pre-anonymisation screenshot back under the original filename and kept the
// good one aside as `<name>-<MACHINE>.jpg`. `git status` showed "one file
// modified, one untracked" — read as somebody else's leftovers, never opened —
// and three deploys shipped the wrong bytes. The stray copy even rode along
// into dist/ and into the manifest, which quietly went from 209 to 210 entries.
//
// No test could have caught it: the health check reads status codes, raw HTML
// and headers, and a client's name inside a JPEG escapes all of that. So the
// guard is placed where the damage happens — between the build and the deploy —
// and it compares bytes, not intentions.
//
// Three checks, all against HEAD:
//   1. public/ is clean (nothing modified, deleted, or untracked);
//   2. every committed public/ file is in dist/ with the same content, compared
//      by git blob hash;
//   3. dist/ carries no extra file inside a directory that mirrors public/ —
//      that is how the OneDrive conflict copy travelled.
//
// Runs as a `postbuild` hook on the production builds only, so day-to-day work
// on an uncommitted image is not blocked. Set ALLOW_DIRTY_PUBLIC=1 to override,
// which is a decision to deploy files nobody can trace back to a commit.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(projectRoot, 'dist');
const TAG = '[public-check]';

// Vite copies public/ verbatim, then the compression plugin adds twins next to
// the copies. Those are build output, not stray files.
const BUILD_TWIN = /\.(br|gz|map)$/i;

const git = (args) =>
  execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const fail = (lines) => {
  console.error(`\n${TAG} REFUS DE DÉPLOIEMENT — public/ ne correspond pas à HEAD\n`);
  for (const line of lines) console.error(`  ${line}`);
  console.error(
    [
      '',
      '  Ce que ça veut dire : les fichiers qui partiraient en ligne ne sont pas ceux',
      '  du dépôt. Un conflit de synchronisation peut avoir remis une ancienne version',
      "  en place — c'est ce qui a mis le nom d'un client en production le 19/09/2026.",
      '',
      '  Avant de déployer : ouvre chaque fichier listé, décide, puis commite ou restaure',
      '  (git checkout -- <fichier>), et reconstruis.',
      '',
    ].join('\n'),
  );
  process.exit(1);
};

if (process.env.ALLOW_DIRTY_PUBLIC === '1') {
  console.warn(`${TAG} ALLOW_DIRTY_PUBLIC=1 — contrôle désactivé, les fichiers déployés ne seront pas traçables.`);
  process.exit(0);
}

let head;
try {
  head = git(['rev-parse', 'HEAD']).trim();
} catch {
  fail([
    "git est introuvable, ou ce dossier n'est pas un dépôt : impossible de vérifier",
    'ce qui partirait en ligne. Le contrôle refuse plutôt que de laisser passer.',
  ]);
}

if (!existsSync(distDir)) {
  console.error(`${TAG} dist/ absent — lance le build d'abord.`);
  process.exit(1);
}

const problemes = [];

// 1. public/ clean against HEAD, untracked files included.
//
// Do NOT trim() this output: an unstaged change is reported as " M path", with
// a leading space, and trimming shifts every path one character to the left.
// An alert that misnames the file is an alert nobody acts on.
const status = git(['status', '--porcelain', '--untracked-files=all', '--', 'public']).replace(/\n+$/, '');
if (status) {
  problemes.push('Arbre de travail sale sous public/ :');
  for (const line of status.split('\n')) {
    const code = line.slice(0, 2);
    const path = line.slice(3);
    const quoi =
      code.includes('?') ? 'non suivi' : code.includes('D') ? 'supprimé' : code.includes('A') ? 'ajouté' : 'modifié';
    problemes.push(`  ${quoi.padEnd(10)} ${path}`);
  }
}

// 2. Every committed public/ file must be in dist/ with identical bytes.
const tracked = git(['ls-tree', '-r', 'HEAD', '--format=%(objectname) %(path)', 'public'])
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const i = line.indexOf(' ');
    return { sha: line.slice(0, i), path: line.slice(i + 1) };
  });

const attendus = new Set();
const manquants = [];
const divergents = [];

// git hash-object takes many paths at once; one call per file would spawn a
// process per image and make the hook noticeably slow on Windows.
const aHacher = [];
for (const { sha, path } of tracked) {
  const rel = path.replace(/^public\//, '');
  attendus.add(rel);
  const abs = join(distDir, rel.split('/').join(sep));
  if (!existsSync(abs)) manquants.push(rel);
  else aHacher.push({ sha, rel, abs });
}

const TAILLE_LOT = 200;
for (let i = 0; i < aHacher.length; i += TAILLE_LOT) {
  const lot = aHacher.slice(i, i + TAILLE_LOT);
  const sorties = git(['hash-object', ...lot.map((f) => f.abs)]).split('\n');
  lot.forEach((f, j) => {
    const reel = (sorties[j] || '').trim();
    if (reel !== f.sha) divergents.push(`${f.rel}  (HEAD ${f.sha.slice(0, 8)} ≠ dist ${reel.slice(0, 8) || '?'})`);
  });
}

if (divergents.length) {
  problemes.push('Contenu différent entre HEAD et dist/ :');
  for (const d of divergents) problemes.push(`  ${d}`);
}
if (manquants.length) {
  problemes.push('Présents dans HEAD, absents de dist/ :');
  for (const m of manquants) problemes.push(`  ${m}`);
}

// 3. No extra file inside the directories mirrored from public/.
const dossiersMiroir = new Set();
for (const rel of attendus) {
  const d = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
  if (d) dossiersMiroir.add(d);
}

const intrus = [];
for (const dossier of dossiersMiroir) {
  const abs = join(distDir, dossier.split('/').join(sep));
  if (!existsSync(abs)) continue;
  for (const entree of readdirSync(abs)) {
    const cible = join(abs, entree);
    if (statSync(cible).isDirectory()) continue;
    if (BUILD_TWIN.test(entree)) continue;
    const rel = `${dossier}/${entree}`;
    if (!attendus.has(rel)) intrus.push(rel);
  }
}

if (intrus.length) {
  problemes.push("Fichiers de dist/ qui ne viennent d'aucun commit :");
  for (const i of intrus) problemes.push(`  ${i}`);
}

if (problemes.length) fail(problemes);

console.log(`${TAG} ${tracked.length} fichiers de public/ conformes à HEAD (${head.slice(0, 8)}).`);
