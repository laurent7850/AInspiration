# Cloisonner OpenRouter — une clé par projet (C20)

> Préparé le 24/09/2026. **Laurent crée les clés et colle les valeurs ; Claude ne touche
> jamais à un secret.** Le classificateur de Claude Code refuse d'ailleurs l'écriture dans le
> formulaire de création (*Secret-Store Writes*) — c'est la même règle, appliquée par l'outil.

## Pourquoi

`Maudios` est une **clé maîtresse portée par sept conteneurs**. Tant que c'est le cas :
aucune rotation possible sans tout casser d'un coup, et attribuer une dépense à un projet
demande une enquête. Baseline Distr'Action, *Secrets et accès* : **une clé = un usage = un
environnement.**

## État mesuré le 24/09/2026

| Clé | Conteneurs | Plafond |
|---|---|---|
| `Maudios` | `root-n8n-1`, `ainspiration-web`, `audityo-web`, `audityo-dev-web`, `communityos-web`, `theevent-web`, `brasspat042026` | 3 $/j |
| `Seo` | `seopilot-web`, `seopilot-worker`, `firecrawl-toolkit`, **+ le shell local de Laurent** | 2 $/j |
| `Oracle` | `rampa-web`, `dreamoracle` | 2 $/j |
| `re-enghien` | `enghien-web` | aucun |

Méthode : empreinte SHA-256 des valeurs, jamais la valeur. Les cases à cocher de la liste
OpenRouter portent exactement la même empreinte, ce qui permet d'apparier une clé à un
conteneur **sans jamais lire un secret**.

## Étape 1 — les sept clés (Laurent, dans la console OpenRouter)

**New Key** → Name → Expiration **No expiration** → Credit limit **Custom amount** + montant
→ **Reset limit every… = `Daily`** → **Create**.

| Name | Montant | Destination |
|---|---|---|
| `n8n-prod` | 3 | `root-n8n-1` |
| `ainspiration-prod` | 2 | `ainspiration-web` |
| `audityo-prod` | 2 | `audityo-web` |
| `audityo-dev` | 1 | `audityo-dev-web` ⚠️ voir plus bas |
| `communityos-staging` | 1 | `communityos-web` |
| `theevent-prod` | 1 | `theevent-web` |
| `brasspat-prod` | 1 | `brasspat042026` |

Exposition maximale : **11 $/jour**, contre une clé maîtresse aujourd'hui.

⚠️ **Le piège du plafond à vie.** Dès qu'un montant est choisi, le formulaire annonce :
*« Requests are rejected once this key has used $3 in total »*. `Reset limit every…` reste sur
`N/A` par défaut — laisser ce défaut pose un plafond **à vie**, qui tuera la clé le jour où
le cumul sera atteint. Après création, **vérifier que le badge de la liste affiche `TODAY`
et non `TOTAL`.**

`No expiration` est délibéré. Ce projet a perdu le blog pendant 18 jours sur un jeton
expiré (15/09) ; la décision prise alors est qu'une authentification machine ne porte pas
d'échéance à surveiller. Le garde-fou ici est le plafond journalier.

## Étape 2 — reporter chaque valeur (sans jamais la faire transiter)

Pour chaque clé, depuis un terminal local, **coller la valeur quand le shell la demande** —
elle ne passe ni par un argument de ligne de commande (visible dans `ps`), ni par
l'historique, ni par une conversation :

```bash
ssh -i ~/.ssh/vps767464_ed25519 root@193.203.191.251 \
  'printf "Colle la cle puis Entree : " >&2; read -rs K; K=$(printf %s "$K" | tr -d "\r\n\t "); if ! printf %s "$K" | grep -qE "^sk-or-v1-[0-9a-f]{64}$"; then echo; echo "REFUS : la valeur collee n a pas la forme sk-or-v1- + 64 caracteres hexa (${#K} car.)"; exit 1; fi; f=/docker/ainspiration/.env && sed -i "/^OPENROUTER_API_KEY=/d" "$f" && printf "OPENROUTER_API_KEY=%s\n" "$K" >> "$f" && chmod 600 "$f" && echo && echo ecrit'
```

**Le contrôle de forme est indispensable (08/10).** Les deux clés collées ce jour-là ont été
écrites avec **une lettre `n` en trop** à la fin (74 caractères au lieu de 73) — vraisemblablement
un `\n` collé avec la valeur, dont la barre oblique a été avalée. OpenRouter les refusait (401) ;
un redémarrage des conteneurs aurait coupé l'IA de Firecrawl et de Rampa. Trouvé avant le
redémarrage, en interrogeant `/api/v1/key` sur le fichier, et corrigé en tronquant à 73. **Toujours
vérifier la clé dans le fichier avant de recréer un conteneur.**

Remplacer `f=` par le fichier de la ligne :

| Clé | Fichier `.env` | Compose (répertoire · service) |
|---|---|---|
| `n8n-prod` | `/root/.env` | `/root` · `n8n` |
| `ainspiration-prod` | `/docker/ainspiration/.env` | `/docker/ainspiration` · `web` |
| `audityo-prod` | `/root/audityo/.env` | `/root/audityo` · `audityo-web` |
| `audityo-dev` | ⚠️ **à recréer** | `/root/audityo-dev` · `audityo-dev-web` |
| `communityos-staging` | `/docker/communityos/.env` | `/docker/communityos/src/docker` · `web` |
| `theevent-prod` | `/docker/the-event/.env` | `/docker/the-event` · `web` |
| `brasspat-prod` | `/docker/brasspat042026/.env` | `/docker/brasspat042026` · `app` |

Puis, répertoire par répertoire :

```bash
docker compose up -d --force-recreate <service>
```

Jamais `docker restart` — la variable ne serait pas relue.

## ⚠️ `audityo-dev` ne redémarrerait pas aujourd'hui (trouvé le 24/09)

Le point que la note du 17/09 laissait « à confirmer » est résolu, et c'est pire que prévu :

- le compose de `/root/audityo-dev` déclare `env_file: .env` pour le service web ;
- **ce fichier n'existe pas.** `docker compose config` échoue sur
  `env file /root/audityo-dev/.env not found` ;
- le conteneur tourne quand même, parce qu'il a été créé à une époque où le fichier
  existait. **Il ne survivra pas au prochain `up`, ni à un reboot avec recreate.**

C'est la même classe de panne que C2 : **une défaillance différée**, qui ne se manifestera
qu'au moment où l'on croira faire une opération anodine. La clé réelle vit aujourd'hui dans
`/root/audityo-dev/.env.dev` (c'est `Maudios`).

À trancher avant de cloisonner ce projet : recréer `.env`, ou pointer `env_file` sur
`.env.dev`. **Décision qui appartient à une session Audityo**, pas à celle-ci.

Vérifié au passage, et rassurant : `/root/audityo-dev/.env.example` est en 644 mais ne
contient qu'un gabarit de **12 caractères** — pas une vraie clé. Le fichier ne fuit rien.

## ⚠️ Vérifier la périodicité, et ne pas se fier au formulaire (24/09)

Les sept clés ont été créées avec leur montant **mais sans périodicité** : `Reset limit` est
resté sur `N/A`, donc **plafonds à vie**. `n8n-prod` aurait cessé de fonctionner pour toujours
après 3 $ cumulés.

Le réglage s'édite sur une clé existante, sans rien recréer : ligne → **⋮ → Edit** →
*Reset limit* → **Daily** → **le ✓ vert à droite du champ**. Sans ce ✓, rien n'est enregistré.

**Le contrôle qui ne ment pas**, et qui ne demande pas de lire la valeur :

```bash
k=$(grep -m1 '^OPENROUTER_API_KEY=' /chemin/vers/.env | cut -d= -f2-)
curl -s -H "Authorization: Bearer $k" https://openrouter.ai/api/v1/key
```

- `"limit_reset": "daily"` → plafond journalier, c'est ce qu'on veut ;
- `"limit_reset": null` → **plafond à vie**, à corriger ;
- HTTP 401 → la clé est morte (supprimée ou révoquée).

Étalonner sur une clé dont on connaît déjà la réponse avant de conclure — c'est ce qui a évité
une fausse alerte.

## Étape 3 — ne révoquer qu'après la preuve

**État au 25/09/2026 : les sept projets sont cloisonnés, `Maudios` ne porte plus aucun
conteneur.** Relevé de référence pris à midi — 0,00 $ le jour même, 0,29 $ sur la semaine
(trafic antérieur).

Ne pas supprimer avant **le 27/09**, et seulement si `usage_daily` reste à zéro :

```bash
curl -s -H "Authorization: Bearer <Maudios>" https://openrouter.ai/api/v1/key
```

Le compteur à zéro le jour même ne prouve rien — il prouve qu'on vient de débrancher. Un cron
hebdomadaire, un workflow n8n rarement déclenché ou un script oublié ne se manifestent pas
dans l'heure.

Même prudence ensuite pour `Seo` (3 conteneurs **et** le shell local de Laurent : tout test
local en hérite) et `Oracle` (2 conteneurs).

## Étape 4 — la seconde clé maîtresse : la credential n8n (C31)

`distraction2026` n'était dans l'environnement d'aucun conteneur **parce qu'elle n'y est
pas** : c'est la credential n8n `gtjfsOGk7WrWy7p3` (« OpenRouter account »), stockée chiffrée
dans la base de n8n. Une cartographie par `printenv` ne pouvait pas la voir.

**12 nœuds, 9 workflows, 4 projets** la partagent. Tous portent la même clé de credential
(`openRouterApi`), les nœuds HTTP via `authentication: predefinedCredentialType` — le
repointage est donc uniforme.

| Projet | Workflow (id) | Nœud | Actif |
|---|---|---|---|
| Radio | `120 min 2026` (`bWQJiJlSMXQeMyyE`) | `OpenRouter Chat Model` | oui |
| Radio | `120 min 2026` (`bWQJiJlSMXQeMyyE`) | `OpenRouter Chat Model1` | oui |
| Radio | `Génération Playlist — CLASSIQUE` (`8N7Vb3R8mrBK6DLl`) | `5. OpenRouter Claude` | oui |
| Radio | `Génération Playlist — CLASSIQUE` (`8N7Vb3R8mrBK6DLl`) | `6b. Corriger Playlist` | oui |
| Radio | `Générateur playlist Spotify` (`lwTH2RIV2QmyTlLX`) | `Générer tracklist (Claude)` | oui |
| Radio | `Génération Playlist — ÉTÉ` (`Mrvg6cCeYZEcpv1y`) | `5. OpenRouter Claude` | non |
| Radio | `AUDIT Langue FR-INT` (`RYWMDjWiSoK8C72O`) | `3. Classer les artistes (Claude)` | non |
| AInspiration | `Audit IA Pipeline` (`C8SIVfn0ELbrXDzy`) | `OpenRouter` | oui |
| AInspiration | `chat Ainspiration - TEXT ONLY` (`oz9stSLsjRtRFA8F`) | `OpenRouter Chat Model1` | oui |
| AInspiration | `Newsletter Automation` (`36K717g1IpDdihEQ`) | `Générer Contenu (OpenRouter)` | non |
| AInspiration | `Newsletter Automation` (`36K717g1IpDdihEQ`) | `Générer Contenu Manuel (OpenRouter)` | non |
| Distr'Action | `chat distr'action V4` (`ZroPJAjhPmWkj2sI`) | `OpenRouter Chat Model` | oui |

### Ce que Laurent fait

**1. Trois clés dans OpenRouter** — même formulaire que l'étape 1, et **`Reset limit` = `Daily`
avec le ✓ vert**.

| Name | Montant |
|---|---|
| `n8n-radio` | 1 |
| `n8n-ainspiration` | 1 |
| `n8n-distraction` | 1 |

*Pourquoi 1 $ chacune et non un partage des 2 $ actuels.* La dépense réelle est de **0,14 $ par
jour toutes confondues** : 1 $ par projet laisse sept fois la marge observée. Et deux de ces
workflows sont des **chatbots publics** — une enveloppe trop juste ne protège rien, elle coupe
le chatbot en milieu de journée. L'exposition théorique passe de 2 à 3 $/jour ; le bénéfice est
qu'une dérive se voit enfin sur le projet qui la cause.

**2. Trois credentials dans n8n** — menu de gauche → **Credentials** → **Add credential** →
chercher `OpenRouter` → type **OpenRouter API**.

| Champ | Valeur |
|---|---|
| **API Key** | la valeur de la clé, collée. Seul champ obligatoire du schéma. |
| **Nom de la credential** | en haut à gauche, cliquer sur le titre pour l'éditer |
| **Allowed HTTP Request Domains** | **ne pas y toucher**, laisser ce que n8n propose |

| Clé OpenRouter | Nom de la credential n8n |
|---|---|
| `n8n-radio` | `OpenRouter-Radio-Prod` |
| `n8n-ainspiration` | `OpenRouter-AInspiration-Prod` |
| `n8n-distraction` | `OpenRouter-DistrAction-Prod` |

Nommage scopé sans accent ni tiret cadratin, conforme à la baseline *Secrets et accès*
(`Stripe-Audityo-Prod`) et sans piège de saisie.

⚠️ **Le troisième champ n'est pas cosmétique.** Sept des douze nœuds sont des `HTTP Request`
qui consomment la credential en `predefinedCredentialType` : si `allowedHttpRequestDomains`
est posé à `none`, ces sept-là cessent de fonctionner. La credential actuelle ne porte **que**
`apiKey` — le champ est absent, donc le défaut de n8n s'applique, et les sept nœuds marchent.
Reproduire ce comportement en ne touchant à rien. Vérification faite ensuite par export des
champs **non secrets** des trois nouvelles, comparés à l'actuelle.

**Ne pas supprimer `OpenRouter account`** : les douze nœuds pointent encore dessus.

### Ce que Claude fait ensuite

Repointage par `updateNode` (forme validée : `credentials.openRouterApi = {id, name}`), puis
contrôle que la **version publiée** de chaque workflow actif porte bien la nouvelle credential
— n8n 2.x distingue brouillon et publié, et un repointage qui ne serait resté qu'au brouillon
ne changerait rien en production.

## Étape 5 — `Seo` et `Oracle` (inventaire du 08/10/2026)

Vérifié par empreinte sur les conteneurs en marche, et dans la console : **aucune clé propre
n'existe pour ces quatre applications**, qui sont bien quatre projets distincts (chacune a
son sous-domaine et son dépôt) :

| Clé actuelle | Conteneur | Projet | Fichier `.env` | Compose (répertoire · service) |
|---|---|---|---|---|
| `Seo` | `seopilot-web`, `seopilot-worker` | SEOPilot | `/root/seopilot/Autoseo/.env` | `/root/seopilot/Autoseo` · `app`, `worker` |
| `Seo` | `firecrawl-toolkit` | Firecrawl Toolkit (`firecrawl.srv767464…`) | `/opt/firecrawl-toolkit/.env` | `/opt/firecrawl-toolkit` · `firecrawl-toolkit` |
| `Seo` | — | **variable d'environnement Windows** (compte utilisateur) de Laurent | — | — |
| `Oracle` | `dreamoracle-dreamoracle-1` | DreamOracle | `/docker/dreamoracle/.env` | `/docker/dreamoracle` · `dreamoracle` |
| `Oracle` | `rampa-web` | Rampa RAG (`rampa.srv767464…`) | `/opt/rampa-rag/.env` | `/opt/rampa-rag` · `web` |

Consommation au 08/10 : `Seo` 2,32 $ au total, 0,0005 $ en octobre ; `Oracle` 6,29 $ au
total, 0 $ en octobre. Toutes deux à 2 $/jour, remise à zéro quotidienne.

Trouvé en chemin et **corrigé le 08/10** : `/opt/firecrawl-toolkit/.env` (et sa sauvegarde),
`/opt/rampa-rag/.env` et `.env.local` étaient en **644**, lisibles par tout compte du VPS.
Passés en 600, `docker compose config` valide ensuite.

### Lecture retenue (Laurent, 08/10)

`Seo` **est** la clé de production de SEOPilot, et `Oracle` celle de DreamOracle : elles
restent en place, sous leur nom. Il ne s'agit pas de les remplacer mais d'**en sortir les
intrus**. Vérifié dans la console le même jour : 26 clés, aucune nommée `seo-prod` ni
dédiée à Firecrawl Toolkit ou à Rampa.

### Clés à créer (Laurent)

Même formulaire qu'à l'étape 1. **Ordre impératif** : choisir *Reset limit* = **Daily**
**avant** de valider le montant (coche verte) — sinon le plafond est à vie.

| Name | Plafond | Destination |
|---|---|---|
| `firecrawl-toolkit-prod` | 1 $/j | `/opt/firecrawl-toolkit/.env` |
| `rampa-prod` | 1 $/j | `/opt/rampa-rag/.env` |
| `poste-laurent` | 1 $/j | variable Windows `OPENROUTER_API_KEY` (compte utilisateur) — ou **suppression** de la variable si aucun usage local |

Reporter chaque valeur avec la commande de l'étape 2 (`read -rs`, la valeur ne passe ni par
un argument ni par une conversation), puis `docker compose up -d --force-recreate <service>`.
Pour le poste : *Paramètres Windows → Variables d'environnement → variables utilisateur*,
puis rouvrir les terminaux ([[openrouter-key-in-shell-env]]).

### Ensuite (Claude)

Contrôle par empreinte : `seopilot-web` et `seopilot-worker` restent seuls sur `Seo`,
`dreamoracle` seul sur `Oracle`, et les deux nouvelles clés répondent `limit_reset: daily`.
**Aucune clé à supprimer** à la fin de cette étape.

### Fait le 08/10/2026

`firecrawl-toolkit` et `rampa-web` portent chacun leur clé (1 $/jour, `limit_reset: daily`,
vérifié sur la clé **chargée par le conteneur**, pas seulement sur le fichier). `Seo` ne sert
plus qu'à `seopilot-web` et `seopilot-worker`, `Oracle` qu'à `dreamoracle`. Les deux sites
répondent 200, aucun redémarrage en boucle. **Reste** : la variable Windows
`OPENROUTER_API_KEY` du compte de Laurent, qui porte encore `Seo` — à supprimer, ou à
remplacer par une clé `poste-laurent`.
