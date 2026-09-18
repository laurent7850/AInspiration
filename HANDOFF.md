# HANDOFF — AInspiration

> **Lis ce fichier en premier, avant tout code.** Il porte le contexte qui ne tient pas
> dans une conversation : l'état réel du projet, les décisions déjà tranchées, les pièges
> connus et la prochaine action.
>
> **Et mets-le à jour avant de finir ta session.** Un handoff périmé est pire qu'absent.

**Dernière mise à jour :** 18 septembre 2026 · session Claude Code (VPS **bridé par Hostinger** — tout est lent)
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
- Rapport SEO mensuel automatique : le 1er du mois à 7h, script sur le VPS (la base SEOPilot
  est sur un autre réseau Docker que n8n, d'où le script plutôt qu'un workflow).

### Ce qui est cassé, en pause, ou vide

- 🔴 **Le VPS entier est bridé par Hostinger depuis le 17/09** — et donc tout ce qui tourne
  dessus, AInspiration compris. Steal time à **91 %** : la machine dispose d'environ **9 % de
  ses 4 cœurs**. RAM, disque et I/O sont sains, c'est purement du CPU refusé par l'hyperviseur.
  Quatre `ct_set_limits` le 17/09 entre 08:00 et 11:00 UTC, puis un `ct_restart` à 12:41, après
  que la charge soit montée à 100 %. **Ne conclus pas à une panne applicative** tant que ce
  bridage dure : un service lent ou un conteneur qui met des minutes à démarrer en est la
  conséquence, pas la cause. Détail complet dans `docs/journal/2026-09-18-vps-bride-par-hostinger.md`.
- **`audityo-postgres` est `Exited (128)` depuis le reboot du 17/09.** `audityo-web` est up et
  healthy, mais sa base est à terre. Découvert en passant le 18/09, non traité.
- **Les CGV et la politique de confidentialité** décrivent encore l'audit gratuit comme une
  prestation contractuelle, avec une clause de responsabilité sur « les recommandations formulées
  dans le rapport d'audit ». C'est le dernier endroit où l'offre abandonnée survit, et il est
  contractuel : à réécrire avec l'arbitrage de Laurent, pas sans.
- **L'article de blog « Thierry »** est construit de bout en bout sur le parcours audit gratuit
  → Pack Express. À réécrire ou à retirer.
- **Deux grilles tarifaires hors O1–O5** : l'essai gratuit de 14 jours du CRM (`crm.json`) et la
  tarification de la création visuelle (`content.json`). À trancher avec Laurent.

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

---

## 4. Chantiers ouverts

| # | Chantier | Où ça en est | Prochaine action |
|---|---|---|---|
| 0 | **Les dernières traces de l'offre abandonnée** — le chantier prioritaire | La refonte O1–O5 est **déployée et vérifiée** : zéro occurrence de l'ancienne offre dans le HTML brut, carte SEO backend comprise. Ce qui reste est dans les **textes contractuels** (CGV section 3, SLA, politique de confidentialité) et dans **l'article de blog « Thierry »**. Inventaire clé par clé dans `docs/chantiers/cgv-et-dernieres-traces.md`. | Exécuter cette note. **Aucun texte contractuel ne se publie sans validation de Laurent.** |
| 1 | **Vitrine des réalisations** (`/realisations` + une fiche par projet) | **Construite et en production depuis le 04/09** — 16 fiches dans `src/data/realisations.ts`, `RealisationsPage.tsx` et `RealisationDetailPage.tsx`, branche `feat/realisations` fusionnée dans `main`. Vérifié le 18/09 : `/realisations` et `/realisations/facturation-automatisee` répondent 200. Matériel de cadrage dans `docs/audit-realisations.md`, `docs/realisations-chiffres.md`, `docs/PROMPT-realisations.md`. | Rien de bloquant. Si enrichissement il y a (captures, chiffres vérifiés), il se décide fiche par fiche — jamais de capture inventée. |
| 2 | **Chaîne de publication** | Correctif antislashes posé à la source, 2 articles sur 95 nettoyés en base. | Vérifier la publication du **lundi 21/09** : les trois langues doivent sortir. Si EN/NL échouent encore, c'est que la cause n'était pas uniquement l'échappement. |
| 3 | **Remplir le CRM** | Ingestion opérationnelle depuis le 15/09, mais aucun prospect réel. | Relève du GTM LinkedIn (grille O1–O5), pas du code. Côté dépôt : rien à faire tant que le flux entrant n'existe pas. |
| 4 | **Newsletter** | Désactivée, tables conservées. | Aucune action. Décision de suppression définitive ou de relance à prendre plus tard. |
| 5 | **Montées de dépendances — majeures restantes** | Mineures **faites le 18/09.** PR #34 fusionnée et déployée en production : react 19.3, vite 8.3, lucide 1.44, zod 4.6 backend. Conteneur recréé, 211/211 fichiers téléchargés, contrôle de santé à 25 vérifications vertes. Restent trois majeures : Tailwind 4 (#32), uuid 14 (#31), jsdom 30 (#33). | Tailwind 4 dans une session dédiée — c'est la plus lourde. uuid et jsdom peuvent partir ensemble dans une branche groupée, comme #34. |
| 6 | **VPS bridé par Hostinger** — bloque tout le reste | Diagnostiqué le 18/09. Steal à 91 %, la machine tourne sur ~9 % de ses 4 cœurs depuis le 17/09 12:41. Deux contributeurs identifiés côté charge : le déclencheur `Chaque 5 min : vérifier file EN` de l'auto-blog Distr'Action (`QSzmS1gzyQjvCwtc`, 288 exécutions/jour pour constater une file vide) et un essaim de healthchecks (~45 conteneurs, dont 12 PostgreSQL, un `runc init` chacun toutes les 10-30 s). **Rien n'a été modifié** — désactiver un déclencheur ou toucher aux conteneurs de production demande l'arbitrage de Laurent. | Ouvrir le ticket Hostinger avec les quatre `ct_set_limits` et la courbe à 100 %. **Faire baisser la demande d'abord**, sinon ils rebrideront. |

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
