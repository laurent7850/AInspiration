#!/usr/bin/env node
/**
 * SessionStart — injecte le contexte du projet dans la session Claude Code.
 *
 * Écrit aussi un instantané de l'état du dépôt (HEAD + horodatage), dont
 * stop-check.mjs se sert pour savoir si du vrai travail a eu lieu.
 *
 * Tout ce qui est écrit sur la sortie standard devient du contexte visible.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const out = [];

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

// --- 1. Le handoff, injecté tel quel ---------------------------------------
const handoffPath = join(root, "HANDOFF.md");
if (existsSync(handoffPath)) {
  out.push("# Contexte injecté automatiquement au démarrage\n");
  out.push("Ceci est le contenu de `HANDOFF.md`. Tu n'as pas besoin de le relire.\n");
  out.push("---\n");
  out.push(readFileSync(handoffPath, "utf8"));
} else {
  out.push("⚠️ Aucun HANDOFF.md à la racine du dépôt. Propose d'en créer un avant de travailler.");
}

// --- 2. Notes de journal pas encore remontées dans Notion ------------------
// Deux cas, et le second a failli passer inaperçu le 18/09 : une note DÉJÀ
// remontée puis complétée est invisible d'un simple test sur `notion: non`.
// On compare donc le dernier commit touchant le fichier à celui qui y a écrit
// l'URL Notion : s'ils diffèrent, la note a bougé depuis sa remontée.
const journalDir = join(root, "docs", "journal");
if (existsSync(journalDir)) {
  const notes = readdirSync(journalDir).filter((f) => f.endsWith(".md") && f !== "README.md");
  const jamais = [];
  const modifiees = [];

  for (const f of notes) {
    const chemin = `docs/journal/${f}`;
    const texte = readFileSync(join(journalDir, f), "utf8");
    const m = texte.match(/^notion:\s*(\S+)\s*$/m);
    if (!m) continue;
    if (m[1] === "non") { jamais.push(chemin); continue; }
    // `synchro:` porte la date de la derniere remontee. Comme sa valeur change
    // a chaque synchro, le commit qui l'a ecrite est retrouvable, et on peut
    // dire si le fichier a bouge APRES.
    const sync = texte.match(/^synchro:\s*(\S+)\s*$/m);
    const dernier = git(`log -1 --format=%H -- "${chemin}"`);
    const marquage = sync
      ? git(`log -1 -S"synchro: ${sync[1]}" --format=%H -- "${chemin}"`)
      : git(`log -1 -S"${m[1]}" --format=%H -- "${chemin}"`);
    if (dernier && marquage && dernier !== marquage) modifiees.push(chemin);
  }

  if (jamais.length || modifiees.length) {
    out.push("\n---\n");
    out.push("## Notes de journal à remonter dans Notion\n");
    if (jamais.length) {
      out.push("**Jamais remontées :**");
      jamais.forEach((f) => out.push(`- \`${f}\``));
    }
    if (modifiees.length) {
      out.push("\n**Remontées puis complétées depuis** — la version Notion est incomplète :");
      modifiees.forEach((f) => out.push(`- \`${f}\``));
    }
    out.push("\nNe les remonte pas toi-même : c'est la session Cowork qui les pousse dans Notion.");
  }
}

// --- 3. État du dépôt ------------------------------------------------------
const head = git("rev-parse HEAD");
const branche = git("rev-parse --abbrev-ref HEAD");
const sales = git("status --porcelain");
out.push("\n---\n");
out.push("## État du dépôt à l'ouverture\n");
out.push(`- Branche : \`${branche || "?"}\``);
out.push(`- HEAD : \`${head.slice(0, 7) || "?"}\``);
out.push(`- Arbre de travail : ${sales ? `${sales.split("\n").length} fichier(s) modifié(s)` : "propre"}`);

// --- 4. Le rituel ----------------------------------------------------------
out.push("\n---\n");
out.push("## Rituel de fin de session — non négociable\n");
out.push("Avant de rendre la main, quand tu as fait du vrai travail :");
out.push("1. Mets `HANDOFF.md` à jour (état, chantiers, date en tête).");
out.push("2. Écris une note dans `docs/journal/AAAA-MM-JJ-sujet.md` au format décrit dans `docs/journal/README.md`, avec `notion: non`.");
out.push("3. Commite les deux avec ton travail.");
out.push("\nUn contrôle automatique te le rappellera une fois si tu l'oublies.");

// --- 5. Instantané pour stop-check.mjs -------------------------------------
try {
  const stateDir = join(root, ".claude", "state");
  mkdirSync(stateDir, { recursive: true });
  let sid = "inconnu";
  try {
    sid = JSON.parse(readFileSync(0, "utf8")).session_id || "inconnu";
  } catch {}
  writeFileSync(
    join(stateDir, `session-${sid}.json`),
    JSON.stringify({ head, debut: Date.now() }),
    "utf8"
  );
} catch {}

process.stdout.write(out.join("\n") + "\n");
