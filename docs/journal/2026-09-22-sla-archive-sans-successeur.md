---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Décision
notion: non
prochaine-action: Ouvrir une session sur le dépôt Paperclip et y appliquer docs/chantiers/sla-obsolete-paperclip.md
---

## Fait

- **Le sort du document SLA est tranché : archivage sans successeur.** Il n'est pas « à
  refaire », et c'est tout l'enjeu de la journée. La prochaine action inscrite au HANDOFF
  depuis le 18/09 demandait de le reconstruire — elle contredisait une décision prise le
  même jour, **deux lignes plus haut dans le même fichier** : *aucun engagement de niveau de
  service par défaut*. Or un document SLA autonome **est** un engagement qui s'applique par
  défaut. Le refaire, c'était démonter le 18/09 sans s'en apercevoir.
- **Vérifié avant de conclure**, dans les trois langues : `cgv.s11_body` ne porte plus aucun
  chiffre ni aucun renvoi au document. La formulation en vigueur est *« Aucun engagement de
  niveau de service ne s'applique par défaut en dehors de ce qui est écrit au devis. »*
  Le constat de départ de Laurent est exact : plus personne ne peut réclamer ce document sur
  la foi du site.
- **Deux trouvailles que personne ne cherchait**, toutes deux dans le dépôt Paperclip :
  - le **DPA** du même dossier `legal/`, rédigé le même jour d'avril, est **toujours
    référencé vivant** par les CGV §12 — « disponible sur demande à info@ainspiration.eu ».
    Ce renvoi-là n'a pas été retiré le 18/09. Il porte sur l'article 28 du RGPD et non sur
    l'offre, donc il n'est pas périmé d'office, mais il est promis par écrit à quiconque le
    demande et **personne ne l'a relu depuis avril**. C'est une exposition réelle, là où le
    SLA n'était plus qu'un document dormant ;
  - le `CLAUDE.md` de Paperclip porte encore la grille « validée Comité #2 » — audit IA
    gratuit, Pack Express 1 043/1 490 €, abonnement 290 €/mois — et elle **nourrit les dix
    agents du comité de direction**. Ils délibèrent donc sur une offre abandonnée depuis le
    16/09. Bien plus actif qu'un fichier oublié.
- **Consigne prête à coller** dans `docs/chantiers/sla-obsolete-paperclip.md` : bandeau
  d'obsolescence sur le SLA plutôt qu'une suppression, relecture du DPA **sans réécriture**,
  remplacement de la grille dans le `CLAUDE.md` de Paperclip, et quatre conditions de recette.
- `CLAUDE.md` et `HANDOFF.md` mis à jour : la v1.0 est marquée obsolète à l'endroit exact où
  un lecteur la prendrait pour un actif courant — le bloc « Documents légaux créés » d'avril,
  qui donnait son chemin sans rien dire de son état.

## Cassé

- Rien. Aucune modification du site, aucun déploiement.
- **Mais une leçon de méthode :** une prochaine action peut survivre quatre jours en
  contredisant une décision écrite dix lignes plus haut dans le même fichier, sans que rien
  ne le signale. Le HANDOFF n'a pas de contrôle de cohérence interne, et les deux lignes
  avaient été écrites dans la même session. Quand une décision retire une notion, il faut
  relire les prochaines actions qui la mentionnent encore — c'est le même angle mort que le
  défaut de couverture du tirage de l'auto-blog : muet par nature.

## Reste

- **Rien n'est commité.** Laurent a demandé en cours de session de ne pas commiter sans son
  accord ; les quatre fichiers sont écrits et attendent son feu vert.
- **Le chantier « promesses non étayées » a d'abord été bloqué faute de note de cadrage** —
  le fichier annoncé n'existait ni au chemin donné ni ailleurs sur la machine. Laurent a
  collé la note dans la conversation, le chantier a été exécuté dans la foulée : voir
  `2026-09-22-premier-ecran-sans-promesse.md`.
- La page Notion du SLA reste à archiver par Laurent — tâche CRM `handoff:ainspiration:sla-notion`.
