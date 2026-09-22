---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Trancher les deux chaînes laissées en l'état — le délai de 48h et les deux « 100% » sur les données
---

## Fait

- **Le sous-titre du premier écran ne promet plus de résultat.** `hero.subtitle` remplacé
  dans les trois langues. L'ancien — « Rejoignez les PME qui automatisent leurs tâches
  répétitives et **boostent leur chiffre d'affaires** avec **nos** solutions » — cumulait
  trois défauts : un résultat présenté comme acquis, un portefeuille client sous-entendu qui
  n'existe pas, et un « nous » commercial alors que Laurent est seul et communique à visage
  découvert. Le nouveau texte décrit ce qui est réellement livré, à la première personne.
  Aligne le site sur le profil LinkedIn, repris le 22/09 sur la même règle.
- **Le FR est la dictée de Laurent, mot pour mot. L'EN et le NL sont de moi**, signalés
  comme tels avant validation : la note ne donnait que le français, et s'en tenir là aurait
  laissé « boosting revenue » et « hun omzet verhogen » en place. Validés par Laurent.
- **Périmètre tenu : trois lignes, trois fichiers de locales.** Aucun composant, aucune
  classe, aucune dépendance. `tsc --noEmit` propre, 84/84 tests verts, rendu vérifié en
  préview à 375 px — mise en page intacte, pas de débordement.
- **Le garde-fou des chiffres a été vérifié, pas déplacé.** « Les chiffres sont des objectifs
  réalistes — le diagnostic établit les vôtres » est rendu sans aucune classe de masquage
  responsive, et finit **177 px** au-dessus du premier badge pour une fenêtre de 812 px :
  les deux tiennent ensemble à l'écran sur mobile. Condition remplie, donc rien touché.

## Fait — second passage, sur consigne de Laurent

- **`-0%` corrigé.** Le quatrième compteur combinait `prefix: '-'` et `Math.round(0)` : il
  affichait littéralement `-0%` tant que la valeur restait à zéro — avant que l'observateur
  ne se déclenche, pendant le `delay`, et au début de la rampe. Le signe ne s'affiche plus
  que lorsqu'il y a un nombre à signer. Une ligne dans `useCountUp.ts`, `tsc` propre, lint à
  zéro avertissement, 84/84 tests, vérifié en préview : `0%` au lieu de `-0%`.
- **Tâche CRM `handoff:ainspiration:sla-notion` corrigée puis clôturée sur ordre de Laurent.**
  Son libellé disait encore « Refaire le document SLA », l'inverse de la décision. La
  justification de clôture inscrite dans la tâche nomme les deux actions qui restent
  matériellement à faire et que la clôture **ne couvre pas** : archiver la page Notion, et
  traiter le dépôt Paperclip.

- **Déployé le 22/09**, dans l'ordre imposé par le dépôt : build (209 entrées, manifeste
  régénéré par le hook `postbuild`) → commit **et push du manifeste avant tout le reste**,
  puisque c'est sur GitHub raw que le conteneur va le lire au démarrage → `netlify deploy
  --prod` → **209/209 entrées contrôlées une à une sur le CDN** → recréation du conteneur.
  Netlify a **rejoué le build depuis le dépôt** (57,9 s) et aurait donc pu produire d'autres
  empreintes que les miennes : c'est exactement ce que la vérification des 209 entrées sert à
  attraper. Elles étaient identiques. Conteneur reparti sur « Frontend: 209 files downloaded ».
- **Vérifié en production** : le sous-titre est servi dans les trois langues, un chunk du
  nouveau build répond 200 en `text/javascript`, et un asset absent renvoie 404 `text/plain`
  — le garde-fou posé après l'incident du 8 juin tient toujours. Contrôle de santé : 24
  vérifications vertes, 1 échec, celui de l'article du 16/09 sans `hreflang`, antérieur à ce
  déploiement et suivi au chantier 2b.

## Cassé

- **J'ai affirmé qu'aucun chiffre n'était en dur dans les composants. C'était faux.**
  `AnimatedStats.tsx` porte `end: 24`, `end: 48`, `end: 100`, `end: 60`. Mon motif de
  recherche cherchait des chiffres collés à leur unité (`48h`) et ne pouvait pas voir
  `end: 48,`. Conséquence concrète : les compteurs ne sont **pas** atteignables par un diff
  de locales, et le « 48h » du site existe donc en **deux** endroits, pas un. Corrigé auprès
  de Laurent avant qu'il ne tranche.
- **Un premier balayage avait aussi manqué les fichiers `.js`** — je n'avais scanné que
  `.json`, `.tsx`, `.ts`, `.html`. C'est exactement le piège du 18/09 (la carte SEO du
  backend vit dans `routes/seo.js`). Rattrapé au second passage, sans conséquence ici.

## Reste

- **Deux chaînes laissées en l'état, à trancher par Laurent** : « Mise en place en 48h »
  (`hero.features.simple`) — à garder seulement si le délai a déjà été tenu — et
  « Données 100% sécurisées » (`hero.features.secure`), garantie absolue intenable.
- **Il y a un second « 100% », sur l'hébergement des données** : le troisième compteur animé
  affiche `100%` sous « Données hébergées en Europe » (`animatedStats.eu`). Même nature de
  garantie absolue, et c'est probablement celui-là que Laurent visait de mémoire.
- **Je n'ai PAS pu vérifier que les compteurs s'animent pour un humain**, et c'est la seule
  chose que je n'ai pas su établir. J'ai bien reproduit `0h 0h 0% -0%` plusieurs secondes
  après le montage — mais en sondant l'instrument, **`requestAnimationFrame` ne se déclenche
  pas du tout dans le volet de préview**, alors que `document.visibilityState` répond
  « visible ». Les zéros viennent donc au moins en partie du banc de mesure. Leçon à retenir :
  *avant de conclure d'une lecture du DOM à un bug d'animation, vérifier que rAF tourne dans
  l'environnement de mesure.* Le seul test qui tranche est un vrai navigateur, déroulé à la
  main jusqu'aux compteurs. En revanche `prefers-reduced-motion` est correct par construction :
  `useCountUp` initialise la valeur à `end`, elle ne passe jamais par 0.
- **Le fallback SEO dit encore « Nos solutions d'Intelligence Artificielle »**
  (`index.html`), contre la règle de la première personne du singulier. Une occurrence,
  hors des quatre points de la note, pas touchée.
