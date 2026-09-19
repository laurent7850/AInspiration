#!/usr/bin/env node
/**
 * SessionStart — injecte le contexte du projet dans la session Claude Code.
 *
 * Écrit aussi un instantané de l'état du dépôt (HEAD + horodatage), dont
 * stop-check.mjs se sert pour savoir si du vrai travail a eu lieu.
 *
 * Tout ce qui est écrit sur la sortie standard devient du contexte visible.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, statSync } from "node:fs";
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

// Un commit non poussé n'est pas une trace, c'est une trace en sursis : la
// session doit savoir dès l'ouverture ce qui dort en local.
//
// ÉCHEC OUVERT, délibérément : pas de `git fetch` ici. Le réseau au démarrage,
// c'est une session qui n'ouvre pas quand le remote tousse. On lit la
// référence telle qu'elle est sur le disque ; si elle manque ou si elle date,
// on le DIT et on continue — jamais taire le doute, jamais bloquer.

// Depuis quand la référence distante n'a-t-elle pas bougé ? Trois traces sur
// le disque peuvent l'avoir rafraîchie : un fetch (`FETCH_HEAD`), un push (le
// fichier de la ref distante), un clone (`packed-refs`). On prend la plus
// récente des trois — ne regarder que `FETCH_HEAD` criait « périmée » sur un
// clone tout neuf, et une alerte qui se trompe est une alerte qu'on n'écoute
// plus.
function fraicheurReference(amont) {
  const gitDir = git("rev-parse --absolute-git-dir");
  if (!gitDir) return "";
  const traces = [
    join(gitDir, "FETCH_HEAD"),
    join(gitDir, "refs", "remotes", ...amont.split("/")),
    join(gitDir, "packed-refs"),
  ];
  let recent = 0;
  for (const p of traces) {
    try {
      recent = Math.max(recent, statSync(p).mtimeMs);
    } catch {}
  }
  if (!recent) return " — ⚠️ fraîcheur inconnue, la référence peut être périmée";
  const jours = Math.floor((Date.now() - recent) / 86400000);
  return jours >= 1
    ? ` — ⚠️ référence non rafraîchie depuis ${jours} j, elle peut être périmée`
    : "";
}

function commitsNonPousses() {
  // L'amont configuré d'abord : c'est lui qui dit la vérité quand on travaille
  // sur une autre branche que `main`. `origin/main` n'est que le dernier repli.
  const amont =
    git("rev-parse --abbrev-ref --symbolic-full-name @{upstream}") ||
    (branche && git(`rev-parse --verify --quiet origin/${branche}`) ? `origin/${branche}` : "") ||
    (git("rev-parse --verify --quiet origin/main") ? "origin/main" : "");

  if (!amont) {
    return [
      "- Commits non poussés : _référence distante introuvable (ni amont configuré, ni `origin/main`) — non vérifié, on continue._",
    ];
  }

  const compte = git(`rev-list --count ${amont}..HEAD`);
  if (!/^\d+$/.test(compte)) {
    return [
      `- Commits non poussés : _comparaison avec \`${amont}\` impossible — non vérifié, on continue._`,
    ];
  }

  const nb = Number(compte);
  const fraicheur = fraicheurReference(amont);
  if (nb === 0) {
    return [`- Commits non poussés vers \`${amont}\` : aucun${fraicheur}`];
  }

  const lignes = [`- Commits non poussés vers \`${amont}\` : **${nb}**${fraicheur}`];
  const journal = git(`log --format="%h %s" --max-count=10 ${amont}..HEAD`);
  journal.split("\n").filter(Boolean).forEach((l) => lignes.push(`  - \`${l}\``));
  if (nb > 10) lignes.push(`  - … et ${nb - 10} de plus`);
  lignes.push("  Pousse-les avant de rendre la main.");
  return lignes;
}

for (const ligne of commitsNonPousses()) out.push(ligne);


// --- 3 bis. Les tâches ouvertes de Laurent dans le CRM ---------------------
// Ce que Laurent doit faire lui-même vit dans le module de tâches du CRM
// depuis le 18/09/2026, plus dans un coin de handoff. La session les lit à
// l'ouverture ; elle n'en ferme aucune sans preuve ou sans ordre de sa part.
//
// ÉCHEC OUVERT, délibérément : si le CRM ne répond pas, on affiche une ligne
// et on continue. Une session bloquée parce que le CRM tousse serait pire que
// le problème résolu. Le secret vit dans `.env.local`, non suivi par git.
async function tachesOuvertes() {
  let secret = process.env.TASK_SECRET || "";
  if (!secret) {
    try {
      const envLocal = readFileSync(join(root, ".env.local"), "utf8");
      const m = envLocal.match(/^TASK_SECRET\s*=\s*(.+)$/m);
      if (m) secret = m[1].trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  if (!secret) {
    return ["_TASK_SECRET absent de l'environnement et de `.env.local` — tâches non lues._"];
  }

  const base = process.env.CRM_BASE || "https://ainspiration.eu";
  try {
    const ctl = new AbortController();
    const minuteur = setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(`${base}/api/service/tasks`, {
      headers: { "x-task-secret": secret },
      signal: ctl.signal,
    });
    clearTimeout(minuteur);
    if (!r.ok) {
      return [`_Lecture des tâches CRM impossible (HTTP ${r.status}) — on continue sans._`];
    }
    const taches = await r.json();
    if (!Array.isArray(taches) || taches.length === 0) {
      return ["_Aucune tâche ouverte._"];
    }
    return taches.map((t) => {
      const ech = t.due_date ? ` — échéance ${String(t.due_date).slice(0, 10)}` : "";
      const pri = t.priority === "high" ? " **[haute]**" : "";
      return `- ${t.title}${pri}${ech}`;
    });
  } catch (e) {
    const cause = e.name === "AbortError" ? "délai dépassé" : e.message;
    return [`_Lecture des tâches CRM impossible (${cause}) — on continue sans._`];
  }
}

out.push("\n---\n");
out.push("## Tâches ouvertes de Laurent (CRM)\n");
out.push("Ce que **Laurent** doit faire lui-même. Tu n'en clôtures aucune sans preuve, ou sans son ordre.\n");
for (const ligne of await tachesOuvertes()) out.push(ligne);

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
