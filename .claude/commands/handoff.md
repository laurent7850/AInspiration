---
name: handoff
description: Exécute le rituel de fin de session (HANDOFF.md + note de journal)
allowed-tools: Read, Edit, Write, Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git diff:*)
---

Exécute le rituel de fin de session pour ce dépôt. Fais-le sérieusement : c'est ce
fichier qui portera tout le contexte à la prochaine session, la tienne ou celle de Cowork.

**1. Mets `HANDOFF.md` à jour.**

- Section 3 « État » : ce qui tourne, ce qui est cassé, ce qui est vide. Sois factuel.
  Si quelque chose a été réparé, dis-le et dis par quel commit.
- Section 4 « Chantiers ouverts » : avance, retire ou ajoute des lignes.
  Un chantier terminé sort du tableau.
- Section 5 « Pièges connus » : si tu es tombé dans un piège que personne n'avait noté,
  ajoute-le. C'est la partie la plus précieuse du fichier.
- La date en tête du fichier.

**2. Écris la note de journal.**

Dans `docs/journal/AAAA-MM-JJ-sujet-court.md`, au format exact de `docs/journal/README.md`.
Le champ `notion:` vaut `non` — tu n'y touches pas, c'est Cowork qui le remplira.

Règles pour la note :
- Ce qui a **cassé** ou ce qui a **surpris** vaut plus que la liste de ce qui a marché.
- Une seule `prochaine-action`, concrète.
- Pas de chiffre que tu n'as pas vérifié toi-même dans une source réelle.

**3. Commite.**

`HANDOFF.md` et la note dans le même commit que ton travail, ou dans un commit
`docs:` séparé si le travail était déjà commité. Ne pousse pas sans qu'on te le demande.

**4. Termine** par trois lignes maximum : ce qui a été fait, ce qui reste, la prochaine action.
