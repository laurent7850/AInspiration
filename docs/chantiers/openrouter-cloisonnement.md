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
  'read -rs K && f=/docker/ainspiration/.env && sed -i "/^OPENROUTER_API_KEY=/d" "$f" && printf "OPENROUTER_API_KEY=%s\n" "$K" >> "$f" && chmod 600 "$f" && echo ecrit'
```

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

**2. Trois credentials dans n8n** (Credentials → New → *OpenRouter*), en collant chaque valeur.
Nommer **exactement** :

- `OpenRouter — Radio`
- `OpenRouter — AInspiration`
- `OpenRouter — Distr'Action`

Puis me dire que c'est fait : je retrouve les identifiants dans la base, je repointe les douze
nœuds et je vérifie.

**Ne pas supprimer `OpenRouter account` ni `distraction2026`** tant que les douze nœuds ne sont
pas repointés et qu'un cycle complet n'a pas tourné — les playlists sont quotidiennes, l'audit
et les chats sont à la demande.

### Ce que Claude fait ensuite

Repointage par `updateNode` (forme validée : `credentials.openRouterApi = {id, name}`), puis
contrôle que la **version publiée** de chaque workflow actif porte bien la nouvelle credential
— n8n 2.x distingue brouillon et publié, et un repointage qui ne serait resté qu'au brouillon
ne changerait rien en production.

