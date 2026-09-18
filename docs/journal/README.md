# Journal de session

Une note par session de travail. Elle vit ici d'abord, puis la session Cowork
la remonte dans la base **Journal de bord** de Notion.

## Pourquoi ici et pas directement dans Notion

Claude Code n'a pas de connecteur Notion dans ce dépôt, et c'est délibéré :
chaque connecteur chargé pèse sur le contexte de la session. Le fichier est donc
le point de passage, et git le moyen de transport.

## Nom de fichier

```
AAAA-MM-JJ-sujet-court.md
```

Exemple : `2026-09-21-publication-trilingue.md`

## Format

```markdown
---
date: 2026-09-21
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Vérifier les positions GSC des trois langues sous 7 jours
---

## Fait

- ...

## Cassé

- ...   (ou « rien »)

## Reste

- ...
```

### Le champ `type`

`Avancée` · `Incident` · `Décision` · `Point de situation` · `Abandon`
— ce sont exactement les valeurs de la base Notion, ne pas en inventer d'autres.

### Le champ `notion`

- `non` — pas encore remontée. La session Cowork la verra et la poussera.
- une URL — déjà dans Notion. **C'est Cowork qui écrit cette URL, jamais Claude Code.**

### Le champ `prochaine-action`

**Une seule action, concrète.** Une liste de cinq choses à faire n'est pas une
prochaine action, c'est un backlog : il vit dans le tableau des chantiers ouverts
de `HANDOFF.md`.
