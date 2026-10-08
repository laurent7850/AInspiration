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
- **Firecrawl Toolkit et Rampa sortis des clés `Seo` et `Oracle`.** Inventaire par
  empreinte : `Seo` servait SEOPilot, `firecrawl-toolkit` et le poste de Laurent ; `Oracle`
  servait DreamOracle et `rampa-web`. Laurent a corrigé ma lecture : `Seo` **est** la clé de
  SEOPilot et `Oracle` celle de DreamOracle — il ne s'agissait pas de les remplacer mais d'en
  sortir les intrus. Deux clés créées par Laurent (1 $/jour chacune), posées, conteneurs
  recréés ; vérifié sur la clé chargée par chaque conteneur, sites en 200.
- Droits corrigés sur quatre fichiers de secrets de `firecrawl-toolkit` et `rampa-rag`,
  lisibles par tout compte du VPS (644 → 600).
- **Dix clés OpenRouter sans plafond supprimées**, sur ordre de Laurent et sous la condition
  qu'elles ne servent plus : dernière utilisation à six mois ou plus (ou jamais) selon la
  console, et aucune chargée par un conteneur. `linkedin`, `enghien`, `ville-enghien`,
  `n8n2026`, `nosta`, `Labo Nosta`, deux `pour n8n cloud`, `test n8n`, `base`. Contrôle
  final : 18 clés, toutes plafonnées au jour, aucune inattendue ; 13 conteneurs sur 13
  avec une clé valide.
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
- **Les deux clés collées portaient une lettre `n` en trop** (74 caractères au lieu de 73),
  probablement le reste d'un `\n` collé avec la valeur. OpenRouter les refusait. Vu en
  interrogeant l'API sur le fichier **avant** de redémarrer : sans ce contrôle, Firecrawl et
  Rampa perdaient l'IA. Corrigé en tronquant à 73 ; la commande de pose refuse désormais
  toute valeur qui n'a pas la forme `sk-or-v1-` + 64 caractères hexadécimaux.
- J'avais d'abord présenté `Seo` et `Oracle` comme des clés partagées à remplacer : c'était
  faux, Laurent a rectifié.
- Le heredoc de Git Bash a encore mangé des barres obliques dans un script de traces :
  repris par l'outil d'écriture, rien n'avait été écrit entre-temps.
- La console OpenRouter résiste à l'automatisation : le menu des lignes ne s'ouvre pas de
  façon fiable, et un clic ne prend qu'après une capture d'écran. Contourné par la page de
  chaque clé, avec vérification du nom et du suffixe avant chaque clic. Une fausse alerte
  au passage : une fenêtre « Create API Key » cachée, toujours présente dans la page, que
  j'ai d'abord crue ouverte — le décompte final (18 clés) confirme que rien n'a été créé.
- `Maudios` survit dans une dizaine d'anciennes sauvegardes `.env.bak-*` du VPS. Inerte
  désormais (401), mais ces fichiers gardent aussi d'autres secrets périmés : à purger un
  jour, avec la même prudence.

## Reste

- C20 : la variable Windows `OPENROUTER_API_KEY` de Laurent porte encore `Seo` — à
  supprimer, ou à remplacer par une clé `poste-laurent`.
- Arbitrages de Laurent : formulaire LinkedIn avant le 9/10, indexation des pages légales,
  délais « réponse sous 24 h », Traefik (C39), règles de pare-feu (C41), dépôt privé (C2).
