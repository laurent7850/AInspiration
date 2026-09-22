---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Décision
notion: non
prochaine-action: Obtenir l'accord écrit de L'Artpéro, dont le nom est publié sans autorisation depuis le 04/09
---

## Fait

- **Nostalgie est nommée sur ses trois fiches**, avec un lien vers `nostalgie.be` et
  **sans logo**. Laurent a levé la règle n°2 du HANDOFF (« le nom de la radio ne sort
  jamais »), confirmée trois fois. Le fait qui a emporté la décision : il est **prestataire
  indépendant chez Nostalgie depuis vingt-cinq ans** — pas un bénéficiaire de travail
  offert, mais sa relation commerciale la plus ancienne.
- Livré : champ `clientUrl` dans `src/data/realisations.ts`, commanditaire affiché en lien
  dans l'en-tête de la fiche détail, « Un groupe radio francophone » → **Nostalgie** dans
  `fr`, `en` et `nl`, `ops/decisions/ADR-006` et règle n°2 réécrite.
- Déployé dans l'ordre : manifeste poussé d'abord, **209/209 entrées vérifiées sur le CDN**,
  `--force-recreate`. `tsc` propre, lint à zéro avertissement, 84/84 tests, rendu vérifié en
  préview avant et après.

## Cassé

- **La garde que je croyais avoir posée n'existait pas.** J'ai écrit dans l'ADR et dans le
  HANDOFF que l'anonymat était garanti par un mécanisme — pas de `clientUrl`, pas de nom
  affiché. C'est faux : ce champ ne gouverne que l'interface React, tandis que le bloc SEO
  du serveur (`routes/seo.js`, ligne 554) imprime la clé `client` de **chaque** fiche sans
  filtre, et c'est ce HTML que lisent les robots.
- **Conséquence : `TL Services` et `L'Artpéro` sont publiés en clair depuis le 04/09**, sans
  aucun accord, et personne ne l'avait vu. Le nom de L'Artpéro figure aussi dans le **titre**
  de sa fiche : le ré-anonymiser demanderait de la réécrire. → chantier C24.
- Je l'ai trouvé en interrogeant le HTML servi après déploiement, pas en lisant le code.
  **C'est la leçon que ce dépôt répète depuis le blog invisible du 13/08 et le formulaire
  muet de septembre, et je viens de m'y faire prendre à mon tour** : un mécanisme qu'on n'a
  pas vu s'exécuter n'est pas un mécanisme. ADR-006 et la règle n°2 portent la correction
  plutôt que la version fausse — une décision qui décrit un mécanisme inexistant est pire
  que pas de décision.
- Rappel du piège `$` des scripts de patch, rencontré **deux fois** dans la session : une
  expression régulière et des apostrophes écrites au travers d'un heredoc shell arrivent
  mangées côté Node. Passer par l'outil d'édition, ou par `split`/`join`.

## Reste

- **Mamie l'IA n'entre pas dans `/realisations`.** Première animatrice radio générée par IA
  en Europe, 26/08/2024, quatre médias belges — mais aucun article ne nomme de prestataire
  externe, et L'Avenir cite le coanimateur disant que « nos équipes techniques » l'ont
  créée. Laurent indique qu'il était seul derrière cette formule. Ce n'est pas une
  prestation commandée : cela relève du parcours, donc de `/a-propos`, ce qui permettra de
  traiter C23 dans le même geste.
- **La demande la plus rentable de la campagne du 26/09** est désormais évidente : une ligne
  écrite de Nostalgie confirmant le rôle. Elle transforme la meilleure preuve du
  portefeuille en preuve citable.
- Accord de TL Services attendu sous peu — sa fiche porte déjà son nom, il ne manquera
  qu'une ligne `clientUrl` et un déploiement.
