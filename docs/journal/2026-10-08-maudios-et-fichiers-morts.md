---
date: 2026-10-08
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Soumettre le formulaire d'accès Community Management de LinkedIn avant le 9 octobre
---

## Fait

- **Clé OpenRouter `Maudios` supprimée**, l'ancienne clé maîtresse que sept conteneurs se
  partageaient jusqu'au 25/09. Preuve d'inactivité réunie avant de toucher à quoi que ce
  soit :
  - interrogée avec sa propre valeur, lue dans une ancienne sauvegarde du VPS et jamais
    affichée : 0 $ sur le jour, la semaine et le mois ;
  - aucun des 48 conteneurs en marche ne la porte (comparaison par empreinte SHA-256) ;
  - la console OpenRouter indique une dernière utilisation il y a 15 jours.
  Supprimée dans la console, sur ordre de Laurent. Contrôle après coup : la clé répond
  **401**, une clé en service prise comme témoin répond 200, et la recherche « Maudios » ne
  renvoie plus rien dans la console.
- **Trois fichiers morts supprimés** (C46, commit `625504b`) : `auditLiveProtocol.ts`,
  `auditReportTemplate.ts`, `postAuditEmails.ts`, restes de l'offre d'audit gratuit
  abandonnée le 16/09. Aucun import, ni par chemin ni par symbole exporté. Typecheck,
  lint et 95 tests verts ; le manifeste est identique après build, donc le site servi n'a
  pas changé d'un octet et il n'y avait rien à déployer.
- **Clé `re-enghien` plafonnée à 1 $ par jour**, sur ordre de Laurent. C'était la seule clé
  en service sans aucun plafond. Mesure avant : 2,07 $ consommés depuis février, 0,03 $
  sur 30 jours, 0 $ ce mois-ci. Vérifié par l'API après coup : `limit: 1`,
  `limit_reset: daily`, clé toujours fonctionnelle.
- Point des chantiers ouverts fait pour Laurent, à partir du HANDOFF et de `ops/BACKLOG.md`.

## Cassé

- Rien. Une surprise de méthode : le navigateur intégré n'est **pas** connecté à
  OpenRouter. La console n'est ouverte que dans le Chrome de Laurent ; la suppression est
  donc passée par Claude in Chrome, la clé repérée à son nom et à son suffixe affiché, et la
  ligne montrée à Laurent avant de cliquer.
- Piège évité sur `re-enghien` : la console n'active la remise à zéro qu'après la saisie
  du montant, et la coche verte enregistre le montant seul. Valider 1 $ avec « Reset
  limit » encore sur N/A aurait posé un plafond **à vie**, déjà dépassé par les 2,07 $
  consommés : la clé aurait cessé de fonctionner sur-le-champ. Remise à zéro réglée sur
  « Daily » d'abord (au clavier, le clic sur l'option ne prenait pas), montant ensuite.
- `Maudios` survit dans une dizaine d'anciennes sauvegardes `.env.bak-*` du VPS. Inerte
  désormais (401), mais ces fichiers gardent aussi d'autres secrets périmés : à purger un
  jour, avec la même prudence.

## Reste

- C20 : `Seo` (trois conteneurs **et** le shell local de Laurent) et `Oracle` (deux
  conteneurs), toutes deux partagées entre plusieurs projets.
- Arbitrages de Laurent : formulaire LinkedIn avant le 9/10, indexation des pages légales,
  délais « réponse sous 24 h », Traefik (C39), règles de pare-feu (C41), dépôt privé (C2).
