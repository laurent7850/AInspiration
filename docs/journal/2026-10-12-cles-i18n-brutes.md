---
date: 2026-10-12
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Aucune — le vérificateur tourne en CI, le parcours navigateur a été fait une fois pour les clés dynamiques
---

## Fait

- **Laurent a vu la clé brute `animatedStats.audit` sous la carte « 30 min » de `/conseil`.**
  Cause : le commit de purge des preuves fabriquées (`e4ff57e`, 29/08) a posé les quatre
  clés `animatedStats.*` dans `common.json` seulement, alors que six composants les
  appellent depuis leur propre namespace (`features`, `training`, `analysis`, `support`,
  `prompts`, `recommendations`). i18next n'a aucun repli de namespace : la clé s'affiche
  telle quelle, dans les trois langues, sur `/conseil`, `/formation`, `/analyse-ia`,
  `/accompagnement`, `/prompts` et les recommandations. Six semaines sans que personne ne
  le voie — le contrôle de santé lit le HTML serveur, pas le rendu React.
- **Dix appels corrigés** avec `{ ns: 'common' }` (`247448d`), le motif déjà utilisé pour
  `consent.required` dans les formulaires.
- **Deux clés qui n'existaient qu'en valeur par défaut française** ajoutées en fr/en/nl :
  `blog:loading` (aria-label du squelette de `/blog`) et `crm:menu.unreadMessages`
  (badge de la barre latérale CRM). EN et NL recevaient du français.
- **Vérification de l'ensemble du site**, comme demandé : un script résout chaque
  `t('clé')` littérale de `src/` dans le namespace d'appel pour les trois langues
  (0 manquante après correction), puis un parcours navigateur de 35 routes publiques × 3
  langues cherche tout motif `xxx.yyy` dans le texte rendu — ce qui couvre aussi les 82
  clés construites dynamiquement que le script ne peut pas résoudre. Aucune autre clé
  brute (le seul « t.o.v » néerlandais est une abréviation). Les pages CRM n'ont été
  couvertes que par le script : se connecter au compte démo depuis le dev local
  enverrait le mot de passe à l'API de production.
- **Remarque de Laurent en cours de session : « 30 min » suivi de « Pour en parler trente
  minutes » répète la durée.** Libellé remplacé par « Premier échange de découverte » /
  « Initial discovery call » / « Eerste kennismakingsgesprek » (`28db84a`), dans les
  locales et dans la valeur par défaut de `AnimatedStats.tsx`. Les autres « trente
  minutes » du site sont dans des phrases, pas accolés à un chiffre : laissés.
- **Garde-fou** : `scripts/check-i18n-keys.mjs`, `npm run check:i18n`, en CI après le
  lint. Prouvé sur l'ancienne version de `Consulting.tsx` : 2 clés signalées, sortie 1.
- **Déployé deux fois** (le second pour le libellé) : build avec garde-fou `public/`
  conforme à HEAD, manifeste `7a1fe14` puis `e36e4bf`, Netlify en production, 215/215
  fichiers vérifiés sur le CDN, recreate de `web` (« Frontend: 215 files downloaded »),
  santé 28/28, CI verte. Vérifié dans le navigateur sur `https://ainspiration.eu/conseil` :
  plus de clé brute, nouveau libellé présent, ancien absent.

## Cassé

- **Les clés privées SSH ne sont plus dans `~/.ssh`** (dossier modifié aujourd'hui à
  15 h 35, seules les `.pub` restent) : elles vivent dans l'agent 1Password. Le `ssh` de
  Git Bash ne voit pas l'agent Windows (« Permission denied (publickey) ») ; seul
  `C:/Windows/System32/OpenSSH/ssh.exe` passe. Deux coupures de connexion pendant la
  session : lancer les commandes longues en `nohup` sur le VPS et relire l'état ensuite,
  plutôt que de faire confiance au retour de la commande.

## Reste

- Rien sur ce sujet. Si une page affiche encore `xxx.yyy`, c'est une clé dynamique :
  chercher le gabarit (`t(\`...${...}\`)`) et vérifier la valeur interpolée.
