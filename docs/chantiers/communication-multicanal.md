# Chantier — la communication multicanaux : un outil par métier

**Cadré en session Claude Code AInspiration le 22/09/2026, à la demande de Laurent.**

> Ce fichier porte une décision **transverse au portefeuille**. Une partie s'exécute ici
> (retirer le module LinkedIn du CRM) ; le reste est de la **consigne prête à coller** pour
> des sessions ouvertes sur d'autres dépôts. Rien de ce qui concerne CommunityOS, AutoSEO ou
> The-event LinkedIn ne doit être exécuté depuis une session AInspiration — voir la règle
> « une session par dépôt » du `CLAUDE.md` global.
>
> L'audit ci-dessous a été fait **en lecture seule** sur les dépôts voisins. Aucun fichier
> n'y a été écrit, aucun commit n'y a été fait.

---

## 1. Le constat

Quatre outils se disputent le métier « publier sur les réseaux », trois se disputent
« publier des articles ».

| Métier | Ce qui existe | État vérifié |
|---|---|---|
| Réseaux sociaux | **CommunityOS** · module LinkedIn du **CRM AInspiration** · **The-event LinkedIn** · **DreamOracle RS** | 4 outils, un seul multi-marques |
| Blog / SEO | **AutoSEO** (mots-clés, audit, génération, worker `publish`) · 3 auto-blogs n8n · 3 workflows « Publish from AutoSEO » | doublon assumé, d'où la table `publications` anti-redondance |
| Prospects | **CRM AInspiration** | cohérent, transverse, à ne pas toucher |
| Email | Newsletter AInspiration (désactivée) · formulaires SMTP | cohérent |

## 2. Les faits qui fondent la décision

**Le module LinkedIn du CRM AInspiration n'a jamais servi.**
`SELECT status, COUNT(*) FROM linkedin_posts` rend **0 ligne**. Pour 1 263 lignes de code
(`LinkedinPage.tsx`, `linkedinService.ts`, `linkedinContent.ts`, `routes/linkedin.js`,
`linkedin.js`), 12 endpoints, un OAuth complet, une page et une entrée de menu. Coût
d'abandon : nul. Coût de conservation : un `client_secret` à maintenir et une route de
callback OAuth publique, pour du code mort.

**CommunityOS publie réellement — le README se trompe sur ce point.**
Il annonce « No real social platform is contacted by this build ». Or
`packages/connectors/src/linkedin/linkedin-connector.ts` appelle
`https://api.linkedin.com/rest/posts`. Ce qui n'est pas activé, c'est le **déploiement**
(`ENABLED_CONNECTORS`), pas la capacité. La distinction est explicite dans `registry.ts` :
« which connectors exist is a build-time fact; which are *enabled* is a deployment fact ».
**Ne pas conclure de ce README que l'outil est vide.**

**Le mur n'est pas dans les outils, il est chez LinkedIn.**
Les trois outils publient `urn:li:person:` — le profil personnel. Publier au nom d'une
**page entreprise** exige le scope `w_organization_social` et l'accès à la **Community
Management API**, soumis à revue LinkedIn. `docs/known-limitations.md` de CommunityOS le
dit noir sur blanc. **Changer d'outil ne débloquera donc rien** : seule une demande auprès
de LinkedIn le fait.

**Le jeton LinkedIn ne se rafraîchit pas.**
Reconnexion manuelle tous les ~60 jours, **par intégration**. Une alerte mensuelle n8n
existe déjà (`Az61ccEr4thknYLq`). Trois intégrations valent trois rituels à ne pas rater ;
l'incident du 15/09 a montré ce que coûte un seul raté — dix-huit jours de silence. C'est
l'argument de fiabilité le plus solide pour n'avoir **qu'un seul** point d'authentification
LinkedIn.

## 3. Le point qui doit passer avant le choix des outils

Mesure du 16/09/2026 : **93 articles publiés, 18 mots-clés positionnés, 41 impressions,
1 clic.** Les termes commerciaux qui sortent en page 1-2 (« audit IA PME », « audit IA
gratuit ») sont portés par les **pages de service**, pas par les articles.

Une fenêtre de décision est déjà posée, et datée : **fin novembre 2026 — 500 impressions et
15 clics sur 28 jours**, sinon changer de format ou arrêter.

**Conséquence :** rationaliser les outils sans trancher cette question rendrait seulement
plus efficace une machine dont rien ne prouve encore qu'elle amène un client. La décision
de fin novembre tient ; ne pas l'avancer, ne pas l'ignorer, ne pas déplacer la barre après
coup.

## 4. La cible : un outil par métier

- **Réseaux sociaux → CommunityOS, seul.** Seul outil multi-tenant, avec approbation par un
  second humain, planification et worker de dispatch. AInspiration, Distr'Action,
  DreamOracle, The Event deviennent des *tenants* — c'est son modèle natif.
- **Blog et SEO → AutoSEO, seul.** Seul à faire recherche de mots-clés et audit technique.
- **Prospects → CRM AInspiration.** Inchangé.
- **n8n → colle, jamais moteur.** Déclencher, relayer, alerter. Ni générer, ni publier.
  C'est la confusion sur ce point qui a fabriqué les doublons.

## 5. L'ordre d'exécution

L'ordre compte plus que le choix. **Ne rien démonter avant que le remplaçant ait prouvé.**

1. **Demander l'accès Community Management à LinkedIn.** Délai externe, donc à lancer en
   premier. Rien d'autre ne débloque les pages entreprise. — *Laurent*
2. **Activer le connecteur LinkedIn de CommunityOS sur un compte réel** et obtenir **une**
   publication réelle. Tant qu'elle n'existe pas, tout le reste est théorique.
   — *session CommunityOS*
3. **Attendre fin novembre** pour le sort des auto-blogs n8n face à AutoSEO.
4. **Retirer le module LinkedIn du CRM AInspiration.** Seule étape sans risque, et la seule
   qui s'exécute depuis ce dépôt. — *session AInspiration*

---

## Consigne à coller — session CommunityOS

> Dépôt : `C:\Users\laure\OneDrive\Documents\Claude code\CommunityOS`
>
> Décision cadrée le 22/09/2026 : **CommunityOS devient le seul outil de publication
> sociale du portefeuille Distr'Action** (AInspiration, Distr'Action, DreamOracle,
> The Event comme tenants).
>
> Objectif de la session : **obtenir une publication LinkedIn réelle, une seule**, depuis un
> compte réel, et documenter honnêtement ce qui a marché.
>
> À savoir avant de commencer :
>
> - Le `README.md` affirme qu'aucune plateforme réelle n'est contactée. **C'est faux au
>   niveau du code** : `packages/connectors/src/linkedin/linkedin-connector.ts` appelle
>   `https://api.linkedin.com/rest/posts`. Ce qui manque est l'activation via
>   `ENABLED_CONNECTORS`, croisée avec le drapeau par tenant. Corriger cette phrase du
>   README fait partie du travail — elle induit en erreur.
> - **Les pages entreprise sont hors de portée** tant que LinkedIn n'a pas accordé la
>   Community Management API. Le connecteur publie `urn:li:person:`. Ne pas chercher à
>   contourner : constater et documenter.
> - Le jeton n'est pas rafraîchissable : reconnexion tous les ~60 jours, alerte une semaine
>   avant. Vérifier que ce rappel existe réellement, et pas seulement dans le modèle.
> - Secrets : rien en clair. `ENCRYPTION_KEY_V1` et la clé OpenRouter par variable
>   d'environnement, conformément à la baseline Distr'Action.
>
> Ne rien écrire dans les autres dépôts. Écrire la note de journal dans celui-ci.

## Consigne à coller — session AutoSEO

> Dépôt : `C:\Users\laure\OneDrive\Documents\Claude code\Autoseo`
>
> Question cadrée le 22/09/2026, **à instruire, pas à trancher avant fin novembre** :
> AutoSEO et les trois auto-blogs n8n (`t8SuGsq3sOPuDfdV` AInspiration,
> `QSzmS1gzyQjvCwtc` Distr-Action, `ubId7H85iO5s6T2W` Audityo) produisent le même type de
> contenu pour les mêmes sites. La table `publications` a été créée précisément pour les
> empêcher de reboucler sur les mêmes sujets — c'est un symptôme, pas une solution.
>
> Objectif : **établir, chiffres à l'appui, lequel des deux produit du trafic.** La base
> SEOPilot a Search Console et GA4 connectés pour `ainspiration.eu`
> (site `cmmci6qe70008yktie4k880i5`). Attribuer les impressions et les clics à leur
> producteur réel.
>
> Repère de cadrage : au 16/09/2026, 93 articles ont donné 18 mots-clés positionnés, 41
> impressions et 1 clic. Le blog n'est indexable que depuis le 13/08/2026 — toute donnée
> antérieure ne vaut rien.
>
> Ne rien arrêter dans cette session : produire la mesure qui permettra à Laurent de décider
> fin novembre.
