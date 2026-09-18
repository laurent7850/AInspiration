# HANDOFF — AInspiration

> **Lis ce fichier en premier, avant tout code.** Il porte le contexte qui ne tient pas
> dans une conversation : l'état réel du projet, les décisions déjà tranchées, les pièges
> connus et la prochaine action.
>
> **Et mets-le à jour avant de finir ta session.** Un handoff périmé est pire qu'absent.

**Dernière mise à jour :** 18 septembre 2026 · session Claude Code (CGV et dernières traces **déployées** ; bridage du VPS **résolu**, `dockerd` en cause)
**Journal complet :** Notion → Distr'Action — Poste de pilotage → Journal de bord

---

## 1. Le projet en trois lignes

AInspiration est la division conseil/formation IA de Distr'Action SRL et le tremplin
commercial du groupe. Le dépôt porte deux choses distinctes : le **site vitrine trilingue**
`ainspiration.eu` (FR par défaut, EN, NL) et le **CRM interne** qui sert tout le portefeuille
de projets, pas seulement AInspiration.

Stack : React 18 + Vite + Tailwind + i18next / Express + PostgreSQL 16 (`docker/backend/`) /
n8n pour l'orchestration / VPS Hostinger `srv767464.hstgr.cloud` derrière Traefik.
L'arbre de dépendances détaillé est dans `CLAUDE.md` — lis-le avant de toucher au routage
ou aux composants CRM.

---

## 2. Règles non négociables

1. **Aucun chiffre inventé.** Rien ne se publie, ni sur le site ni dans un livrable, qui
   n'ait été vérifié dans une source réelle (GSC, GA4, base de données) ou validé par Laurent.
2. **Clients anonymisés par défaut.** Le nom de la radio, en particulier, ne sort jamais.
3. **Pas de Supabase** pour les nouveaux développements, autant que possible.
4. **Pas de secret recopié à la main.** L'incident du 16/09 vient de là. Tout secret vit en
   variable d'environnement, et une variable absente doit **fermer** la porte, jamais l'ouvrir.
5. **Design existant respecté.** On ajoute, on ne refond pas.
6. **Un seul CRM pour tout le portefeuille.** Les prospects des autres projets (Audityo compris)
   y entrent aussi, distingués par le champ `source`.
7. **Ne pas confondre `/crm` et `/crm-dashboard`.** `/crm` est la page vitrine publique avec
   accès démo. `/crm-dashboard` est l'application réelle. Le cloisonnement démo/réel a été
   déployé et vérifié le 15/09 — ne le casse pas en « simplifiant » `ownerScope()`.

---

## 3. État au 18 septembre 2026

### Ce qui tourne

- Site public et CRM en production, cloisonnement démo/réel vérifié (15/09).
- Les 4 formulaires du site créent une fiche dans le CRM, avec un champ `source`.
- Authentification des workflows n8n par `SERVICE_SECRET` : indépendant de `JWT_SECRET`,
  sans expiration, n'ouvre que les deux routes nécessaires. 8 tests la verrouillent.
- Surveillance quotidienne des parcours métier (écriture + relecture d'une fiche sonde,
  secret d'ingestion, jeton CRM, liens d'articles dans le HTML brut, fraîcheur du contenu
  à 15 jours). Tous les contrôles étaient OK au 16/09.
- Dépendances mineures à jour en production depuis le 18/09 (react 19.3, vite 8.3, zod 4.6 backend).
  Déploiement fait dans l'ordre : build → Netlify → **vérification des 211 entrées du manifeste sur le CDN**
  → commit du manifeste → recréation du conteneur.
- **L'offre abandonnée a disparu partout, textes contractuels compris** (18/09, PR #35).
  CGV section 3 réécrite pour le rendez-vous de découverte — sans renuméroter — et section 11
  vidée de ses engagements chiffrés (99 %, 24h, 5 jours ouvrés, 4h) ainsi que du renvoi au
  document SLA. Article « Thierry » retiré, 301 vers `/realisations`. Vérifié en HTML brut sur
  quinze URL des trois langues, motif large : **zéro occurrence**. 23 vérifications vertes.
- Rapport SEO mensuel automatique : le 1er du mois à 7h, script sur le VPS (la base SEOPilot
  est sur un autre réseau Docker que n8n, d'où le script plutôt qu'un workflow).

### Ce qui est cassé, en pause, ou vide
- *(Retiré le 18/09.)* Le workflow n8n **« Uptime Alert - Email Notification »**
  (`gcfMHZw6zHxAUUmI`) était actif, orphelin et cassé : son nœud Gmail lisait
  `{{ $json.email }}` alors que la charge utile d'un webhook arrive sous **`$json.body`** — le
  champ « À » restait vide, l'envoi échouait à tous les coups, et il n'avait **jamais** pu
  fonctionner. Désactivé et renommé `[RETIRE 18/09/2026]`, conservé pour référence.
  Tout passe désormais par `/webhook/vps-alert` (`cJP1FcQVkUwrBNht`).
  **La règle qui en sort : dans un nœud n8n déclenché par webhook, la charge utile est sous
  `$json.body`, jamais à la racine.** Ce seul niveau a rendu une chaîne d'alerte muette.

- *(Résolu le 18/09 — conservé ici parce que la cause peut revenir.)* **Le VPS entier a été
  bridé par Hostinger du 17 au 18/09**, steal à 91 %, après que sa charge soit montée à 100 %.
  Cause réelle : **`dockerd` tournait en rond sur un cœur entier**, bloqué sur une
  désynchronisation avec containerd (`AlreadyExists: task already exists`) au sujet de
  `audityo-postgres`, et relancé toutes les 5 minutes par un cron sans borne de reprise.
  Résolu : tâche fantôme purgée, puis redémarrage du démon avec `live-restore` armé — les 43
  conteneurs n'ont pas été coupés. `dockerd` 103 % → 1,7 %, `user+sys` 32 % → 5-8 %, idle à
  91-96 %. **`live-restore` reste activé** : un futur redémarrage du démon ne coupera plus rien.
  Trois réflexes retenus — **ne lis pas la charge moyenne comme une consommation** (sous
  plafond CPU elle compte les processus en attente, tes propres commandes la font monter à 50) ;
  **un plafond masque le travail, il ne prouve pas son absence** ; **compare la somme des
  cgroups au total système**, c'est l'écart qui désigne un processus de l'hôte. Récit complet
  et erreurs commises dans `docs/journal/2026-09-18-vps-bride-par-hostinger.md`.
- *(Résolu le 18/09.)* **`/root/audityo/health-check.sh` borne désormais ses reprises.**
  Il retentait `docker restart` indéfiniment en jetant la sortie d'erreur (`2>/dev/null`) :
  324 échecs consécutifs invisibles, un cœur brûlé 27 h. Désormais **3 tentatives maximum**
  par cible, compteurs dans `/var/lib/audityo-health/`, remis à zéro dès le retour à la
  normale, puis un unique `ABANDON ... INTERVENTION MANUELLE REQUISE` avec la commande de
  réarmement. La sortie d'erreur est journalisée. Vérifié sur copie isolée (6 exécutions,
  tout en échec → 3 tentatives puis arrêt). Sauvegarde : `health-check.sh.bak-20260918`.
  **Ne retire pas cette borne** : une reprise automatique qui ne converge pas est une panne
  qui s'aggrave, pas une panne qui se répare.
- *(Résolu le 18/09.)* **La surveillance prévient désormais par mail.** Canal : workflow n8n
  « Distr'Action — Alerte VPS (générique) » (`cJP1FcQVkUwrBNht`), webhook `vps-alert`.
  Trois émetteurs : `/opt/vps-watchdog.sh` (cron `*/15`, veille **machine** — steal, CPU,
  processus emballé, disque, mémoire, conteneur à terre), `health-check.sh` (mail à l'abandon)
  et `/opt/uptime-check.sh`. Copies de référence dans `docs/ops/vps/`, **le VPS fait foi**.
  Signe de vie chaque **lundi 7h** : son absence est elle-même une alerte.
- *(Découvert et corrigé le 18/09.)* **`/opt/uptime-check.sh` n'avait jamais envoyé une seule
  alerte** : il postait sur `http://localhost:5678`, or **n8n ne publie aucun port sur
  l'hôte**. La surveillance de 10 domaines était muette depuis sa création. Sa liste était
  en outre fausse — quatre domaines qui ne résolvent pas, et `delijn.be` qui **appartient à
  un tiers**. Remplacée par les 17 domaines réellement déclarés dans Traefik.
  **N'écris jamais `localhost:5678` dans un script de l'hôte** : sors par Traefik.

- **Le CRM est quasiment vide** : une seule fiche, la sonde de surveillance. L'ingestion
  depuis les formulaires ne fonctionne que depuis le 15/09. Aucun prospect réel.
- **Newsletter abandonnée comme canal** (0 abonné actif, 0 envoi en 9 mois). Capture retirée
  du site, workflow n8n désactivé. **Conservés volontairement** : pages de confirmation et de
  désinscription, routes API, tables — un abonné en attente existe et ses droits RGPD doivent
  rester servis. Décision réversible, ne supprime rien sans arbitrage.
- **Versions EN et NL du dernier article** : échouées. Cause trouvée (voir pièges), correctif
  posé à la source, **pas encore vérifié en conditions réelles** — la prochaine publication
  est prévue lundi 21 septembre et c'est elle qui fait la preuve.
- *(Réglé le 18/09 — conservé ici parce que le symptôme peut revenir.)* Le dépôt affichait
  **321 fichiers modifiés** sans qu'aucune modification réelle n'existe : arbre de travail en
  CRLF, index en LF, `core.autocrlf` à `false`. Un `.gitattributes` avec `* text=auto eol=lf`
  a été posé (commit `174afba`) et `git status` est repassé à zéro. **Ne supprime pas ce
  fichier** : c'est lui seul qui tient la normalisation.

### Décisions déjà tranchées — ne pas rouvrir sans raison neuve

| Date | Décision |
|---|---|
| 13/09 | La grille d'offres **O1–O5** du volet 2 du plan de lancement est **la seule** stratégie commerciale de référence. Objectif : 3 000 €/mois. |
| 16/09 | Les décisions des comités de direction consignées dans Notion (audit IA gratuit comme produit d'appel, Pack Automatisation Express à 1 490 €) sont **abandonnées**. |
| 16/09 | Renoncement au Pool d'experts IA de Start IA pour l'instant. À réexaminer une fois des missions clients livrées. |
| 16/09 | Blog conservé en trois langues. **Fenêtre de décision : fin novembre 2026.** Critère fixé d'avance : **500 impressions et 15 clics sur 28 jours**. En dessous, changer de format ou arrêter. Ce critère ne se renégocie pas après coup. |
| 16/09 | Pool de sujets du blog réorienté vers le terrain gagnable : audit IA, PME, Hainaut, Bruxelles, Belgique, conformité EU AI Act. |
| 14/09 | Un seul CRM pour tout le portefeuille, démo publique conservée et cloisonnée. |
| 18/09 | **Le CRM n'est pas un produit en vente.** Sa grille publique (29/49 € par utilisateur et par mois, Enterprise sur mesure) et son essai gratuit de 14 jours sont retirés : le compte de démonstration remplit ce rôle, et lui existe. Même traitement pour la tarification de la création visuelle — ce travail entre dans O3. |
| 18/09 | **Aucun engagement de niveau de service par défaut.** Délais, support et disponibilité se fixent au devis, prestation par prestation. À rouvrir seulement si Laurent veut tenir des niveaux chiffrés sur O4. |

---

## 4. Chantiers ouverts

| # | Chantier | Où ça en est | Prochaine action |
|---|---|---|---|
| 0 | **Les dernières traces de l'offre abandonnée** | **Fait et déployé le 18/09** (PR #35) : CGV, politique de confidentialité, article Thierry, grilles du CRM et de la création visuelle. Trouvés en chemin et supprimés : `CreationVisuellePage.tsx`, orpheline avec une troisième grille morte, et `public/sitemap.xml`, écrasé à chaque build et qui listait encore Thierry sans aucune réalisation. | **Hors dépôt :** le document SLA dans Notion décrit toujours l'ancienne offre. Le renvoi vers lui a été retiré des CGV, le document reste à refaire. |
| 1 | **Vitrine des réalisations** (`/realisations` + une fiche par projet) | **Construite et en production depuis le 04/09** — 16 fiches dans `src/data/realisations.ts`, `RealisationsPage.tsx` et `RealisationDetailPage.tsx`, branche `feat/realisations` fusionnée dans `main`. Vérifié le 18/09 : `/realisations` et `/realisations/facturation-automatisee` répondent 200. Matériel de cadrage dans `docs/audit-realisations.md`, `docs/realisations-chiffres.md`, `docs/PROMPT-realisations.md`. | Rien de bloquant. Si enrichissement il y a (captures, chiffres vérifiés), il se décide fiche par fiche — jamais de capture inventée. |
| 2 | **Chaîne de publication** | Correctif antislashes posé à la source, 2 articles sur 95 nettoyés en base. | Vérifier la publication du **lundi 21/09** : les trois langues doivent sortir. Si EN/NL échouent encore, c'est que la cause n'était pas uniquement l'échappement. |
| 3 | **Remplir le CRM** | Ingestion opérationnelle depuis le 15/09, mais aucun prospect réel. | Relève du GTM LinkedIn (grille O1–O5), pas du code. Côté dépôt : rien à faire tant que le flux entrant n'existe pas. |
| 4 | **Newsletter** | Désactivée, tables conservées. | Aucune action. Décision de suppression définitive ou de relance à prendre plus tard. |
| 5 | **Montées de dépendances — majeures restantes** | Mineures **faites le 18/09.** PR #34 fusionnée et déployée en production : react 19.3, vite 8.3, lucide 1.44, zod 4.6 backend. Conteneur recréé, 211/211 fichiers téléchargés, contrôle de santé à 25 vérifications vertes. Restent trois majeures : Tailwind 4 (#32), uuid 14 (#31), jsdom 30 (#33). | Tailwind 4 dans une session dédiée — c'est la plus lourde. uuid et jsdom peuvent partir ensemble dans une branche groupée, comme #34. |
| 6 | **Bridage du VPS — résolu, reste un garde-fou à poser** | Incident clos le 18/09. `dockerd` tournait en rond sur un cœur entier (désynchronisation avec containerd sur `audityo-postgres`, entretenue par un cron sans borne). Tâche fantôme purgée puis démon redémarré avec `live-restore` armé : aucun des 43 conteneurs coupé. `dockerd` 103 % → 1,7 %, idle 65 % → 91-96 %, brasspat 1,28 s → 0,165 s. Les **deux** paliers (15/09 et 17/09) ont disparu. Laurent a levé le bridage à la main côté Hostinger. | Borner les reprises de `/root/audityo/health-check.sh` — compteur de tentatives et arrêt après N échecs, sans jeter la sortie d'erreur. Puis surveiller : `user+sys` > 40 % ou `cswch/s` > 10 000 sont les empreintes de la récidive. |

---

## 5. Pièges connus

- **Le modèle échappe parfois ses guillemets à l'intérieur du HTML qu'il produit.** Ces
  antislashes s'affichent sur la page et, recopiés dans le prompt de traduction, font produire
  un JSON malformé au traducteur. Ce n'est **pas** une troncature : augmenter `max_tokens` ne
  corrige rien (réflexe appliqué à tort le 1er septembre).
- **Un appelant sans identité recevait `NULL`** dans `ownerScope()`, c'est-à-dire « voit tout ».
  Il reçoit désormais un identifiant qui ne correspond à aucune ligne. Si tu retouches cette
  fonction, garde ce comportement : sans identité, on ne voit **rien**.
- **`admin@ainspiration.eu` n'avait aucun mot de passe** depuis sa création — `init.sql` crée
  le compte sans `password_hash`. Un mot de passe a été posé et rangé dans 1Password. Si tu
  touches à `init.sql`, ne recrée pas le trou.
- **`git fetch origin main` ne met pas à jour `origin/main`.** Il ne bouge que `FETCH_HEAD`. Sur ce dépôt où plusieurs sessions poussent, une référence de suivi périmée fait croire à des commits non poussés qui le sont depuis longtemps — erreur commise le 18/09, quatre commits annoncés à tort comme en attente. Avant toute conclusion sur l'état de synchronisation : `git fetch origin` **sans argument de branche**, puis `git rev-list --left-right --count origin/main...main`.
- **Les tests ne tournent pas depuis une session Cowork.** `node_modules` contient des binaires
  natifs Windows (rolldown) ; le shell distant est sous Linux. `type-check` et `lint` passent,
  `vitest` non. Une modification écrite depuis Cowork n'est donc **jamais** entièrement vérifiée :
  rejoue les tests en session Claude Code avant tout déploiement.
- **Anonymiser un client ne s'arrête pas au slug et au nom de fichier.** La capture d'écran de la fiche
  playlists affichait « Radio Nostalgie Belgique » **dans l'image**, sous le titre : renommer le fichier
  n'aurait rien caché. Avant de déclarer une fiche anonyme, **ouvrir ses images et les regarder**.
- **Netlify rejoue `npm run build` depuis le dépôt** — il ne se contente pas du `dist/` poussé par
  `--dir=dist`. Un fichier modifié localement mais **non committé** est donc écrasé par la version du
  dernier commit : `index.html` est reparti en ligne avec l'ancien contenu jusqu'à ce qu'il soit poussé.
  Committer **avant** de déployer, toujours.
- **Le contenu que voient les robots vit à trois endroits, pas un.** Les locales servies à l'exécution,
  le bloc SEO écrit à la main dans `index.html` (titre, `<h1>`, liste des offres, FAQ, JSON-LD), et la
  **carte SEO dupliquée** dans `docker/backend/routes/seo.js`. Corriger les locales seules ne change rien
  pour un crawler. Vérifier les trois, et vérifier **en HTML brut, insensible à la casse** — « Free Audit »
  a survécu à deux passes parce que je cherchais « free audit ».
- **Chercher « audit gratuit » ne trouve pas « audit IA gratuit ».** Trois formes ont traversé toutes
  les passes du 18/09 pour cette seule raison : `audit IA gratuit`, `Free AI audit`, `Gratis AI-audit`.
  Elles vivaient dans la **seconde carte SEO du backend** (`routeSEO` dans `seo.js`, distincte de
  `seo-routes.json`), dans les liens de service injectés dans le HTML brut de chaque page, et dans les
  gabarits de posts LinkedIn. Chercher par **expression régulière large et insensible à la casse**,
  du type `(audit[^.]{0,14}(gratuit|free|gratis)|(gratuit|free|gratis)[^.]{0,14}audit)`.
- **Des pages orphelines portent du contenu qui paraît mort et ne l'est pas.** `CreationVisuellePage.tsx`
  n'avait ni route ni import, mais portait une grille tarifaire complète ; `public/sitemap.xml` était
  écrasé à chaque build et a fait viser le mauvais fichier à une note de cadrage. Avant de corriger un
  fichier, vérifier qu'il est **réellement celui qui est servi**.
- **Le dépôt vit sous OneDrive.** Un fichier écrit depuis une autre session peut ne pas être
  encore synchronisé quand tu lis le dépôt. Vérifie la présence réelle d'un changement avant
  de conclure qu'il n'a pas été fait.
- **Les pannes ici sont silencieuses.** Tout répondait 200 pendant que deux chaînes de
  publication étaient mortes depuis huit jours. Un test qui vérifie qu'une page répond ne
  vérifie rien. Vérifie le parcours, pas le code de retour.

---

## 6. Rituel de fin de session — obligatoire

La boucle de travail est : **Cowork réfléchit et laisse une note → Claude Code exécute et
laisse un handoff → Cowork reprend le raisonnement.** Ce fichier est la moitié Claude Code
de cette boucle. S'il n'est pas à jour, la boucle est rompue.

Quand tu as fait du vrai travail, avant de rendre la main :

1. **Mets à jour ce fichier** — section 3 (état), tableau de la section 4 (chantiers),
   section 5 si tu es tombé dans un piège que personne n'avait noté, et la date en tête.
2. **Écris une note** dans `docs/journal/AAAA-MM-JJ-sujet-court.md`, au format exact de
   `docs/journal/README.md`, avec `notion: non`.
3. **Commite les deux** avec ton travail.

La commande `/handoff` fait les trois.

**Tu ne remontes rien dans Notion toi-même.** Ce dépôt n'a pas de connecteur Notion, et
c'est volontaire : chaque connecteur chargé pèse sur le contexte. La session Cowork lit les
notes marquées `notion: non`, les pousse dans la base *Journal de bord*, et remplace le
`non` par l'URL. Écris le fichier, c'est tout.

### Ce qui est automatique

| Quand | Ce qui se passe |
|---|---|
| Ouverture de session | Un hook `SessionStart` injecte ce fichier dans ton contexte, signale les notes pas encore remontées, et donne l'état du dépôt. |
| Fin de tour | Un hook `Stop` vérifie que le rituel est fait **si du vrai travail a eu lieu**. Il ne parle qu'une fois par session — s'il te rappelle à l'ordre et que tu juges le travail trop mince pour mériter une note, dis-le en une ligne et arrête-toi. |

Les deux hooks vivent dans `.claude/hooks/`, leur configuration dans `.claude/settings.json`.
