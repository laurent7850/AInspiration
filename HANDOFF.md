# HANDOFF — AInspiration

> **Lis ce fichier en premier, avant tout code.** Il porte le contexte qui ne tient pas
> dans une conversation : l'état réel du projet, les décisions déjà tranchées, les pièges
> connus et la prochaine action.
>
> **Et mets-le à jour avant de finir ta session.** Un handoff périmé est pire qu'absent.

**Dernière mise à jour :** 22 septembre 2026 · session Claude Code (le premier écran ne promet plus de résultat — `hero.subtitle` réécrit dans les trois langues et **déployé**, le site est aligné sur le profil LinkedIn ; et le document SLA d'avril est **archivé sans successeur** — le refaire aurait rouvert la décision du 18/09 : un SLA autonome *est* un engagement par défaut, ce que la section 11 des CGV venait de retirer. Consigne prête pour la session Paperclip, où vit le fichier)
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
- **Le parcours de contact d'Audityo est surveillé depuis le 19/09**, par l'effet réel :
  la sonde poste au webhook, puis relit la ligne écrite dans `contacts` et l'efface. Le
  code de statut de ce webhook ne prouve rien — son `responseMode` est posé dans `options`
  au lieu du premier niveau, il est donc ignoré et le 200 part avant toute exécution.
  C'est ce 200 qui est parti pendant six jours pendant que le formulaire était muet.
- Dépendances mineures à jour en production depuis le 18/09 (react 19.3, vite 8.3, zod 4.6 backend).
  Déploiement fait dans l'ordre : build → Netlify → **vérification des 211 entrées du manifeste sur le CDN**
  → commit du manifeste → recréation du conteneur.
- **L'offre abandonnée a disparu partout, textes contractuels compris** (18/09, PR #35).
  CGV section 3 réécrite pour le rendez-vous de découverte — sans renuméroter — et section 11
  vidée de ses engagements chiffrés (99 %, 24h, 5 jours ouvrés, 4h) ainsi que du renvoi au
  document SLA. Article « Thierry » retiré, 301 vers `/realisations`. Vérifié en HTML brut sur
  quinze URL des trois langues, motif large : **zéro occurrence**. 23 vérifications vertes.
- **Les tâches de Laurent vivent dans le CRM** depuis le 18/09 (PR #37). Trois routes sous
  `TASK_SECRET`, secret dédié et cloisonné de `SERVICE_SECRET`, propriétaire assigné
  explicitement depuis `TASK_OWNER_EMAIL` — jamais `ownerScope()`. Le hook `SessionStart` les
  affiche à l'ouverture, **en échec ouvert**. Vérifié en production : création, dédoublonnage,
  clôture tracée, recréation après clôture, et **le compte démo ne les voit pas**.
- **Les alertes VPS sont lisibles et ne se répètent plus** (18/09). Le nœud Gmail lisait un
  niveau trop haut (`[object Object]`), et `clear_alert()` annulait la fenêtre de silence dès
  que la condition retombait une fois — le steal oscillant autour de 20 %, Laurent recevait une
  alerte toutes les 15 minutes. Hystérésis de 3 passages sur les deux bords, éprouvée sur copie
  isolée. **Le seuil de 20 % n'a pas bougé** : le défaut était la nervosité, pas la sensibilité.
- Rapport SEO mensuel automatique : le 1er du mois à 7h, script sur le VPS (la base SEOPilot
  est sur un autre réseau Docker que n8n, d'où le script plutôt qu'un workflow).

### Ce qui est cassé, en pause, ou vide
- **Ce dépôt GitHub est public.** Constaté le 19/09 (`private: false` sur l'API GitHub, et
  `git ls-remote` répond sans authentification). Aucun secret n'a jamais été committé — vérifié
  sur l'arbre actuel et sur l'historique complet de `.env.production` et `.env.development`, qui
  n'ont jamais porté que des variables `VITE_`. Mais le dépôt n'a aucune raison d'être public.
  **À passer en privé**, comme `autoseo`. Détail du constat dans la note Notion du 19/09.
- *(Retiré le 18/09.)* Le workflow n8n **« Uptime Alert - Email Notification »**
  (`gcfMHZw6zHxAUUmI`) était actif, orphelin et cassé : son nœud Gmail lisait
  `{{ $json.email }}` alors que la charge utile d'un webhook arrive sous **`$json.body`** — le
  champ « À » restait vide, l'envoi échouait à tous les coups, et il n'avait **jamais** pu
  fonctionner. Désactivé et renommé `[RETIRE 18/09/2026]`, conservé pour référence.
  Tout passe désormais par `/webhook/vps-alert` (`cJP1FcQVkUwrBNht`).
  **La règle qui en sort : dans un nœud n8n déclenché par webhook, la charge utile est sous
  `$json.body`, jamais à la racine.** Ce seul niveau a rendu une chaîne d'alerte muette.

  *(Complété le 18/09.)* **Et quand la charge utile contient elle-même un champ `body`, l'erreur
  devient invisible.** `{{ $json.body }}` ne rend alors pas « indéfini » mais **l'objet entier**,
  affiché `[object Object]`. Les autres champs, eux, tombent en silence sur leurs valeurs par
  défaut — d'où un mail qui part, avec un sujet générique et « Source : inconnue ». Les trois
  émetteurs postent `{email, subject, body, source, log}` : lire `$json.body.<champ>`.

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
| 22/09 | **Le document SLA v1.0 est archivé sans successeur** — il n'est pas « à refaire ». Un document SLA autonome est par construction un engagement qui s'applique par défaut, ce que la décision ci-dessus a retiré. Un SLA neuf ne se rédigera que **limité à O4**, avec des chiffres donnés par Laurent, et la section 11 devra alors le référencer à nouveau. |

---

## 4. Chantiers ouverts

| # | Chantier | Où ça en est | Prochaine action |
|---|---|---|---|
| 0 | **Les tâches de Laurent arrivent dans le CRM** | **Fait et déployé le 18/09** (PR #37). `migration-007` jouée et **vérifiée par requête** — le service de migration avale ses erreurs, on ne s'y fie pas. `TASK_SECRET` généré sur le VPS, dans le `.env` et le compose, jamais affiché. Huit vérifications passées en production. Première tâche réelle déposée. | Rien. Les sessions déposent désormais au rituel (section 6). |
| 0 | **Les dernières traces de l'offre abandonnée** | **Fait et déployé le 18/09** (PR #35) : CGV, politique de confidentialité, article Thierry, grilles du CRM et de la création visuelle. Trouvés en chemin et supprimés : `CreationVisuellePage.tsx`, orpheline avec une troisième grille morte, et `public/sitemap.xml`, écrasé à chaque build et qui listait encore Thierry sans aucune réalisation. | **Hors dépôt, et la consigne est prête.** Sort tranché le 22/09 : **archivage sans successeur**, pas de réécriture — voir la décision datée en section 3. Le fichier vit dans le dépôt **Paperclip** (`legal/SLA-AInspiration-v1.0-2026-04-04.md`), il ne se touche donc pas depuis ici : consigne à coller dans `docs/chantiers/sla-obsolete-paperclip.md`. Cette session y a ajouté deux trouvailles : le **DPA** du même dossier est toujours référencé vivant par les CGV §12 (« disponible sur demande ») et n'a pas été relu depuis avril, et le `CLAUDE.md` de Paperclip porte encore la grille « Comité #2 » (Pack Express, audit gratuit, 290 €/mois) qui **nourrit les dix agents du comité de direction**. Reste à Laurent : la page Notion. **Tâche CRM `handoff:ainspiration:sla-notion` clôturée le 22/09 sur son ordre**, avec la mention explicite, dans la tâche, que ces deux actions ne sont pas couvertes par la clôture. |
| 0a | **Les promesses non étayées de la copie** | **Fait et déployé le 22/09** : `hero.subtitle` réécrit dans `public/locales/{fr,en,nl}/common.json` — l'ancien promettait un chiffre d'affaires en hausse et sous-entendait un portefeuille client inexistant. Périmètre tenu au texte seul : `tsc` propre, 84/84 tests, rendu vérifié à 375 px. Déployé dans l'ordre : build (209 entrées) → commit et **push du manifeste avant tout** → `netlify deploy --prod` → **209/209 entrées vérifiées une à une sur le CDN** → recréation du conteneur, reparti sur « Frontend: 209 files downloaded ». Netlify a rejoué le build depuis le dépôt et produit les mêmes empreintes que le build local. Sous-titre vérifié servi en production dans les trois langues ; un asset absent renvoie toujours 404 `text/plain`, le garde-fou du 8 juin est intact. Contrôle de santé : 24 vérifications vertes, 1 échec — l'article du 16/09 sans `hreflang`, antérieur et suivi en chantier 2b. Point 3 (le garde-fou au-dessus des chiffres) **vérifié, rien changé** : rendu sans masquage responsive, 177 px au-dessus du premier badge pour une fenêtre de 812 px. | **Deux chaînes attendent l'arbitrage de Laurent** : « Mise en place en 48h » (à garder seulement si le délai a été tenu) et « Données 100% sécurisées ». Et **le 48h existe en double** — l'argument du hero *et* le deuxième compteur de `AnimatedStats.tsx`, qui porte ses chiffres en dur et n'est donc pas atteignable par un diff de locales. Un **second « 100% »** vit sur `animatedStats.eu` (« Données hébergées en Europe »). Le défaut `-0%` du quatrième compteur (`prefix: '-'` + `Math.round(0)`) est **corrigé** : le signe ne s'affiche plus tant que la valeur vaut zéro (`useCountUp.ts`). |
| 0b | **La sonde Audityo n'écrit plus dans la boîte d'Audityo** | **Fait le 19/09.** Nœud `IF` « Sonde ? » posé et publié dans `PeZexnxVbueaKV81` (version active `d19aada9`), entre `Message valide ?` et `Relayer vers la boîte` : tout e-mail différent de `sonde-audityo@surveillance.ainspiration.eu` passe, la sonde s'arrête là. La branche `CRM — Ingestion contact` est inchangée — c'est elle qu'on surveille, la sonde doit continuer de la traverser. `typeVersion: 2` **et** `conditions.options.version: 2` vérifiés dans la version publiée. La note fausse du nœud CRM (« ce webhook répond en mode lastNode ») a été corrigée au passage. | **Le relais Gmail n'a PAS été vérifié** et c'est le seul point ouvert : je ne peux ni soumettre le vrai formulaire ni lire `info@audityo.eu`. Un `IF` mal configuré jetterait les messages réels **en silence**, et la surveillance ne le verrait pas — elle contrôle la branche CRM, pas la branche Gmail. Tâche déposée (`handoff:ainspiration:verif-relais-mail-audityo`, échéance 21/09). Retour arrière d'un seul geste : rebrancher `Message valide ?` directement sur `Relayer vers la boîte`. |
| 1 | **Vitrine des réalisations** (`/realisations` + une fiche par projet) | **Construite et en production depuis le 04/09** — **15** fiches dans `src/data/realisations.ts` (Rampa retiré le 18/09), `RealisationsPage.tsx` et `RealisationDetailPage.tsx`, branche `feat/realisations` fusionnée dans `main`. Vérifié le 18/09 : `/realisations` et `/realisations/facturation-automatisee` répondent 200. Matériel de cadrage dans `docs/audit-realisations.md`, `docs/realisations-chiffres.md`, `docs/PROMPT-realisations.md`. | Rien de bloquant. Si enrichissement il y a (captures, chiffres vérifiés), il se décide fiche par fiche — jamais de capture inventée. |
| 2 | **Chaîne de publication** | Correctif antislashes posé à la source, 2 articles sur 95 nettoyés en base. **La publication du 21/09 n'a pas eu lieu — et ce n'était pas l'échappement.** `POST /api/blog-posts` a répondu **409 « Subject already covered »**, jaccard **1.000** avec l'article du 16/09 : le garde anti-redondance a fait exactement son travail, c'est le tirage du sujet en amont qui était fautif (voir le piège du tirage arithmétique, section 5). Corrigé et déployé dans n8n le 21/09 : tirage exhaustif, plus un nœud « Choisir le sujet » qui écarte un doublon **avant** la génération. 12 parutions simulées contre les 32 titres FR réels, aucun doublon. | **La chaîne EN/NL n'a donc toujours pas été exercée depuis le correctif antislashes du 16/09.** Prochaine parution : **jeudi 24/09**, en mode retour d'expérience. Vérifier ce jour-là que les trois langues sortent — c'est le premier vrai test de ce correctif. Rien à rattraper pour la semaine du 21 : 16/09 → 24/09 fait 8 jours, soit le rythme nominal. |
| 2b | **L'article du 16/09 n'a pas ses versions EN et NL** | Trouvé par le contrôle de santé après le déploiement du 19/09 : zéro lien `hreflang` sur cette page, quatre sur toutes les autres. Séquelle de l'incident des antislashes — le correctif est posé pour les articles suivants, celui-là n'a jamais été regénéré. | Relancer la traduction de cet article seul, puis revérifier que `node scripts/health-check.mjs` ne compte plus aucun échec. **C'est la seule cause du contrôle de santé rouge du lundi 21/09** : 1 échec, 24 vérifications passées, et il restera rouge chaque semaine tant que cet article n'aura pas ses deux traductions. Le job Lighthouse du même run était rouge lui aussi (homepage 41 < 50) mais **repasse vert au rerun** : bruit de mesure, pas une régression. |
| 3 | **Remplir le CRM** | Ingestion opérationnelle depuis le 15/09, mais aucun prospect réel. | Relève du GTM LinkedIn (grille O1–O5), pas du code. Côté dépôt : rien à faire tant que le flux entrant n'existe pas. |
| 4 | **Newsletter** | Désactivée, tables conservées. | Aucune action. Décision de suppression définitive ou de relance à prendre plus tard. |
| 5 | **Montées de dépendances — majeures restantes** | **PR #36 fusionnée et déployée le 18/09** : uuid 11→14, jsdom 27→30. Conteneur recréé, 209/209 fichiers, contrôle de santé à 24 vérifications vertes. uuid était moins risqué qu'il n'en avait l'air : le backend tournait déjà en 14 en production. **Tailwind 4 migré le 19/09** : branche `chore/tailwind-4`, [#38](https://github.com/laurent7850/AInspiration/pull/38), qui remplace #32. `tailwind.config.js` supprimé, thème dans un bloc `@theme` de `src/index.css`, `autoprefixer` retiré. Rendu vérifié en comparant la **production en v3** à la branche : empreinte des styles calculés identique sur `/` et `/realisations`. | Rien. **Fusionnée et déployée le 19/09** : 210 fichiers vérifiés un à un sur le CDN avant le `--force-recreate`, conteneur reparti sur « Frontend: 210 files downloaded », empreinte des styles calculés identique à l'avant-migration sur `/realisations` (quatorze lignes, comptes compris). Restent non passés au même crible : le CRM (session authentifiée) et le blog. |
| 6 | **Bridage du VPS — résolu, reste un garde-fou à poser** | Incident clos le 18/09. `dockerd` tournait en rond sur un cœur entier (désynchronisation avec containerd sur `audityo-postgres`, entretenue par un cron sans borne). Tâche fantôme purgée puis démon redémarré avec `live-restore` armé : aucun des 43 conteneurs coupé. `dockerd` 103 % → 1,7 %, idle 65 % → 91-96 %, brasspat 1,28 s → 0,165 s. Les **deux** paliers (15/09 et 17/09) ont disparu. Laurent a levé le bridage à la main côté Hostinger. | **La borne est posée** (18/09, commit `fc00702`) : 3 tentatives par cible, sortie d'erreur journalisée, puis un `ABANDON` qui part maintenant par mail. Reste à **surveiller la récidive** — `user+sys` > 40 % ou `cswch/s` > 10 000 en sont les empreintes — et à construire une **fenêtre de maintenance déclarée** : la veille ne distingue toujours pas un déploiement d'une panne. |
| 6b | **Le watchdog mesurait mal — corrigé le 21/09** | Trois mails d'alerte dans la nuit du 20 au 21 (« steal 29 % », « steal 41 % »), pour une machine à 90 % idle dont `sar` mesure **3 %** de moyenne journalière. Deux défauts de mesure indépendants, aucune panne. **(a)** Le steal de cette machine est confiné aux **secondes 01 à 05 de chaque minute** (0-2 % le reste du temps, jusqu'à 64 % pendant ces quatre secondes) ; cron lançant la sonde à `:00:00`, `vmstat 5 3` échantillonnait exactement la fenêtre du pic. **(b)** La liste « processus les plus consommateurs » venait de `ps --sort=-pcpu`, dont le `%CPU` est cumulé sur la vie du processus — le mail de 21h00 affichait `ps` **lui-même à 200 %** et accusait `x2golistsession`, dont le vrai processus est à 0,2 %. Correctifs déployés : mesure décalée à la seconde 15 sur 30 s, corroboration par `sar` avant d'alerter, liste de processus prise sur la *seconde* itération de `top` (un delta). Sauvegarde `/opt/vps-watchdog.sh.bak-2026-09-21`, miroir `docs/ops/vps/` à jour. | **Vérifier sous 24 h** que `/var/log/vps-watchdog.log` ne porte plus aucune ligne « steal au-dessus du seuil ». Reste ouvert : nos trois cron sont tous alignés sur la minute ronde, c'est-à-dire sur le moment où le CPU de l'hôte est le plus disputé (`2-59/5` coûterait une ligne). |
| 6c | **`x2goserver` désactivé le 21/09 — 14 % d'un cœur brûlés pour rien** | Trouvé en vérifiant la fausse piste de l'alerte : le journal systemd du service portait `Consumed 7h 39min 18.429s CPU time` entre le 17/09 12h43 et le 18/09 07h30, soit **41 % d'un cœur en continu pendant la fenêtre du bridage** attribué à `dockerd` seul. Mesure par delta de cgroup : **8,2 % d'un cœur à l'instant, 14,1 % en moyenne depuis le 18/09** — environ la moitié du `user+sys` de la machine. Pour un service dont aucune session n'a jamais été ouverte (base `/var/lib/x2go/x2go_sessions` inchangée depuis l'image Hostinger du 22/05/2025, aucun `.x2go` nulle part). **Mon premier argument était faux** : j'avais parlé de surface d'attaque, or x2go n'ouvre aucun port, n'a aucun setuid et `sshd` ne le référence pas. `systemctl disable --now x2goserver`. Vérifié : SSH neuf OK, 43 conteneurs debout, site à 200 en 41 ms, aucun lien de démarrage `S` dans les runlevels. Paquets conservés — réversible par `systemctl enable --now x2goserver`. | Confirmer le gain sur la moyenne `sar` dans quelques jours : l'effet système (~2 points sur 4 cœurs) se noie dans le bruit d'un échantillon court. Décider ensuite si on purge les paquets `x2go*`. |

---

## 5. Pièges connus

- **`requestAnimationFrame` peut ne jamais se déclencher dans un volet de préview qui se
  déclare pourtant « visible ».** Le 22/09, les quatre compteurs animés de l'accueil ont été
  lus à `0h 0h 0% -0%` plusieurs secondes après le montage — de quoi conclure à un bug
  d'animation. En sondant l'instrument, rAF ne tournait tout simplement pas, alors que
  `document.visibilityState` répondait `visible` et `document.hidden` `false`. **Avant de
  conclure d'une lecture du DOM à un défaut d'animation, vérifier que rAF tourne** : une
  promesse sur `requestAnimationFrame` avec un `setTimeout` de repli suffit. Même famille que
  le 200 vide du webhook n8n : le signal qu'on interroge n'est pas celui qu'on croit.
- **Un motif de recherche qui colle le chiffre à son unité manque les chiffres du code.**
  Chercher `48h` trouve la chaîne de traduction mais pas `end: 48,` dans `AnimatedStats.tsx`.
  Le 22/09, cela m'a fait affirmer qu'aucun chiffre n'était en dur dans les composants, alors
  que le « 48h » du site existe à **deux** endroits. Quand on inventorie une promesse
  chiffrée, chercher le nombre nu en plus du nombre habillé — et ne pas oublier les `.js`,
  qui ne sont pas dans le réflexe `.json/.tsx/.ts`.
- **Un tirage `% longueur` peut n'atteindre qu'une partie de la liste, et rien ne le signale.**
  L'auto-blog choisissait son sujet par `topics[seed % 22]`, avec `seed = année × 53 + semaine × 7919`.
  Or `7919 mod 22 = 21 ≡ −1`, et le mode « sujet » ne tombe que les semaines **paires** : l'index était
  donc toujours **pair**. **11 des 22 sujets n'ont jamais pu sortir**, et les 11 autres revenaient tous
  les 5 mois. Six mois durant, cela n'a produit aucun message d'erreur — un défaut de *couverture* est
  muet par nature. Il n'est apparu que le 21/09, par un 409, et seulement parce qu'un rattrapage manuel
  avait avancé la collision de quelques jours. **Avant de se fier à un modulo, dérouler la suite sur
  plusieurs années et compter les indices réellement atteints.** Trois lignes de script suffisent.
- **Un garde placé en bout de chaîne coûte tout ce qui le précède.** Le 409 arrivait *après* la
  génération FR : 48 s d'appel au modèle payées pour un article jeté, et `Publier FR` étant en tête de
  la chaîne, ni l'anglais ni le néerlandais n'ont été produits. Un contrôle qu'on sait faire en amont
  se fait en amont ; celui d'aval reste, mais comme filet, pas comme mécanisme de routine. Corollaire
  posé dans « Choisir le sujet » : **si la liste de contrôle est injoignable, on publie quand même** et
  le 409 rattrape. Se taire est un pire défaut que republier — c'est la leçon des 18 jours de septembre.
- **Une sonde lancée par cron mesure toujours le même instant de la minute — et cet
  instant n'est pas neutre.** Le steal du VPS est confiné aux secondes 01 à 05 de chaque
  minute ; `vmstat 5 3` lancé à `:00:00` ne voyait que ça et alertait toute la nuit sur
  une machine saine. Une mesure périodique se décale volontairement hors des frontières
  rondes, et se corrobore avec une source indépendante (`sar`) avant de réveiller
  quelqu'un.
- **`ps --sort=-pcpu` ne désigne pas le processus qui consomme.** Son `%CPU` est cumulé
  sur la *vie* du processus : un processus né pendant la mesure (`ELAPSED 0`) sort en tête
  avec des valeurs absurdes. Les mails d'alerte du 20/09 accusaient `x2golistsession` à
  90 % et affichaient `ps` lui-même à 200 %. Pour un delta réel : la **seconde** itération
  de `top -b -n 2`, ou les compteurs `cpu.stat` par cgroup.
- **Le modèle échappe parfois ses guillemets à l'intérieur du HTML qu'il produit.** Ces
  antislashes s'affichent sur la page et, recopiés dans le prompt de traduction, font produire
  un JSON malformé au traducteur. Ce n'est **pas** une troncature : augmenter `max_tokens` ne
  corrige rien (réflexe appliqué à tort le 1er septembre).
- **Un paramètre rangé dans `options` alors que le nœud le lit au premier niveau est ignoré
  en silence.** Le webhook `audityo-contact` porte `responseMode: "lastNode"` **dans
  `options`** : le nœud ne l'y lit pas, retombe sur son défaut `onReceived`, et répond 200
  **avant** d'exécuter quoi que ce soit. Aucun avertissement, et un commentaire de nœud qui
  affirmait le contraire. C'est ce 200 vide qui est parti pendant six jours pendant que le
  formulaire d'Audityo était muet. **Ne jamais conclure d'un 2xx renvoyé par un webhook
  n8n** — vérifier l'effet réel. Pour contrôler la place d'un paramètre :
  `get_node` en mode `search_properties` donne sa `path` exacte.
- **Surveiller quelque chose ne justifie pas d'élargir un accès.** `ainspiration-postgres`
  et `root-n8n-1` sont tous deux sur le réseau `root_default` : un nœud Postgres dans n8n
  était techniquement possible pour la sonde Audityo du 19/09. Il a été écarté quand même —
  il aurait donné au moniteur un compte capable d'effacer n'importe quelle ligne de
  `contacts` pour surveiller un formulaire. Deux routes sous `INGEST_SECRET`, sur une
  adresse figée dans le code, font le même travail sans ce pouvoir. C'est la même décision
  que le 16/09, quand `GET /api/contacts/:id` a été remplacé par `/api/ingest/probe`.
- **Un appelant sans identité recevait `NULL`** dans `ownerScope()`, c'est-à-dire « voit tout ».
  Il reçoit désormais un identifiant qui ne correspond à aucune ligne. Si tu retouches cette
  fonction, garde ce comportement : sans identité, on ne voit **rien**.
- **`admin@ainspiration.eu` n'avait aucun mot de passe** depuis sa création — `init.sql` crée
  le compte sans `password_hash`. Un mot de passe a été posé et rangé dans 1Password. Si tu
  touches à `init.sql`, ne recrée pas le trou.
- **`git fetch origin main` ne met pas à jour `origin/main`.** Il ne bouge que `FETCH_HEAD`. Sur ce dépôt où plusieurs sessions poussent, une référence de suivi périmée fait croire à des commits non poussés qui le sont depuis longtemps — erreur commise le 18/09, quatre commits annoncés à tort comme en attente. Avant toute conclusion sur l'état de synchronisation : `git fetch origin` **sans argument de branche**, puis `git rev-list --left-right --count origin/main...main`.
- **Avant de déplacer `main` — réalignement, `reset`, `rebase`, bascule de branche — lance
  `git log origin/main..main` et pousse ce qui s'y trouve.** Ce qui y apparaît n'existe nulle
  part ailleurs : c'est souvent du travail écrit par une session Cowork, qui ne peut pas
  pousser elle-même. Une remise à plat de `main` l'effacerait sans un mot.
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
- **Le sitemap se dégrade en silence si l'API des articles est injoignable au build.**
  `scripts/vite-plugin-sitemap.ts` va chercher les articles publiés sur `/api/blog-posts` **pendant**
  le build ; en cas d'échec il émet un simple `console.warn` et produit le sitemap sans eux. Le 18/09,
  un build Netlify n'a pas joint l'API : le sitemap servi est passé de **89 à 39 URL**, les 50 articles
  disparus, sans qu'aucune étape n'échoue. Rejouer le déploiement a suffi, l'API répondant à nouveau.
  **Après chaque déploiement, compter les `<loc>` du sitemap servi**, ne pas se contenter d'un 200.
  C'est `scripts/health-check.mjs` qui l'a vu, par son avertissement sur les `lastmod` tous identiques.
- **`npm ci` échoue parfois en `EBUSY` à cause d'OneDrive**, qui tient un fichier de `node_modules`
  pendant sa synchronisation. Ce n'est pas un problème de dépendances : `rm -rf node_modules` puis
  relancer. Vu deux fois le 18/09, toujours sur `lucide-react`.
- **Un fichier de test non listé dans `package.json` ne tourne jamais, en silence.** Le script
  `test` de `docker/backend/package.json` énumère les fichiers un par un. Un nouveau test y est
  invisible tant qu'on ne l'ajoute pas : même classe de panne muette que `files.txt`, qui liste
  les fichiers que le conteneur télécharge au boot. Vérifier que le **nombre de tests augmente**
  après avoir ajouté un fichier.
- **Le frontend ne connaît que cinq statuts de tâche** : `not_started`, `in_progress`, `waiting`,
  `deferred`, `completed` (`getTaskStatuses`). La base en accepte deux de plus, `pending` et
  `cancelled`, hérités de `migration-001`. Une tâche écrite dans un statut que l'interface ignore
  s'affiche sans état lisible. Écrire `not_started` à l'ouverture.
- **Une temporisation d'alerte que le retour à la normale efface ne temporise rien.**
  `clear_alert()` supprimait l'horodatage de la fenêtre de silence au premier passage sous le
  seuil. Une grandeur qui oscille autour de son seuil — le steal, typiquement — réarmait donc la
  sonnette à chaque bascule, malgré une temporisation de 6 h correctement écrite. **Toute alerte
  sur une mesure continue a besoin d'hystérésis sur les DEUX bords** : N passages pour alerter,
  N passages pour déclarer la fin. Ici N = 3, soit 45 minutes soutenues.
- **Les scripts d'exploitation du VPS ont une copie de référence dans `docs/ops/vps/`, et elle
  dérive.** Elle avait déjà divergé le 18/09 au soir. **Le VPS fait foi** : après toute
  modification sur la machine, reprendre la copie par `scp` et la commiter, sans quoi le dépôt
  décrit un script qui n'existe plus.
- **Le dépôt vit sous OneDrive, et OneDrive peut ressusciter un fichier périmé.** Un fichier
  écrit depuis une autre session peut ne pas être encore synchronisé quand tu lis le dépôt.
  Pire : en cas de conflit, OneDrive garde la version distante sous un **nouveau nom**
  (`<fichier>-<MACHINE>.ext`) et **remet l'ancienne sous le nom d'origine**. Le 19/09, c'est
  ainsi que la capture non anonymisée de la fiche playlists — « Radio Nostalgie Belgique »
  en toutes lettres — est repartie en production pendant trente minutes, parce que trois
  déploiements ont été lancés sur un arbre de travail non propre.
- **On ne déploie pas sur un arbre de travail sale — et depuis le 19/09, le build le refuse.**
  `scripts/check-public-matches-head.mjs` (branché sur `postbuild` et `postbuild:prod`) fait
  échouer un build de production si `public/` n'est pas propre, si un fichier commité diffère
  de sa copie dans `dist/`, ou si `dist/` porte un fichier qui ne vient d'aucun commit.
  Échappatoire explicite : `ALLOW_DIRTY_PUBLIC=1` — qui revient à déployer des fichiers que
  personne ne peut rattacher à un commit. Le build de dev n'est pas concerné.
  La règle humaine reste la même : un binaire modifié sur une fiche client **se regarde**, il
  ne se contourne pas d'un « ce n'est pas le mien ». Et un décompte de manifeste qui change
  sans raison connue (209 → 210) est une question à instruire, pas une ligne de rapport.
- **Les pannes ici sont silencieuses.** Tout répondait 200 pendant que deux chaînes de
  publication étaient mortes depuis huit jours. Un test qui vérifie qu'une page répond ne
  vérifie rien. Vérifie le parcours, pas le code de retour.
- **Un montant écrit avec des espaces ordinaires se coupe en deux.** « 900 € / 1 500 € »
  s'affichait « 900 € / 1 » puis « 500 € » sur la carte O2. Dans une locale, les espaces
  **à l'intérieur** d'un montant — séparateur de milliers, et avant le symbole — s'écrivent
  en insécable (U+00A0, même chasse qu'une espace ordinaire, donc rien ne bouge à l'œil).
  Le `/` et le `–` restent sécables, sinon un prix long déborde sur mobile. Fait le 19/09
  pour les dix prix FR et NL ; les prix cités en prose gardent leurs espaces ordinaires.
- **Un codemod qui réécrit des classes réécrit aussi ce qui leur ressemble.** Celui de
  Tailwind 4 a renommé `'rounded'` en `'rounded-sm'` dans une **union de types**
  TypeScript de `Skeleton.tsx` : le type ne correspondait plus à aucun appelant. `tsc` l'a
  vu ; sans typage strict, la classe serait devenue `undefined` en silence. Il a aussi
  laissé passer les classes écrites dans des gabarits dynamiques. **Relire le diff d'un
  codemod sur ce qui n'est pas une classe**, et faire tourner `type-check` avant tout le reste.
- **Une mesure prise avant la fin du rendu d'une SPA fabrique des régressions imaginaires.**
  Le 19/09, une empreinte de styles relevée 3 secondes après la navigation portait sur une
  page à moitié montée — le titre du document était encore celui de l'accueil — et annonçait
  une douzaine d'écarts inexistants. Vérifier que la page est bien celle qu'on croit (titre,
  nombre de nœuds) **avant** de croire à l'écart. Pour comparer un avant/après de style, le
  témoin le plus sûr reste **la production**, qui porte encore l'ancienne version.
- **Une session ne commite que dans le dépôt où elle est enracinée.** Le 19/09, la session
  qui a écrit le hook `SessionStart` l'a reporté dans AutoSEO et y a inscrit les URL Notion
  du jour : deux commits écrits depuis ici, dans le dépôt voisin, dont le raisonnement
  n'était retrouvable que dans le journal d'AInspiration. Un travail à porter d'un dépôt à
  l'autre se porte en **deux sessions**, chacune écrivant sa propre note ; termine ici, puis
  rends la main avec la consigne prête à coller. Provenance inscrite des deux côtés
  (`docs/journal/2026-09-19-hook-commits-non-pousses.md` ici,
  `docs/journal/2026-09-19-provenance-des-deux-commits.md` là-bas).

---

## 6. Rituel de fin de session — obligatoire

La boucle de travail est : **Cowork réfléchit et laisse une note → Claude Code exécute et
laisse un handoff → Cowork reprend le raisonnement.** Ce fichier est la moitié Claude Code
de cette boucle. S'il n'est pas à jour, la boucle est rompue.

**Cowork n'écrit plus dans ce dépôt** (décision du 19/09/2026). Il n'a pas d'identifiants
GitHub : ses commits restent dans le clone local, sans jamais partir, et seraient effacés au
premier réalignement de `main` — trois commits du 18/09 ont vécu ainsi une journée en sursis.
Cowork réfléchit, laisse ses notes dans Notion et dicte ce qu'il y a à faire ; **c'est Claude
Code qui écrit dans le dépôt, commite et pousse.**

Quand tu as fait du vrai travail, avant de rendre la main :

0. **Ce qui dépasse la session part dans le CRM.** Une décision à trancher, un texte à
   valider, une démarche hors dépôt : `POST /api/service/tasks` avec un `ref` stable, une
   tâche par action. Ce que tu peux faire seul reste ici et n'encombre pas le CRM.
   **En cas d'hésitation, écris la ligne dans ce fichier et dis-le** — n'envoie pas au CRM
   « pour ne rien perdre ». Un CRM qui se remplit de lignes qu'on ne traite pas est un CRM
   qu'on n'ouvre plus.

   Tu ne clôtures une tâche que sur **preuve** qu'elle est faite, ou sur **ordre de Laurent**.
   Le motif est obligatoire et s'inscrit dans la tâche : la route refuse sans lui.

1. **Mets à jour ce fichier** — section 3 (état), tableau de la section 4 (chantiers),
   section 5 si tu es tombé dans un piège que personne n'avait noté, et la date en tête.
2. **Écris une note** dans `docs/journal/AAAA-MM-JJ-sujet-court.md`, au format exact de
   `docs/journal/README.md`, avec `notion: non`.
3. **Commite les deux** avec ton travail.
4. **Pousse** — `git push origin main`. Un commit non poussé n'est pas une trace, c'est une
   trace en sursis : personne d'autre ne le voit, et le prochain réalignement de `main`
   l'emporte.

La commande `/handoff` fait les quatre.

**Tu ne remontes rien dans Notion toi-même.** Ce dépôt n'a pas de connecteur Notion, et
c'est volontaire : chaque connecteur chargé pèse sur le contexte. La session Cowork lit les
notes marquées `notion: non`, les pousse dans la base *Journal de bord*, et remplace le
`non` par l'URL. Écris le fichier, c'est tout.

### Ce qui est automatique

| Quand | Ce qui se passe |
|---|---|
| Ouverture de session | Un hook `SessionStart` injecte ce fichier dans ton contexte, signale les notes pas encore remontées, et donne l'état du dépôt — **y compris les commits non poussés vers l'amont, listés s'il y en a**. Il ne fait aucun `git fetch` : si la référence distante manque ou date, il le dit et continue, il ne bloque pas l'ouverture. |
| Fin de tour | Un hook `Stop` vérifie que le rituel est fait **si du vrai travail a eu lieu**. Il ne parle qu'une fois par session — s'il te rappelle à l'ordre et que tu juges le travail trop mince pour mériter une note, dis-le en une ligne et arrête-toi. |

Les deux hooks vivent dans `.claude/hooks/`, leur configuration dans `.claude/settings.json`.
