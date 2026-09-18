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
const journalDir = join(root, "docs", "journal");
if (existsSync(journalDir)) {
  const enAttente = readdirSync(journalDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .filter((f) => /^notion:\s*non\s*$/m.test(readFileSync(join(journalDir, f), "utf8")));
  if (enAttente.length) {
    out.push("\n---\n");
    out.push(`## ${enAttente.length} note(s) de journal pas encore remontée(s) dans Notion\n`);
    enAttente.forEach((f) => out.push(`- \`docs/journal/${f}\``));
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
