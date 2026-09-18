# Chantier — les tâches de Laurent arrivent dans le CRM

**Cadré en session Cowork le 18/09/2026.** À exécuter en session Claude Code.

> Aujourd'hui, ce que Laurent doit faire lui-même est dispersé : une ligne dans un handoff,
> une phrase dans une note de journal, une prochaine action dans Notion. Rien ne l'attend
> à un endroit qu'il ouvre de lui-même. Le CRM a un module de tâches qui ne sert pas.

## Décisions prises

| | |
|---|---|
| **Périmètre** | **Seulement ce que Laurent doit faire lui-même** : décisions à trancher, textes à valider, démarches hors dépôt. Ce que Claude Code peut faire seul reste dans le HANDOFF et n'encombre pas le CRM. |
| **Écriture** | **Cowork et Claude Code**, au moment du rituel de fin de session, en même temps que la note de journal. |
| **Clôture** | **Laurent clôture dans le CRM**, qui fait foi. Les sessions **lisent** les tâches ouvertes à l'ouverture, et n'en ferment aucune. |

---

## Le piège à ne pas reproduire

`POST /api/tasks` filtre par propriétaire. Le commentaire au-dessus de `requireAuthOrService`
dans `server.js` le dit explicitement :

> *À n'appliquer qu'à des routes qui ne filtrent PAS par propriétaire. Un appelant porteur du
> secret n'a pas d'identité : `req.user` reste absent, et `ownerScope()` rend alors `null`,
> c'est-à-dire « voit tout ».*

**Ne branche donc pas `requireAuthOrService` sur `POST /api/tasks`.** Ce serait rouvrir en
silence le cloisonnement réparé le 15/09, et pour un gain de cinq minutes.

La route de service doit **assigner explicitement**, jamais déduire.

---

## Ce qu'il faut construire

### 1. Un secret dédié, pas `SERVICE_SECRET`

`SERVICE_SECRET` ouvre les routes n8n. Une fuite du secret des tâches ne doit pas donner
ça. Nouvelle variable **`TASK_SECRET`**, même forme que les deux autres : en-tête dédié
`x-task-secret`, comparaison en temps constant, **fermée par défaut si la variable manque**.

**Où elle vit** : variable d'environnement du conteneur sur le VPS, et copie dans
`.env.local` du dépôt — fichier **non suivi par git**, vérifie-le avant d'écrire quoi que ce
soit dedans. C'est ce qui permet à une session Cowork, qui ne peut pas ouvrir de connexion
SSH, d'appeler la route depuis le dossier du projet.

### 2. Un propriétaire explicite

**`TASK_OWNER_EMAIL`** — l'adresse du compte CRM à qui les tâches sont assignées. Résolue en
`assigned_to` au moment de l'insertion, par une requête sur `users`.

Si la variable manque, ou si l'adresse ne correspond à aucun utilisateur : **refuser la
requête**. Une tâche sans propriétaire est une tâche que personne ne verra — le silence est
le mode de panne à éviter ici, c'est le thème de la journée.

### 3. Une migration : `external_ref`

`migration-007-task-external-ref.sql` — une colonne `external_ref TEXT` sur `tasks`, plus un
**index unique partiel** :

```sql
CREATE UNIQUE INDEX IF NOT EXISTS tasks_external_ref_open
  ON tasks (external_ref)
  WHERE external_ref IS NOT NULL AND status NOT IN ('completed', 'cancelled');
```

C'est ce qui empêche la même action de créer cinq lignes parce qu'elle apparaît dans cinq
notes. Et le `WHERE` est délibéré : si Laurent clôture une tâche et que l'action revient
plus tard, une **nouvelle** tâche doit pouvoir être créée.

### 4. `POST /api/service/tasks`

```json
{
  "ref":      "handoff:ainspiration:sla-notion",
  "titre":    "Refaire le document SLA dans Notion",
  "detail":   "Pourquoi, et ce qui est attendu. Deux ou trois phrases.",
  "echeance": "2026-09-25",
  "priorite": "high",
  "source":   "cowork",
  "lien":     "https://app.notion.com/..."
}
```

- `ref` **obligatoire** et stable — c'est la clé de dédoublonnage.
- Une tâche ouverte portant ce `ref` existe → **mise à jour** (titre, détail, échéance,
  priorité), réponse `200`.
- Sinon → **création**, `status: 'pending'`, réponse `201`.
- `detail`, `source` et `lien` sont concaténés dans `description` : la tâche doit dire d'où
  elle vient, sinon Laurent la lira dans trois jours sans contexte.

### 5. `GET /api/service/tasks`

Les tâches **ouvertes du propriétaire configuré**, pour que les sessions les lisent à
l'ouverture. Filtre explicite sur `assigned_to = <propriétaire résolu>`, **jamais**
`ownerScope()` — même raison qu'au point 1.

---

## Une fois la route en place

Deux ajouts au rituel, à faire **après** que la route existe, pas avant :

1. **`HANDOFF.md` section 6** et **`.claude/commands/handoff.md`** : une action qui dépasse
   la session — décision, validation, démarche hors dépôt — part dans le CRM, une tâche par
   action, avec un `ref` stable.
2. **Le hook `SessionStart`** peut appeler `GET /api/service/tasks` et afficher les tâches
   ouvertes. Si l'appel échoue, **il n'échoue pas la session** : il affiche une ligne
   d'avertissement et continue. Une session bloquée parce que le CRM tousse serait pire que
   le problème résolu.

---

## Vérification avant de rendre la main

1. Sans `TASK_SECRET` défini : la route **refuse**. C'est le test qui compte le plus.
2. Avec un mauvais secret : refuse. Avec le bon : crée.
3. Deux appels avec le même `ref` : **une seule tâche**, mise à jour la seconde fois.
4. Tâche clôturée puis même `ref` rappelé : une **nouvelle** tâche est créée.
5. La tâche apparaît bien dans `/tasks` de l'application, assignée au bon compte.
6. **Le compte de démonstration ne la voit pas.** C'est la vérification qui prouve que le
   cloisonnement du 15/09 est intact.
7. `type-check`, `lint --max-warnings 0`, tests, puis déploiement dans l'ordre habituel.

## Ce que ce chantier ne fait pas

Il ne décide pas à la place de Laurent ce qui est une tâche. Une session qui hésite écrit la
ligne dans le handoff et le dit — elle n'envoie pas au CRM « pour ne rien perdre ». Un CRM
qui se remplit de lignes qu'on ne traite pas est un CRM qu'on n'ouvre plus, et on retombe
sur le problème du départ.
