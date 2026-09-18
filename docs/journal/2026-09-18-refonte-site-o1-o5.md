---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Avancée
notion: https://app.notion.com/p/3dffb662f4aa8142b806c70dac915cad
prochaine-action: Trancher le sort de legal.json, de l'article Thierry et des deux grilles hors O1–O5
---

## Fait

- **Chantier 0 exécuté** (commit `9e54296`, 76 fichiers, trois langues). Le site
  n'annonce plus l'audit gratuit en 24h ni le Pack Express, abandonnés le 16/09.
- **Grille O1–O5** dans `pricing.json` et `Offers.tsx` : Diagnostic 2 400 €, Atelier
  900/1 500 €, Sprint 3 500–6 000 €, Pilote 590 €/mois, Check AI Act 990 €, tarif
  fondateur −20 % pour les trois premiers clients. La page `/audit` devient celle du
  rendez-vous de découverte de trente minutes.
- **Le formulaire d'audit est reformulé, pas supprimé.** Décision assumée : il alimente
  l'ingestion CRM, seule capture de prospects du site, opérationnelle depuis le 15/09.
  Le supprimer aurait coupé le seul flux entrant pour retirer une promesse qu'il suffisait
  de réécrire.
- **Retiré ce qui n'était pas vrai** : témoignages fabriqués de `/formation` et `/prompts`,
  tableau comparatif des prompts inventé de bout en bout (« Précision 45 % → 85 % »),
  « plus de 100 000 interactions analysées », métriques −60 % et +90 %, hero
  « Gagnez 10h par semaine ». « Notre équipe » et « nos experts » passent à la première
  personne — en gardant le « notre équipe » de `crm.json`, qui désigne l'équipe du client.
- Typecheck, lint `--max-warnings 0`, 84 tests front et build : verts.
- **Déployé en production le 18/09**, après accord de Laurent. Vérifié sur le HTML brut :
  **zéro mention de l'ancienne offre** sur treize URL des trois langues, titres corrigés dans
  les trois langues, redirection 301 de l'ancienne fiche active, ancienne image en 404, et
  « nostalgie » absent du site. `scripts/health-check.mjs` : 25 vérifications vertes.

## Cassé

- **L'anonymisation de la fiche playlists était plus grave que ce que la note décrivait.**
  L'image affichait « Radio Nostalgie Belgique » **en clair**, sous le titre. La note de
  cadrage listait le slug, la clé i18n et le nom du fichier : renommer n'aurait rien caché,
  et la fiche serait restée publiquement attribuable. Le sous-titre a été remplacé dans
  l'image par la mention déjà utilisée dans le texte. Piège ajouté au handoff.
- **Le déploiement a demandé quatre cycles au lieu d'un**, pour deux raisons qu'il faut retenir.
  D'abord, **Netlify rejoue `npm run build` depuis le dépôt** : il ne se contente pas du `dist/`
  poussé par `--dir=dist`. Mes corrections d'`index.html`, faites localement mais pas encore
  committées, sont donc reparties en ligne dans leur ancienne version. Committer avant de
  déployer, toujours. Ensuite, **le contenu que voient les robots vit à trois endroits** : les
  locales servies à l'exécution, le bloc SEO écrit à la main dans `index.html`, et une carte SEO
  **dupliquée** dans `docker/backend/routes/seo.js`. J'ai corrigé les locales en croyant en avoir
  fini ; le `<title>` de l'accueil annonçait encore « Audit Gratuit ».
- **« Free Audit » a survécu à deux passes** parce que je cherchais « free audit ». Chercher
  insensible à la casse, sur le HTML brut.
- Deux erreurs à corriger en chemin, sans conséquence : le sitemap se génère par
  `scripts/vite-plugin-sitemap.ts` et non par `public/sitemap.xml` que visait la note ; et
  trois apostrophes françaises introduites dans des chaînes TypeScript à guillemets simples
  ont cassé la compilation, rattrapées par le typecheck.

## Reste

Trois blocs laissés dehors **volontairement**, chacun pour une raison :

- **`legal.json`** — les CGV (section 3 entière, « Audit IA gratuit — Conditions
  spécifiques ») et la politique de confidentialité décrivent l'audit gratuit comme une
  prestation contractuelle, avec une clause de responsabilité sur « les recommandations
  formulées dans le rapport d'audit ». Réécrire un engagement contractuel sans arbitrage
  n'est pas mon rôle.
- **Le scénario Thierry du blog** — un article entier construit autour du parcours « audit
  gratuit → Pack Express ». Ce n'est pas une chaîne à remplacer, c'est un article à
  réécrire ou à retirer.
- **Deux grilles tarifaires hors O1–O5, trouvées en chemin** : l'essai gratuit de 14 jours
  du CRM (`crm.json`) et la tarification de la création visuelle (`content.json`). Ni l'une
  ni l'autre n'était dans l'inventaire de la note de cadrage. À trancher : relèvent-elles
  d'O1–O5, ou sont-ce des produits distincts qui gardent leur propre grille ?

**Tout est en production depuis le 18/09.** Le seul échec restant du contrôle de santé est
l'absence de hreflang sur l'article du 16/09, qui préexistait : c'est le chantier 2, et c'est
la publication de lundi qui tranchera.
