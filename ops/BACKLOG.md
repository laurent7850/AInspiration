# Chantiers

> Une ligne par chantier. Créé par le DG à l'issue d'un comité ou d'un briefing.
>
> **Statut** : `todo` · `doing` · `blocked` · `review` · `done`
> **Prio** : `P1` ce trimestre · `P2` utile · `P3` un jour
> **Auto** : `oui` seulement si une routine planifiée peut l'exécuter sans humain
> devant l'écran. Par défaut `non` — ne jamais passer à `oui` de sa propre initiative.

> **Amorce du 2026-09-22.** Aucune ligne n'est devinée. C1–C17 viennent des sections 3 et 4
> de `HANDOFF.md` ; C18–C22 de la relecture des notes de mémoire du projet, qui portaient
> des chantiers ouverts que le handoff n'avait jamais repris — `VITE_BOOKING_URL` vide
> depuis toujours, le double comptage GA4 ouvert depuis le 13/08, le cloisonnement
> OpenRouter laissé en plan le 17/09, l'épuisement du pool de sujets et deux workflows
> jamais inspectés. Les chantiers que le handoff donne pour clos (tâches CRM, vitrine des
> réalisations, montées de dépendances, traces de l'offre abandonnée dans ce dépôt) n'y
> figurent pas. `grep TODO/FIXME` sur `src/`, `scripts/` et `docker/backend/` hors
> `node_modules` : **aucun résultat**.

## Ouverts

| ID | Chantier | Responsable | Prio | Statut | Échéance | Auto |
|----|----------|-------------|------|--------|----------|------|
| C1 | Épingler l'image n8n sur `2.40.5` dans `/root/docker-compose.yml` — tel quel, un recreate fait pour autre chose montera de version en silence, migrations irréversibles comprises. Traiter aussi les dépréciations annoncées au boot et les `N8N_BASIC_AUTH_*` mortes depuis la 1.0. | Dev | P1 | todo | — | non |
| C2 | Passer ce dépôt GitHub en **privé** (constaté public le 19/09 ; aucun secret dans l'historique de `.env.*`, mais voir C3). | Dev | P1 | todo | — | non |
| C3 | **Clé OpenRouter en clair dans `n8n-workflows/README.md`**, dépôt public — voir `ops/APPROVALS.md`, la rotation attend un feu vert. | Dev | P1 | blocked | — | non |
| C4 | **Collecte POP3 de Gmail cassée** depuis le changement de mot de passe d'`info@ainspiration.eu` : reporter le nouveau mot de passe dans Gmail → Paramètres → Comptes et importation. Gmail désactive la collecte après une série d'échecs. | Opérations | P1 | todo | — | non |
| C5 | Supprimer la fiche et la société de test du CRM (`test-relais-info-22092026@ainspiration.eu`), depuis `/contacts` **en admin** — invisibles en démo par conception. | Opérations | P2 | todo | — | non |
| C6 | Prouver que le relais du formulaire Audityo arrive bien dans la boîte : il faut une soumission réelle **postérieure au 19/09**. Contrôle hebdomadaire conçu, prérequis manquant = un token de l'API Email d'`audityo.eu` en credential n8n, **à créer par Laurent dans hPanel**. | Opérations | P2 | blocked | — | non |
| C7 | Arbitrer les gardes `IF` des workflows Audityo : `typeVersion: 2` sans `conditions.options.version: 2`, donc vraisemblablement inertes. **Ne pas les « réparer » tels quels** — la regex de `Password Reset` exige un jeton à deux segments là où un JWT en a trois, corriger la version sans la regex casserait la réinitialisation en production. | Dev | P2 | todo | — | non |
| C8 | Vérifier que la parution du blog sort bien dans les **trois langues** — premier vrai test du correctif antislashes du 16/09, la chaîne EN/NL n'a pas été exercée depuis. | Dev | P1 | todo | 2026-09-24 | non |
| C9 | Regénérer les versions EN et NL de l'article du 16/09 (zéro `hreflang`). C'est **la seule cause** du contrôle de santé rouge du lundi, et il le restera chaque semaine sans ça. | Dev | P1 | todo | — | non |
| C10 | Arbitrer les deux promesses chiffrées restantes du site : « Mise en place en 48h » (à garder seulement si le délai a été tenu) et « Données 100% sécurisées ». Le « 48h » existe **en double** — locale *et* `AnimatedStats.tsx`, qui porte ses chiffres en dur ; un second « 100% » vit sur `animatedStats.eu`. | Marketing | P1 | todo | — | non |
| C11 | Un outil par métier pour la communication multicanale. **Dans l'ordre, rien avant** : (1) Laurent demande l'accès Community Management à LinkedIn ; (2) session CommunityOS pour obtenir **une** publication réelle ; (3) ne pas toucher aux auto-blogs avant fin novembre ; (4) retirer le module LinkedIn du CRM, mais seulement après (2). Consignes dans `docs/chantiers/communication-multicanal.md`. | DG | P1 | todo | — | non |
| C12 | Relire le **DPA v1.0** — toujours référencé vivant par les CGV §12, jamais relu depuis avril — et retirer du `CLAUDE.md` de Paperclip la grille « Comité #2 » (Pack Express, audit gratuit, 290 €/mois) qui nourrit encore les dix agents. **Hors dépôt** : consigne prête dans `docs/chantiers/sla-obsolete-paperclip.md`, à exécuter depuis une session Paperclip. | Légal | P2 | todo | — | non |
| C13 | Remplir le CRM en prospects réels. L'ingestion fonctionne depuis le 15/09 ; il n'y a **aucun prospect réel**. Relève du GTM LinkedIn sur la grille O1–O5, pas du code — rien à faire côté dépôt tant que le flux entrant n'existe pas. | Ventes | P1 | todo | — | non |
| C14 | Construire une **fenêtre de maintenance déclarée** : la veille VPS ne distingue toujours pas un déploiement d'une panne. Surveiller la récidive du bridage (`user+sys` > 40 % ou `cswch/s` > 10 000). | Dev | P2 | todo | — | non |
| C15 | Vérifier que `/var/log/vps-watchdog.log` ne porte plus de ligne « steal au-dessus du seuil » depuis le correctif du 21/09. Reste ouvert : les trois cron sont alignés sur la minute ronde, c'est-à-dire sur le pire moment du CPU de l'hôte. | Dev | P2 | todo | 2026-09-23 | non |
| C16 | Confirmer sur la moyenne `sar` le gain de la désactivation de `x2goserver` (14 % d'un cœur), puis décider si on purge les paquets `x2go*`. Réversible par `systemctl enable --now x2goserver`. | Dev | P3 | todo | — | non |
| C19 | **GA4 — désactiver « Modifications de page basées sur les événements de l'historique »** (Admin → Flux de données → Mesure améliorée). Tant que c'est actif, chaque navigation SPA compte **deux** vues et toute lecture d'audience est faussée. Ouvert depuis le 13/08/2026. | Marketing | P2 | todo | — | non |
| C20 | **Une clé OpenRouter par projet.** `Maudios` est une clé maîtresse partagée par **sept conteneurs**, et **15 des 17 clés n'ont aucun plafond** — aucune rotation n'est possible sans tout casser, et attribuer une dépense à un projet demande une enquête. Cartographie et plafonds décidés le 17/09 (exposition cible 11 $/jour) ; restent à créer. **Laurent crée les clés et colle les valeurs**, jamais Claude. | Dev | P2 | todo | — | non |
| C21 | **Le pool de sujets du blog s'épuise vers février 2027** : la garde 409 bloquera la republication sans remplir le pool, et ces semaines-là ne publieront **rien**. À traiter avant, ou à faire tomber avec la décision de fin novembre (C22). | Marketing | P3 | todo | 2027-02 | non |
| C22 | **Inspecter `Distr-Action — Publish from AutoSEO` et `Audityo — Publish from AutoSEO`** : ils suivent le même patron que le workflow AInspiration, qui portait encore **trois jetons admin en clair** découverts seulement le 16/09 — morts depuis la rotation du 08/09, donc muets sans que personne le sache. Jamais inspectés. | Dev | P2 | todo | — | non |
| C23 | **La chronologie de `/a-propos` contredit le JSON-LD.** « Notre Histoire » raconte 2019–2026 (création en 2019, « expansion internationale » en 2022) alors que `structuredData.ts` déclare `foundingDate: "2025"`. Les deux sont servis en clair aux robots, qui les recoupent. Échappée à la purge du 29/08, relevée le 12/09, jamais tranchée : soit la chronologie est réelle et la date est fausse, soit l'inverse. Voir [ADR-001](decisions/ADR-001-aucune-preuve-fabriquee.md). | Marketing | P2 | todo | — | non |
| C24 | **`TL Services` est nommé en production sans accord**, publié dans le HTML servi depuis le 04/09 par le bloc SEO, qui imprime la clé `client` de chaque fiche sans filtre. Découvert le 22/09 en vérifiant la production, pas en lisant le code. Laurent le voit sous peu : l'accord ne régularise pas une intention, il régularise quelque chose qui est **déjà en ligne**. *(`L'Artpéro` était dans le même cas ; arbitré le 22/09 — aucun accord requis, personne à qui le demander.)* Voir [ADR-006](decisions/ADR-006-nommer-nostalgie.md). | Légal | P1 | todo | — | non |
| C17 | Trancher le sort de la newsletter : suppression définitive ou relance. Tables, routes et pages conservées volontairement — **un abonné en attente existe et ses droits RGPD doivent rester servis**. Ne rien supprimer sans arbitrage. | DG | P3 | todo | — | non |

## Clos récemment

> Les chantiers `done` restent ici trois mois, puis se purgent. Le journal garde la trace.

| ID | Chantier | Responsable | Clos le |
|----|----------|-------------|---------|
| C18 | Le lien de réservation Cal.com ouvre les boutons de rendez-vous, et le libellé annonce enfin trente minutes | Ventes | 2026-09-22 |
