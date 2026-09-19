---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Avancée
notion: https://app.notion.com/p/3e0fb662f4aa817fb8f6c5f749984789
synchro: 2026-09-19
prochaine-action: Refaire le document SLA dans Notion — la tâche est déposée dans le CRM
---

## Fait

- **Les tâches de Laurent vivent dans le CRM** (PR #37, déployé et vérifié). Ce qu'il doit
  mener lui-même ne se perd plus entre un handoff, une note de journal et Notion.
- Trois routes sous **`TASK_SECRET`**, secret dédié — pas `SERVICE_SECRET`, qui ouvre les
  routes n8n : une fuite de l'un ne doit pas donner l'autre, et un test le verrouille dans
  les deux sens. Fermé par défaut si la variable manque.
- **`requireAuthOrService` n'est pas utilisé**, et le fichier dit pourquoi en tête. Ces
  routes filtrent par propriétaire, elles l'**assignent** donc explicitement depuis
  `TASK_OWNER_EMAIL` résolu en base, et n'appellent jamais `ownerScope()`.
- `migration-007` jouée **puis vérifiée par requête** : colonne `external_ref`, index unique
  partiel avec son `WHERE status <> ALL(ARRAY['completed','cancelled'])`. Le service de
  migration du compose termine chaque ligne par `2>/dev/null` — s'y fier serait accepter un
  échec silencieux.
- `TASK_SECRET` généré **sur le VPS**, écrit directement dans le `.env`, référencé par
  `${TASK_SECRET}` dans le compose comme les autres. Jamais affiché, jamais passé en argument
  de commande. Sauvegardes horodatées du compose et du `.env` avant modification.
- **Huit vérifications passées en production** : 401 sans en-tête et sur mauvais secret ;
  création 201 assignée à l'administrateur ; même `ref` → mise à jour et **une seule ligne en
  base** ; clôture sans motif refusée ; clôture avec preuve tracée et `completed_at` posé ;
  même `ref` après clôture → **nouvelle** tâche ; et surtout **le compte démo ne voit rien**.
- Hook `SessionStart` : affiche les tâches ouvertes, **en échec ouvert**. Testé sans secret —
  une ligne d'avertissement, la session continue.
- Rituel étendu : `HANDOFF.md` section 6 et `.claude/commands/handoff.md` disent maintenant
  qu'une action dépassant la session part dans le CRM, avec la consigne inverse en garde-fou —
  **en cas d'hésitation, écrire la ligne dans le handoff plutôt que d'envoyer au CRM**.

## Cassé

- **Mon fichier de tests n'a pas tourné au premier essai, et rien ne l'a dit.** Le script
  `test` de `docker/backend/package.json` énumère les fichiers un par un : un nouveau test y
  est invisible tant qu'on ne l'ajoute pas. Le compte est resté à 123 alors que j'avais écrit
  neuf tests. C'est la même classe de panne muette que `files.txt`, et je ne l'ai vu qu'en
  comparant le nombre de tests avant et après. **Vérifier que le compte augmente.**
- Deux écarts à la note de cadrage, tous deux après vérification et non par préférence :
  - Le statut d'ouverture est **`not_started`**, pas `pending`. Le frontend ne connaît que
    cinq statuts (`getTaskStatuses`) et `pending` n'en fait pas partie : la tâche se serait
    affichée sans état lisible.
  - La note ne mentionnait pas ce qui rend ce chantier sûr : `resetDemoData()` fait
    `DELETE FROM tasks WHERE assigned_to = DEMO_USER_ID`. Les tâches de l'administrateur sont
    hors d'atteinte. Vérifié en base avant d'écrire la moindre ligne.
- Un heredoc a mangé mes échappements en écrivant le hook, produisant un fichier JavaScript
  invalide. Rattrapé par `node --check`, refait proprement. Pour du code à écrire dans un
  fichier, passer par l'outil d'édition plutôt que par un script shell imbriqué.

## Reste

- **La route impose la traçabilité, pas la véracité.** Elle ne peut pas vérifier qu'une
  session dit vrai quand elle clôture sur « preuve » — elle garantit qu'aucune clôture n'est
  muette et que chacune porte sa raison, donc qu'une erreur se voit et se conteste. C'est la
  limite honnête de ce qui a été construit, et il faut la connaître.
- Le secret vit à trois endroits : le `.env` du VPS qui fait foi, `.env.local` sur la machine
  de Laurent, et **1Password** — le seul des trois qui survit à une réinstallation. À
  confirmer qu'il y est.
- Première vraie tâche déposée : **Refaire le document SLA dans Notion**, priorité haute. Le
  document d'avril décrit encore l'audit gratuit, le Pack Express, 99 % de disponibilité et
  24h de délai. Les CGV ne le mentionnent plus depuis aujourd'hui, donc personne ne peut le
  réclamer sur la foi du site — mais il existe et contredit la grille O1–O5.
