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

Ne supprimer `Maudios` qu'après **24 à 48 h de trafic nul** sur elle dans *Activity*. C'est
la seule preuve que plus rien ne l'utilise. Même règle pour `Seo` et `Oracle` — et se
souvenir que `Seo` vit aussi dans l'environnement shell de Laurent : tout test local en
hérite.

## Reste à identifier

**`distraction2026`** : 39,96 $ dépensés, **utilisée il y a un jour**, et absente de
l'environnement de tous les conteneurs. Vraisemblablement une credential n8n — tous les
workflows ne lisent pas `$env`. À identifier **avant** de cloisonner, sinon on refait la
carte sans la case qui dépense.
