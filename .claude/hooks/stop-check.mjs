#!/usr/bin/env node
/**
 * Stop — rappelle le rituel de fin de session, au plus une fois par session.
 *
 * Attention : ce hook se déclenche à CHAQUE fin de tour, pas en fin de session.
 * Il est donc volontairement timide :
 *   - il se tait si aucun vrai travail n'a eu lieu depuis l'ouverture ;
 *   - il se tait si le handoff et la note de journal sont déjà faits ;
 *   - il ne parle qu'UNE fois par session, quoi qu'il arrive (anti-boucle).
 *
 * Code de retour 2 = Claude ne s'arrête pas et lit le message sur stderr.
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let sid = "inconnu";
try {
  sid = JSON.parse(readFileSync(0, "utf8")).session_id || "inconnu";
} catch {}

const stateDir = join(root, ".claude", "state");
const snapPath = join(stateDir, `session-${sid}.json`);
const nudgePath = join(stateDir, `rappel-${sid}`);

// Anti-boucle : on n'insiste jamais deux fois.
if (existsSync(nudgePath)) process.exit(0);
// Pas d'instantané d'ouverture : on ne peut rien juger.
if (!existsSync(snapPath)) process.exit(0);

const snap = JSON.parse(readFileSync(snapPath, "utf8"));

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

// --- Du vrai travail a-t-il eu lieu ? --------------------------------------
const headBouge = git("rev-parse HEAD") !== snap.head;
const salesHorsRituel = git("status --porcelain")
  .split("\n")
  .filter(Boolean)
  .filter((l) => !/HANDOFF\.md$/.test(l) && !/docs\/journal\//.test(l));
const travailFait = headBouge || salesHorsRituel.length > 0;
if (!travailFait) process.exit(0);

// --- Le rituel a-t-il été fait ? -------------------------------------------
const handoff = join(root, "HANDOFF.md");
const handoffAJour = existsSync(handoff) && statSync(handoff).mtimeMs > snap.debut;

const journalDir = join(root, "docs", "journal");
const aujourdhui = new Date().toISOString().slice(0, 10);
const noteDuJour =
  existsSync(journalDir) &&
  readdirSync(journalDir).some((f) => f.startsWith(aujourdhui) && f.endsWith(".md"));

if (handoffAJour && noteDuJour) process.exit(0);

// --- Rappel, une seule fois ------------------------------------------------
try {
  writeFileSync(nudgePath, new Date().toISOString(), "utf8");
} catch {}

const manque = [];
if (!handoffAJour) manque.push("- `HANDOFF.md` n'a pas été mis à jour depuis l'ouverture de la session");
if (!noteDuJour) manque.push(`- aucune note \`docs/journal/${aujourdhui}-*.md\` n'existe`);

process.stderr.write(
  [
    "Rituel de fin de session incomplet. Du travail a été fait, mais :",
    ...manque,
    "",
    "Fais-le maintenant :",
    "1. Mets à jour HANDOFF.md (état, chantiers ouverts, date en tête).",
    `2. Écris docs/journal/${aujourdhui}-<sujet>.md au format de docs/journal/README.md, avec \`notion: non\`.`,
    "3. Commite les deux.",
    "",
    "Si tu juges que ce travail ne mérite pas de note (essai jeté, exploration sans suite),",
    "dis-le en une ligne et arrête-toi : ce rappel ne reviendra pas dans cette session.",
  ].join("\n")
);
process.exit(2);
