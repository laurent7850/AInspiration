---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Vérifier lundi matin que le signe de vie hebdomadaire part et qu'aucune alerte parasite n'a été émise entre-temps
---

## Fait

Laurent a signalé qu'il recevait une alerte VPS illisible — corps `[object Object]`,
« Source : inconnue » — **toutes les quinze minutes**. Deux défauts sans rapport l'un
avec l'autre, trouvés en remontant l'exécution n8n réelle plutôt qu'en supposant.

- **Le format.** Le nœud Gmail lisait `{{ $json.body }}`, `{{ $json.source }}` à la racine.
  Un webhook n8n range la charge utile **sous `$json.body`** — c'est le piège déjà consigné
  le 18/09 au matin, mais il s'est présenté ici sous une forme que la note ne couvrait pas.
  Corrigé en `$json.body.<champ>`. Vérifié que les **trois** émetteurs (`vps-watchdog`,
  `uptime-check`, `audityo health-check`) postent la même forme : la correction vaut pour tous.
- **Le spam.** `clear_alert()` supprimait l'horodatage de la fenêtre de silence dès que la
  condition retombait **une seule fois**. Le steal oscillait autour du seuil de 20 % — 21 %,
  puis sous le seuil, puis 42 %, puis sous le seuil — donc chaque passage du cron réarmait la
  sonnette. La temporisation de 6 heures était correctement écrite ; elle était annulée à
  chaque bascule.
- **Hystérésis sur les deux bords** : 3 passages consécutifs au-dessus du seuil avant
  d'alerter, 3 en dessous avant de déclarer le retour. Avec le cron toutes les 15 minutes,
  cela fait 45 minutes soutenues.
- **Le seuil de 20 % n'a pas bougé.** Il est calé sur l'incident du 17/09, où la machine a
  tourné à 9 % de ses quatre cœurs pendant 27 heures sans que personne ne le sache. Le défaut
  était la nervosité, pas la sensibilité — baisser la sensibilité aurait « réglé » le symptôme
  en recréant la panne d'origine.
- Éprouvé **sur copie isolée**, six cas, dont l'oscillation de Laurent rejouée à l'identique :
  zéro mail là où il en recevait un par quart d'heure. Une vraie panne alerte toujours, et le
  retour à la normale s'annonce toujours.
- Copie de référence `docs/ops/vps/vps-watchdog.sh` resynchronisée depuis le VPS, et vérifiée
  sans secret avant commit.

## Cassé

- **Mon premier mail de test affichait des `\n` en clair, et j'ai failli conclure à un second
  défaut du système.** L'erreur était dans mon test : j'avais construit la charge utile à la
  main et court-circuité `notify()`, qui fait `printf '%b'` sur le corps **avant** de le passer
  à `jq`. Le chemin réel convertit bien les échappements. Vérifié par un second envoi passant
  cette fois par la vraie fonction, et par une démonstration hors ligne de la conversion.

  La leçon est générale : **un banc de test qui contourne le chemin de production ne teste pas
  la production**. J'ai reproduit l'appel, pas le programme.
- La copie de référence du script dans le dépôt avait **déjà divergé** de celle du VPS avant
  que je n'y touche. Le handoff dit « le VPS fait foi », mais rien ne garantit la
  resynchronisation. Piège ajouté.

## Reste

- **Deux mails de test sont partis dans la boîte de Laurent**, clairement identifiés `[TEST]`
  et `[TEST 2]`. C'était le seul moyen de prouver la correction de bout en bout.
- La surveillance **ne sait toujours pas distinguer un déploiement d'une panne**. Les pics de
  steal de ce soir coïncident avec mes recréations de conteneur. L'hystérésis absorbe le cas,
  mais ne le traite pas : une fenêtre de maintenance déclarée reste à construire. C'était déjà
  noté comme « sujet plus large » dans `docs/chantiers/cgv-et-dernieres-traces.md`.
- Rien ne vérifie que `docs/ops/vps/` reste aligné sur le VPS. Un contrôle de dérive — une
  comparaison de sommes de contrôle dans le health-check hebdomadaire — serait à sa place.
