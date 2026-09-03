# Addendum local à l'audit « Réalisations »

> Complément à [`docs/audit-realisations.md`](audit-realisations.md) (branche `feat/realisations`).
> Établi le 3 septembre 2026 depuis la **machine de Laurent**, ce qui lève les trois angles morts
> de la session cloud : accès réseau au VPS, et accès au disque local.
> **Aucun fichier de production n'a été modifié.**

**Note de localisation.** Le lien fourni pointait vers `the-event-linkedin`, branche
`claude/nouveau-repertoire-realisations-v37y23`. L'audit n'y est pas : cette branche n'a jamais
porté que `PROMPT-realisations.md`, ajouté puis retiré (`c404649` → `3031dba`). Le rapport vit
sur **`laurent7850/AInspiration`, branche `feat/realisations`**, avec le prompt. C'est cette
version-là qui est reprise ici.

---

## Ce que cet addendum change

| # | L'audit disait | La vérification locale montre |
|---|---|---|
| 1 | Rampa : « sans dépôt localisé », objet inconnu (§4.11, Q17) | **Dépôt complet trouvé**, 13 commits. C'est un **chat RAG sur les 19 ouvrages de T. Lobsang Rampa**. Next.js 15 / pgvector / Claude Opus 5. |
| 2 | brasspat : code introuvable (§4.10, Q16, Q21) | **Code trouvé sur le disque** : `Claude code\BrassPat04-2026`, application **Flask/Python**, 677 lignes. |
| 3 | brasspat et Saint Kilda = « le même outil, un fork par client » (§4.10) | **Faux.** Deux applications sans une ligne de code en commun : Python/Flask + OCR par LLM d'un côté, React/Vite 100 % navigateur de l'autre. |
| 4 | Paperclip, Baseline, Veille YouTube « dans les worktrees » (§4.9, Q5) | **Aucun des trois n'est dans `.claude-worktrees\`.** Deux sont ailleurs et exploitables, le troisième l'est à moitié. |
| 5 | Enghien : « deux ouvrages » (§4.6) | **Huit ouvrages** en production, de 1876 à 2007, crédités au **Cercle Royal Archéologique d'Enghien**. Déployé et **public** sur `enghien.srv767464.hstgr.cloud` (§A bis) — ce qui répond aussi à la Q7. |
| 6 | Rampa : « rien à capturer sans compte » | **Faux** : la page d'accueil et le chat s'affichent sans connexion. L'image est capturable telle quelle. |

**Arbitrage de Laurent, appliqué dans ce document :** **Rampa et Enghien passent en format
réduit — une image et l'explication du projet, rien de plus.** Ni page détail, ni galerie, ni
chiffres de résultat. Voir §A, §A bis et §E.

---

## A. Rampa — réponse à la question 17

**Ce que c'est.** Pas un référentiel de formations ni un outil scolaire : un **chat RAG sur le
corpus intégral de T. Lobsang Rampa**, auteur d'ouvrages sur le bouddhisme tibétain et
l'ésotérisme. L'utilisateur pose une question en français, le système retrouve les passages
pertinents dans les 19 livres et rédige une réponse sourcée. Une seconde section, « Lire », donne
accès au texte des ouvrages avec suivi de progression.

**Où vit le code.** `C:\Users\laure\OneDrive\Documents\Claude code\Rampa` — dépôt git **sans aucun
remote**. C'est pourquoi la session cloud ne pouvait pas le trouver : il n'a jamais été poussé
nulle part. Historique : 13 commits, le premier (`36f4f7a`) important les sources depuis un
worktree Claude de l'ancien monorepo ; dernier commit **2026-08-20**. Production dans
`/opt/rampa-rag` sur le VPS `srv767464`, déployée par `scp` + `docker compose up -d --build`,
sans `git pull` possible.

**Architecture réelle** (`README.md` et `CLAUDE.md` du dépôt) :

| Couche | Technologie |
|---|---|
| Front | React 19, Tailwind CSS 4, **PWA** installable (iOS/Android), service worker |
| Serveur | Next.js 15 App Router, réponses en **SSE** (streaming) |
| Base | **PostgreSQL 16 + pgvector + pg_trgm** — 5 488 fragments de 1 500 caractères |
| Embeddings | `openai/text-embedding-3-small` (1 536 dimensions) |
| Génération | **`anthropic/claude-opus-5`** via OpenRouter, `reasoning.effort: high`, 16 000 jetons |
| Infra | Docker multi-stage, Traefik + Let's Encrypt, VPS Hostinger |

**Le point technique qui vaut un argumentaire.** La recherche est **hybride, en v4** : vectorielle
(cosinus pgvector) *et* par mots-clés (`pg_trgm` + scoring TF-IDF, insensible aux accents). La
raison est documentée et honnête : sur des requêtes courtes en français,
`text-embedding-3-small` produit des embeddings médiocres — « lévitation » ne rapproche pas des
passages qui parlent de lévitation. Le lexical rattrape ce que le vectoriel manque. C'est le genre
de correction qu'on ne trouve qu'en mesurant, et un bon contre-exemple au « on branche un RAG et
ça marche ».

**Stade réel — et pourquoi c'est délicat pour la vitrine.**

- Le site **n'est plus ouvert à l'usage** : authentification inconditionnelle sur la bibliothèque,
  inscriptions fermées (`ALLOW_REGISTRATION`), chat ouvrable par drapeau `CHAT_PUBLIC`.
  L'**interface**, elle, reste visible sans connexion — d'où l'image capturable (voir plus bas).
- Le `CLAUDE.md` parle d'un « propriétaire » qui arbitre et d'un usage « personnel ».
  **Ce n'est pas présenté comme une livraison client.**
- Dettes assumées et écrites : aucune protection anti-bourrinage sur `/api/auth/login`, sessions de
  7 jours là où la baseline Distr'Action impose moins de 24 h, rotation de trois identifiants
  reportée le 2026-08-20 après séjour en clair dans une archive synchronisée sur OneDrive,
  ~30 chaînes d'interface désaccentuées dont 8 **dans le prompt système**.
- **Droit d'auteur non tranché** : Rampa est mort en 1981, les droits subsistent chez une
  succession ou des éditeurs, et chaque traduction porte celui de son traducteur. Le `CLAUDE.md`
  l'écrit : à arbitrer avec un juriste avant toute ouverture publique.

### ✅ Arbitrage de Laurent — format réduit

> **Rampa entre dans la vitrine, mais en format réduit : une image et l'explication du projet,
> rien de plus.** Pas de page détail, pas de galerie, pas de chiffres de résultat.
> **Même règle pour Enghien** (§A bis).

J'avais recommandé de ne pas le publier, à cause des droits d'auteur sur les 19 ouvrages.
Décision prise, je l'applique. Le format réduit réduit d'ailleurs beaucoup l'exposition : sans
page détail, il n'y a **ni citation du corpus, ni capture de la section « Lire », ni liste des
ouvrages** — donc rien qui donne accès au texte. Reste, en toute franchise, qu'une explication du
projet nomme forcément l'auteur : c'est le minimum irréductible, et c'est acceptable tant que la
fiche décrit **la méthode** (recherche hybride sur un corpus documentaire) et non l'accès au
contenu.

**L'image existe et est capturable telle quelle.** Contrairement à ce que je pensais, la page
d'accueil s'affiche **sans connexion** : en-tête « Rampa — Guide des enseignements », onglets
*Chat* / *Lire*, écran de bienvenue et champ de question. Le mur d'authentification n'intervient
qu'à l'usage. C'est exactement le visuel qu'il faut — l'interface, pas le contenu des livres.

> ⚠️ **Un défaut est visible sur cette capture.** Les accents manquants documentés plus haut
> apparaissent en clair à l'écran : « le Troisieme Oeil », « la meditation tibetaine ».
> Sur une vitrine commerciale qui vend de la rigueur, c'est le genre de détail qui se voit.
> **À corriger avant la capture**, pas après.

---

## A bis. Enghien — même format réduit, et deux corrections du §4.6

**Arbitrage de Laurent : une image et l'explication du projet, rien de plus.** Comme Rampa.
Conséquence directe : **la question 6 tombe en grande partie**. Sans page détail, il n'y a pas de
bloc « résultats », donc plus besoin des chiffres 794 pages / 262 000 mots / 4 livres /
18 chapitres / 46 sections que je réclamais. Ce qui reste ouvert est plus simple (voir plus bas).

**Le code est là, et le déploiement aussi — ce qui répond à la question 7.** Projet local
`Claude code\Ville-enghien` (et worktree `Ville-enghien\thirsty-ritchie\enghien-rag`), déployé sur
**`https://enghien.srv767464.hstgr.cloud/enghien`**. Next.js 15, Supabase (PostgreSQL + pgvector),
embeddings `text-embedding-3-small`, génération Claude Sonnet 4, VPS Hostinger sous PM2.

**Le site est public, sans authentification** (vérifié : `307` vers `/enghien`, puis `200`).
L'image est donc capturable immédiatement — et elle est bonne : identité bordeaux et or, page
« Bienvenue », cinq suggestions de questions réelles (*« Quelles étaient les principales foires et
marchés d'Enghien ? »*, *« Qui étaient les seigneurs d'Enghien au Moyen Âge ? »*…), filtre
« Tous les ouvrages », champ de saisie. Elle raconte le projet sans une ligne de texte
supplémentaire.

### ⚠️ Correction : le corpus n'a pas deux ouvrages, il en a huit

Le §4.6 disait « deux ouvrages, dont un de 1998 sous droits » — c'était vrai du `README.md`, qui
n'a pas suivi. **Le site en production annonce huit ouvrages**, « d'Ernest Matthieu (1876) aux
*Cahiers de Petit-Enghien* (2007) », et affiche en pied de page le **Cercle Royal Archéologique
d'Enghien**.

Deux conséquences :

1. **✅ Le partenaire est le Cercle, pas la Ville — tranché par Laurent.** C'est le **Cercle Royal
   Archéologique d'Enghien** qui doit être cité. L'accord de la Ville d'Enghien, que la question 6b
   de l'audit réclamait, **est sans objet**. Trois conséquences de rédaction :
   - La fiche ne décrit pas un projet d'**administration communale** mais un projet de **société
     savante / cercle d'histoire locale**. Ce n'est pas le même argumentaire : on ne vend pas
     « nous travaillons avec le secteur public », on vend « nous savons valoriser un fonds
     documentaire patrimonial ».
   - ⚠️ **À vérifier ailleurs dans la vitrine.** Le brief comptait « une administration communale »
     parmi les déploiements du widget embarquable (projet n° 1). Si cette mention venait d'Enghien,
     elle est fausse et doit sauter.
   - **✅ Formulation retenue par Laurent : « un cercle d'histoire locale ».** Le Cercle n'est donc
     **pas nommé** dans la fiche — la règle `e4ff57e` (aucun nom de client sans accord écrit) est
     respectée sans avoir à demander d'accord. Voir la contrainte de capture ci-dessous.
2. **✅ Les droits couvrent bien les huit ouvrages — confirmé par Laurent.** L'autorisation ne se
   limite pas à l'ouvrage de 1998 : les six ajouts, dont celui de 2007, sont couverts. La question 6c
   de l'audit est close.
   → Une seule précaution, et elle est de forme : **cette autorisation doit exister par écrit et
   être rangée avec les autres pièces du projet.** La fiche s'appuiera publiquement dessus, et
   c'est précisément l'argument qu'on met en avant — « un fonds sous droits exploité avec l'accord
   des ayants droit ». Une preuve orale ne tient pas ce rôle.

### Ce que « un cercle d'histoire locale » impose à la capture

L'anonymisation n'est pas seulement une affaire de texte : **elle contraint l'image**, et c'est
d'autant plus vrai ici que la fiche n'aura qu'une image.

1. **Recadrer pour exclure le pied de page.** La mention « Cercle Royal Archéologique d'Enghien »
   est affichée en bas de l'écran. Le cadrage naturel — en-tête, écran « Bienvenue », suggestions
   de questions, champ de saisie — l'exclut déjà. À vérifier sur le fichier final, pas à l'œil.
2. **Décider du sort du mot « Enghien ».** Il reste très visible : titre, sous-titre, et jusque
   dans les suggestions (*« les seigneurs d'Enghien au Moyen Âge »*). L'anonymisation est donc
   **partielle par construction** : elle ne nomme pas le partenaire, mais elle laisse identifier la
   ville, et de là le cercle, en une recherche. Deux lectures possibles, à trancher en Phase 1 :
   - *acceptable* — la règle protège du fait de **citer un client comme référence commerciale**,
     pas de montrer une réalisation reconnaissable ; c'est l'usage courant des portfolios ;
   - *insuffisant* — dans ce cas il faut soit demander l'accord du Cercle (le plus simple), soit
     fabriquer une capture sur un corpus de démonstration, ce qui vide l'image de sa substance.

> ⚠️ **Cela renverse ma proposition de lien sortant du §E.** J'avais recommandé un lien vers
> `enghien.srv767464.hstgr.cloud` parce que le prospect peut l'essayer. Mais un lien depuis une
> fiche anonymisée mène en un clic au nom qu'on vient de retirer — l'anonymisation devient
> décorative. **Nouvelle recommandation : pas de lien sortant pour Enghien non plus**, sauf si le
> Cercle donne son accord pour être nommé, auquel cas le lien redevient un atout.

---

## B. brasspat — réponse à la question 16, et correction du §4.10

### Le code est là

`C:\Users\laure\OneDrive\Documents\Claude code\BrassPat04-2026`. Il n'est sur aucun dépôt GitHub
parce qu'il **n'est pas un dépôt** : son `origin` est hérité du monorepo parent
(`the-event-linkedin`), et son propre `CLAUDE.md` l'écrit noir sur blanc — « Pas un repo git ».
Déploiement par `scp` + rebuild Docker vers `/docker/brasspat042026/` sur le VPS.

### Ce que fait réellement l'application

Rien à voir avec le fork React décrit au §4.10. C'est une **application Flask (Python 3.12,
Gunicorn)** qui :

1. reçoit par glisser-déposer les **PDF scannés** des rapports de caisse du jour (Z journalier + CA Net) ;
2. les convertit en images 300 DPI (PyMuPDF) et les fait **lire par Claude Opus** en OCR
   (`anthropic/claude-opus-4.5` via OpenRouter, repli sur l'API Anthropic directe) ;
3. écrit les montants extraits dans **trois classeurs Excel** (`Outil CC.xlsx`, `Outil recette.xlsx`,
   `Outil caisse.xlsx`) via `openpyxl`, édités en place dans un volume monté ;
4. expose `/api/ocr`, `/api/submit`, `/api/summary`, `/api/check-date`, `/api/download/*`,
   `/healthz`, plus un script `scripts/clear_day.py` pour purger une journée.

Front HTML/CSS/JS vanilla, thème sombre, sans build. Double rideau d'authentification : basic auth
Flask (`APP_USER`/`APP_PASSWORD`) **et** basic auth Traefik.

Le prompt d'OCR (`app.py:495`) confirme l'ancrage client : « tickets de caisse thermiques scannés
d'une brasserie belge », avec une consigne explicite de ne pas s'arrêter au premier rapport parce
qu'« il y a souvent un rapport "LA PATINOIRE" » en bas de page.

### ⚠️ Correction structurante : les deux outils n'ont aucun rapport

Le §4.10 conclut « un socle éprouvé chez un premier restaurant, adapté au plan comptable du
suivant ». Le code ne le porte pas :

| | **BrassPat04-2026** | **reconciliation-caisse (Saint Kilda)** |
|---|---|---|
| Langage | Python 3.12 / Flask + Gunicorn | TypeScript / React 18 + Vite |
| Où tourne le traitement | **Serveur**, dans un conteneur Docker | **Navigateur**, aucun backend |
| Entrée | **PDF scannés** de tickets thermiques | **XLSX structurés** (`ReportZStats_1_*`, `CA_1_*`) |
| Lecture des chiffres | **OCR par LLM** (Claude Opus, 300 DPI) | Lecture directe des cellules (`exceljs`) |
| Sortie | 3 classeurs édités en place (`openpyxl`) | 1 classeur régénéré, édition XML ciblée dans le ZIP |
| Coût à l'usage | Appels LLM à chaque page | Zéro |
| Dépôt | aucun (disque local) | `laurent7850/reconciliation-caisse` |

**Zéro ligne partagée.** Ce sont deux réponses indépendantes au même problème métier, écrites sous
des contraintes d'entrée différentes : un client fournit du papier scanné, l'autre des exports
propres.

**Ce que ça change pour la fiche.** L'argument « redéployable chez le client suivant » tombe, et il
ne faut pas le remplacer par un contournement. Mais l'histoire vraie est meilleure que celle qu'on
allait raconter :

> *Deux restaurants, le même besoin, deux solutions volontairement différentes. Le premier n'a que
> des tickets thermiques scannés : on fait lire les PDF par un modèle de vision. Le second dispose
> d'exports numériques : inutile de payer un LLM ni d'envoyer sa comptabilité sur un serveur — tout
> se traite dans le navigateur, aucune donnée ne sort.*

C'est un argument de **conseil**, pas de produit : on choisit la technologie d'après la matière du
client au lieu de recaser la même brique deux fois. Pour une PME qui redoute qu'on lui vende un
outil générique, c'est plus convaincant que l'industrialisation qu'on allait revendiquer.

### ✅ Nommage — tranché par Laurent

> **Terme générique : « un restaurant ».** Aucun des trois noms qui cohabitent dans le projet
> (`brasspat042026` en domaine, « Saint Kilda » en titre de `CLAUDE.md`, « Maud » dans l'interface)
> n'apparaît dans la fiche. Au pluriel, « deux restaurants bruxellois ».

Cela **répond aussi à la question 15 de l'audit** (« les deux restaurants acceptent-ils d'être
nommés ? ») : non, on ne les nomme pas, donc il n'y a pas d'accord à demander.

**Et le doute sur « qui utilise quoi » est levé sans avoir à nommer personne.** L'arbitrage n° 5 en
tête de l'audit le dit déjà : projet d'origine chez le premier restaurant, redéployé en variante
chez le second. **Ce sont bien deux établissements distincts**, donc l'argumentaire « deux clients,
deux solutions » tient. Le faisceau technique va dans le même sens : domaine `brasspat042026`,
prompt OCR qui cherche un rapport « LA PATINOIRE ».

> 📝 Reste une **coquille dans le dépôt**, sans effet sur la vitrine mais qui rendra la relecture
> pénible : le `CLAUDE.md` de `BrassPat04-2026` est titré du nom du *second* restaurant. C'est ce
> titre qui m'avait fait douter. À corriger un jour, hors périmètre de cette mission.

### ✅ Le troisième projet — extraction de factures fournisseurs (question 24)

> **Décision de Laurent : il entre dans la grille, entièrement anonymisé.**

`Claude code\Brasserie de la patinoire` — script Python de **1 659 lignes** (`extract_invoices.py`,
dépendances `pdfplumber` + `openpyxl`). Il parcourt les factures PDF de tous les fournisseurs du
restaurant, en extrait les lignes produits, dédoublonne et consolide le tout dans un classeur Excel
mis en forme.

Ce qui en fait une bonne fiche, et pas un simple script :

- **25 parsers d'extraction distincts**, un par format de facture fournisseur, plus 5 fournisseurs
  repris depuis la feuille de commande — une trentaine d'onglets au total. C'est la démonstration
  concrète que « lire une facture » n'est pas un problème résolu : chaque fournisseur a sa mise en
  page, et deux formats coexistent parfois chez le même (Deconinck : ancien « #Facture BO » et
  nouveau « FVE »).
- **Dédoublonnage par code produit, la facture la plus récente l'emportant** — c'est ce qui
  transforme une pile de PDF en *tarif fournisseur à jour*, qui est le vrai livrable.
- **Détails métier réels** : TVA extraite des factures, 0 % en autoliquidation pour les
  fournisseurs NL/FR exportateurs, catégories déduites du préfixe de code produit, exclusion des
  copies SwissTransfer.
- **Limite honnête et intéressante** : les factures scannées sans texte extractable (Wijnatelier)
  ne passent pas. C'est exactement le point où l'autre projet du même client — l'OCR par LLM du
  §B — prend le relais. Les deux réalisations se répondent.

> ⚠️ **Contrainte de capture, plus sévère que l'anonymisation du client.** Le classeur produit
> contient les **prix unitaires d'achat** du restaurant et la **liste nominative de ses
> fournisseurs**. En publier une capture divulguerait ses conditions commerciales — c'est plus grave
> que de le nommer. **Aucune capture du vrai fichier ne peut être publiée.** Même règle pour le nom
> du fichier réel : il ne doit apparaître ni à l'écran, ni dans un nom d'image.

### ✅ Classeur de démonstration — livré

`scripts/demo/generate-demo-fournisseurs.py` reconstruit **la même mise en page** que la sortie
réelle — colonnes, en-têtes blancs sur `#2F5496`, bandeaux de catégorie `#D6E4F0`, format euro,
TVA en pourcentage, largeurs de colonnes — à partir de **données entièrement fictives** :
8 onglets, 39 lignes produit, fournisseurs inventés.

```bash
python scripts/demo/generate-demo-fournisseurs.py
```

Sortie : `scripts/demo/out/Fournisseurs-DEMO.xlsx` (répertoire ignoré par git — le classeur se
régénère, il n'a pas à être versionné).

Trois choix à connaître avant de capturer :

- **Le premier onglet est groupé par catégories** (FRAIS / SEC / CONGELÉ / ND), comme le plus gros
  fournisseur du fichier réel. C'est la variante la plus parlante à l'écran : elle montre d'un coup
  d'œil que l'outil ne se contente pas d'empiler des lignes.
- **Un onglet ne porte volontairement aucune ligne facturée** (« feuille de commande » uniquement,
  quantité 0). Le fichier réel en compte cinq. Le retirer rendrait la capture plus jolie et moins
  vraie.
- **La mention « données fictives » est dans les propriétés du fichier, pas dans une cellule** —
  vérifiable par qui ouvre le classeur, invisible sur l'image. Un filigrane « DEMO » en travers de
  la feuille aurait abîmé le seul visuel de la fiche.

---

## C. Paperclip, Baseline sécurité, Veille YouTube — réponse à la question 5

**Aucun des trois n'est dans `C:\Users\laure\.claude-worktrees\`.** Ce répertoire contient onze
projets, et pas ceux-là : `120 Min`, `Artpéro`, `Brasserie de la patinoire`, `David`, `Dreams`,
`Elevenlabs`, `FacturationAnim`, `Labo Nosta`, `Ville-enghien`, `Youtubeextract`, `n8n-workflows`.
Les trois sont ailleurs — deux sont exploitables, le troisième l'est à moitié.

### 1. Paperclip — trouvé, et hors des worktrees

`C:\Users\laure\OneDrive\Documents\Claude code\Paperclip` — dépôt git à part entière
(`2b0655b chore: initial commit (project extracted from monorepo)`).

Le `CLAUDE.md` **tranche la contradiction relevée au §10.5** : c'est bien **10 agents**, pas 13.
Ils sont nommés et cadrés — `dg`, `marketing`, `ventes`, `operations`, `financier`, `legal`, `dev`,
`rd`, `community`, `design` — chacun avec un profil sénior et un contexte belge/européen. Trois
commandes pilotent le comité : `/comite-de-direction [sujet]`, `/briefing [sujet]`, `/rapport`.
**Le `[À VALIDER]` du §10.5 peut être levé sur 10.**

Le dépôt contient aussi ce que l'audit cherchait ailleurs : `legal/` (DPA et SLA AInspiration v1.0
du 2026-04-04), `docs-audityo/`, un dossier `.agents/skills` et `skills-lock.json`.

**Et le projet a produit des décisions réelles.** Le `CLAUDE.md` porte la grille tarifaire « validée
Comité #2 » — audit IA gratuit 0 €, Pack Express lancement 1 043 € HTVA contre témoignage, Pack
Express standard 1 490 € HTVA, abonnement IA managé 290 €/mois — et les objectifs Q2 2026
(3 clients en abonnement, 5 000 € de CA cumulé, NPS > 8, 45 audits).

> ⚠️ **Ces chiffres sont la stratégie commerciale interne d'AInspiration.** Ils ne doivent
> apparaître **ni dans une fiche, ni dans une capture** du front
> `paperclip-zjyk.srv767464.hstgr.cloud`. Le risque est concret : l'interface d'un comité de
> direction affiche par construction des délibérations internes. Toute capture devra être cadrée,
> ou rejouée sur un sujet neutre.

**Fiche écrivable**, donc, contrairement à ce que conclut le §5 de l'audit — avec cette contrainte.

### 2. Baseline sécurité & RGPD — trouvée, mais ce n'est pas un projet

`C:\Users\laure\.claude\distraction-security-baseline.md` (18,5 Ko), doublée d'une version condensée
dans les préférences globales `~\.claude\CLAUDE.md`. Périmètre : secrets et accès, sécurité
applicative, n8n auto-hébergé, VPS, sécurité IA/LLM (injection de prompt, plafonds de coûts,
multi-tenant), RGPD, réponse à incident.

Le §10.5 avait raison sur le fond : **ça ne se capture pas comme une application**. C'est un
document de gouvernance appliqué à tous les projets du groupe. L'audit proposait un encart
transversal plutôt qu'une carte projet — **c'est le bon choix**, et il est maintenant documenté.
Un extrait mis en page (la table des matières, ou la section « Instructions à Claude ») suffirait
comme visuel.

### 3. Veille YouTube — dans les worktrees, mais invisible à `git`

`C:\Users\laure\.claude-worktrees\Youtubeextract\nifty-chaplygin`. La session cloud ne pouvait pas
la voir pour deux raisons cumulées : le disque local n'était pas monté, **et** les onze fichiers
utiles sont **non suivis par git** (`git status` : `??`), sur une branche dont le `README.md`
versionné dit encore « DJLyricsNosta ». Le vrai README n'existe que dans le diff de travail.

Ce qu'il y a réellement — trois générations successives du même workflow n8n :

| Fichier | Nom du workflow | Nœuds | Chaîne |
|---|---|---|---|
| `youtube-favorites-transcript-auto.json` | YouTube Favorites → Transcript (AUTO) | **26** | playlist YouTube → filtrage des nouvelles vidéos → transcription gratuite (`youtube-transcript.io`) → **repli STT ElevenLabs** via extraction audio Cobalt si pas de sous-titres → Google Sheets |
| `workflow-supadata.json` | … (Supadata) | 13 | même chaîne, transcription déléguée à Supadata |
| `workflow-multi-channels.json` | … (Supadata) | 16 | idem, mais **liste de chaînes pilotée depuis un Google Sheet** |

Plus huit variantes intermédiaires (`workflow-with-email`, `workflow-upload`, `workflow-clean`…).
Déclenchement horaire, déduplication contre le Sheet existant, nettoyage du texte.

**Fiche écrivable**, et l'angle est là : la version AUTO **dégrade proprement** — si la vidéo n'a
pas de sous-titres, elle télécharge l'audio et le fait transcrire. C'est exactement ce qui sépare
une démo d'un automate qui tourne toutes les heures sans surveillance.

> ⚠️ Ces JSON ne sont **commitès nulle part**. Un `git clean` dans ce worktree les détruit.
> À sauvegarder avant toute autre chose.

---

## D. Ce que l'addendum modifie dans le décompte du §5

- **Paperclip** passe de « sans matière » à **écrivable** (10 agents confirmés, front en ligne,
  décisions réelles) — sous réserve du cadrage des captures.
- **Veille YouTube** passe de « sans matière » à **écrivable** (3 workflows lisibles).
- **Baseline sécurité** reste sans front-end : **encart transversal**, comme prévu.
- **brasspat** devient écrivable sur source réelle, mais la fiche « réutilisation » doit être
  **réécrite** : ce n'est pas un produit redéployé, ce sont deux solutions distinctes.
- **Rampa** et **Enghien** passent en **format réduit** : une image, une explication, pas de page
  détail. Les deux sites sont publics, les deux images sont capturables tout de suite.

**Reste bloquant : plus grand-chose.** Voir le tableau récapitulatif du §I — seules les questions
9, 12 et 27 restent ouvertes. Les questions 3, 4, 10, 11, 18, 19 et 20 sont traitées aux §G et §H.
**Questions 6 et 15 : closes** — la 6 par le format réduit, le partenaire tranché et les droits
confirmés (§A bis) ; la 15 par l'anonymisation en « un restaurant » (§B).

## E. Conséquence d'architecture du format réduit

Le brief impose une page détail `/realisations/[slug]` pour chaque projet (§5.3). Deux fiches n'en
auront pas. **Il faut une règle, pas une exception bricolée :** une carte en format réduit reste
dans la grille et dans les filtres, avec son image et son paragraphe, mais **sans lien
« Voir le détail » ni carte cliquable**. Un lien mort ou une page détail à trois lignes se
remarquerait immédiatement et abîmerait la crédibilité de toute la section.

Ces deux cartes pointent-elles malgré tout vers le site en ligne
(`enghien.srv767464.hstgr.cloud`, `rampa.srv767464.hstgr.cloud`) ? **Recommandation : aucun lien
sortant, ni pour l'une ni pour l'autre.**

- **Rampa** : envoyer du trafic commercial vers un site fermé, sur un corpus sous droits, va contre
  la décision de format réduit.
- **Enghien** : depuis que la fiche dit « un cercle d'histoire locale », un lien mènerait en un clic
  au nom qu'on vient de retirer. L'anonymisation deviendrait décorative (§A bis).

Si le Cercle donne un jour son accord pour être nommé, le lien Enghien redevient un atout — c'est
le seul cas qui justifie de revenir sur ce point.

## F. Questions nouvelles

22. ~~**Rampa entre-t-il dans la vitrine ?**~~ **Réglé : oui, en format réduit** — une image et
    l'explication. Reste un point de finition : les accents manquants de l'interface sont visibles
    sur la capture, à corriger avant de la prendre (§A).
23. ~~**Sous quel nom parler de `BrassPat04-2026` ?**~~ **Réglé : « un restaurant »**, terme
    générique, aucun nom d'établissement n'apparaît nulle part dans la vitrine. Ce qui règle aussi
    la **question 15 de l'audit**. Le doute sur « qui utilise quoi » est levé par l'arbitrage n° 5
    en tête de l'audit : deux établissements distincts, l'argumentaire tient (§B).
24. ~~**L'extraction de factures fournisseurs entre-t-elle dans la grille ?**~~ **Réglé : oui,
    entièrement anonymisée.** Devient la quinzième réalisation. Le classeur de démonstration
    demandé est **livré** : `scripts/demo/generate-demo-fournisseurs.py` (§B).
25. ~~**Enghien : qui citer, et les droits couvrent-ils les huit ouvrages ?**~~ **Réglé par
    Laurent** : (a) le partenaire à citer est le **Cercle Royal Archéologique d'Enghien**, pas la
    Ville — les questions 6b de l'audit tombent ; (b) **les huit ouvrages sont couverts** par
    l'autorisation — la question 6c tombe. **La question 6 de l'audit est donc entièrement close.**
26. ~~**Le Cercle accepte-t-il d'être nommé ?**~~ **Réglé : on ne le nomme pas.** La fiche dira
    **« un cercle d'histoire locale »**, formulation retenue par Laurent. Il n'y a donc pas d'accord
    à demander — mais deux contraintes en découlent, traitées au §A bis : la capture doit exclure le
    pied de page, et la carte ne porte **aucun lien sortant** (§E).

**Toutes les questions de ce périmètre sont tranchées.** Règle générale à retenir pour la
Phase 1 : **aucun nom d'établissement n'apparaît dans la vitrine**, ni en texte, ni sur une capture,
ni dans un nom de fichier image.

---

## G. Audityo — angle réécrit (question 3)

**Arbitrage de Laurent : adapter l'angle, la date est passée.** Le brief vendait « avant l'échéance
d'août 2026 » ; le 2 août 2026 est derrière nous. Garder cette formulation ferait daté, et — plus
grave sur une vitrine qui vend de la rigueur — ferait douter de tout le reste.

### L'angle

| | |
|---|---|
| **Mort** | « Anticipez l'échéance d'août 2026 » — une promesse au futur, périmée. |
| **Retenu** | **« Le règlement s'applique. Où en êtes-vous ? »** — un constat au présent. |

Le changement n'affaiblit pas l'argument, il le renforce : l'urgence n'est plus hypothétique.
Tant que l'échéance était devant, ne rien faire était un choix défendable. Maintenant, ne rien
faire est une situation subie. **La question n'est plus « quand », c'est « depuis quand ».**

### Trois conséquences de rédaction

1. **Le premier livrable devient un état des lieux, pas un plan de préparation.** Avant de se
   mettre en règle, une PME doit savoir **ce qu'elle utilise** — le chatbot de son site, l'outil de
   tri de CV, le scoring client, l'assistant commercial que quelqu'un a branché seul. La plupart ne
   le savent pas. C'est le vrai point d'entrée, et c'est celui qui fait comprendre le produit en une
   phrase.
2. **Ne rien dater.** Aucune formulation qui vieillit : ni « dans quelques mois », ni « d'ici
   l'été », ni « la nouvelle réglementation ». Le texte doit rester exact dans un an sans
   relecture. C'est exactement la faute qui a tué l'angle précédent.
3. **Rester un produit du groupe.** Consigne inchangée du brief : Audityo n'est pas une réalisation
   *cliente*. La fiche parle de « nos produits ».

### Deux garde-fous, et ils ne sont pas décoratifs

> ⚠️ **Ne pas promettre la conformité.** Un outil aide à classifier des systèmes et à produire un
> dossier documentaire ; il ne rend personne conforme, et le dire serait une affirmation juridique
> qu'on ne peut pas tenir. Formuler en **capacité** (« classer vos systèmes, produire et tenir à
> jour votre dossier »), jamais en **résultat garanti** (« soyez conforme »).
>
> ⚠️ **Aucun chiffre légal non sourcé.** Ni montant d'amende, ni pourcentage de chiffre d'affaires,
> ni date d'application autre que celles qu'on peut citer d'un texte officiel. La règle
> `no-fabricated-proof` s'applique au droit comme au reste, et la baseline Distr'Action interdit
> d'inventer une conformité. En cas de doute : renvoyer vers un juriste, ne pas trancher dans la
> fiche.

### Éléments de fiche

- **Titre** : Audityo — conformité au règlement européen sur l'IA
- **Phrase de résultat** (≤ 12 mots) : *« Classer ses systèmes d'IA et produire son dossier de
  conformité. »*
- **Stack à corriger** (§4.3) : Next.js 16, **Prisma v6 + PostgreSQL 16, Auth.js v5**, Stripe,
  Claude pour la classification et la génération documentaire, Puppeteer pour les PDF, Docker +
  Traefik. **Ni Supabase, ni Clerk** — le brief se trompait.
- **Isolation multi-tenant** : confirmée dans `ARCHITECTURE.md`, elle peut être mise en avant.

**Question 3 close.**

---

## H. Les dernières questions, tranchées et vérifiées

### Question 4 — l'accès n8n est ouvert ✅

Vérifié depuis cette session : **les 37 workflows de l'instance VPS sont lisibles**, structure et
paramètres compris. La réserve du §10.2 de l'audit (« le contenu reste illisible pour 34 d'entre
eux ») est **caduque**.

Ce que ça débloque immédiatement, sans rien demander de plus :

- **Projet n° 6 — Spotify** (`lwTH2RIV2QmyTlLX`, 12 nœuds). Deux détails que seul le workflow
  révèle, et qui valent mieux que la paraphrase du brief : un nœud **« Contrôle d'accès »** placé
  avant l'appel au modèle — un webhook public sans garde-fou serait une facture ouverte — et une
  **branche de rattrapage** (« Repérer manquants » → « Recherche (titre seul) ») pour les morceaux
  que la première recherche Spotify ne trouve pas. C'est exactement l'enseignement que le brief
  mentionnait de mémoire ; il est maintenant vérifiable dans le code.
- **Projet n° 11 — Préparation d'émission** (`bWQJiJlSMXQeMyyE`, 16 nœuds).
- Les trois workflows du Labo Nostalgie (`8N7Vb3R8mrBK6DLl`, `Mrvg6cCeYZEcpv1y`,
  `RYWMDjWiSoK8C72O`).

**Les deux fiches « en attente d'accès MCP » du §5 de l'audit sont donc écrivables.**

### Questions 18 et 19 — il n'y a pas de seconde instance, et pas de chatbot client ✅

**18 — tranché par Laurent : tout est sur le VPS.** Il n'existe pas de seconde instance
`distr-action.app.n8n.cloud`. Les 37 workflows inventoriés sont la totalité.

**19 — j'ai listé moi-même, et le résultat est net : aucun chatbot client n'existe.**
Sur les 37 workflows, **deux seulement** sont des chats, et les deux sont maison :

| Workflow | ID | Pour qui |
|---|---|---|
| `chat Ainspiration - TEXT ONLY` | `oz9stSLsjRtRFA8F` | le site AInspiration |
| `chat distr'action V4` | `ZroPJAjhPmWkj2sI` | le site Distr'Action |

Aucun workflow pour une brasserie, un lieu événementiel culturel, une administration communale ou
une activité de services. Le chat AInspiration est mono-site : webhook → code → agent LangChain
avec mémoire tampon et modèle OpenRouter → réponse. **Aucun routage par client, aucune notion de
tenant.**

> ⚠️ **La conclusion à retenir.** L'affirmation du brief — « déjà déployé chez plusieurs clients » —
> n'a de support **nulle part** : ni sur GitHub (27 dépôts fouillés), ni dans les 37 workflows du
> VPS, ni dans une seconde instance, puisqu'elle n'existe pas. **L'arbitrage n° 3 de Laurent était
> le bon**, et il est maintenant démontré plutôt que supposé : le projet n° 1 est le chat IA du
> site en démo vivante. Écrire autre chose serait exactement la preuve fabriquée que la purge
> `e4ff57e` a éliminée.

**Questions 18 et 19 closes.**

### Questions 11 et 12 — TL Services

**11 — le nom peut être affiché.** ✅ Tranché par Laurent. La fiche dira « TL Services ».
Le contraste avec les restaurants est assumé et cohérent : le site TL Services *est* la
réalisation, il porte publiquement la marque ; les fichiers comptables d'un restaurant, non.

> 📝 Une trace écrite de cet accord doit exister quelque part. La règle `e4ff57e` demande un accord
> écrit, et c'est la seule fiche de la vitrine qui nommera un client.

**12 — les chiffres.** Laurent demande d'estimer. Deux des trois n'ont pas besoin de l'être :

| Donnée | Valeur | Source |
|---|---|---|
| Durée du projet | **4 jours** (24 → 27 avril 2026) | historique git de `laurent7850/tlservices`, 12 commits |
| Mise en ligne | **fin avril 2026** | dernier commit de mise en production, `2026-04-27` |
| Résultat constaté | **—** | *aucune source* |

> ⚠️ **Le troisième ne s'estime pas.** « Demandes reçues via le formulaire » ou « position sur une
> requête locale » sont des **faits mesurés**, pas des ordres de grandeur : les inventer serait
> précisément la preuve fabriquée qu'on s'interdit, et c'est le genre de chiffre qu'un prospect
> peut demander à vérifier. Deux issues propres :
> 1. **Relever la vraie valeur** — nombre de messages reçus depuis avril, ou position actuelle sur
>    une requête « métier + commune ». Quelques minutes, et la fiche devient la meilleure de la
>    grille.
> 2. **Assumer une fiche sans bloc résultats**, qui décrit ce qui a été livré : vitrine Next.js,
>    pages légales, SEO et images Open Graph générées, formulaire relié au SMTP, bouton d'action
>    mobile — le tout en quatre jours. « Livré en quatre jours » est déjà un résultat, et il est
>    vrai.
>
> Ma recommandation : l'option 1 si tu peux, l'option 2 sinon. Jamais un chiffre estimé présenté
> comme constaté.

### Question 10 — méthode ✅

- **(a)** Commits `feat(realisations):` / `docs(realisations):` avec sujet en français : **validé**.
  C'est déjà la convention appliquée aux commits de cette branche.
- **(b)** **L'Artpéro peut être nommé.** Deuxième client nommé de la vitrine, avec TL Services.

### Question 20 — AutoSEO entre dans la grille ✅

**Tranché : oui.** AutoSEO / SEOPilot devient une réalisation à part entière, et c'est l'une des
mieux documentées de toute la vitrine — l'instance n8n en porte la preuve vivante :

| Workflow | ID |
|---|---|
| SEOPilot — Automation Hub | `F7YwQHfPDe5yEaPE` |
| AInspiration — Publish from AutoSEO | `QHf6k01TLsUw3Bww` |
| Distr-Action — Publish from AutoSEO | `D6fBNktUS3U0F55G` |
| Audityo — Publish from AutoSEO | `Qf1PGBfHa45NZFtL` |

**Un hub, trois marques branchées dessus, tous actifs.** C'est la démonstration d'industrialisation
que le brief cherchait au projet n° 1 et qu'il n'y a pas trouvée — ici elle est réelle, vérifiable,
et elle se raconte en une phrase : *un moteur de publication, branché sur trois sites différents.*
Front déployé sur `seopilot.srv767464.hstgr.cloud`.

> ❓ **Restent sans réponse : VoxStudio et Minutage NRJ+** (les deux autres projets du §4.13).
> Le premier compte : **VoxStudio donnerait enfin une preuve à la page `/audio`, qui n'en a
> aucune.** → question 27.

---

## I. État des questions

**Toutes closes**, sauf :

| # | Question | Ce qu'il manque |
|---|---|---|
| 9 | Chiffres de résultat par projet | Durées, années, gains — même approximatifs. Sans eux, chaque fiche part avec des `[À VALIDER]` visibles. TL Services est déjà servi (§H). |
| 12 | TL Services : résultat constaté | Une valeur relevée, ou une fiche sans bloc résultats (§H). |
| 27 | **VoxStudio et Minutage NRJ+ entrent-ils dans la grille ?** | Arbitrage. VoxStudio donnerait une preuve à `/audio`. |
