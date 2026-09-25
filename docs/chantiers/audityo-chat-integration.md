# Audityo — brancher le chatbot sur le site

> **Le cerveau est construit, branché et ACTIF** : workflow n8n `Audityo — Chat (EU AI Act)`
> (`rdqUmTQThti94POA`), créé, validé sans erreur et mis en service le 25/09/2026 depuis une
> session AInspiration. Credential `OpenRouter-Audityo-Prod` attachée (1 $/jour, `daily`).
> Conversations réelles vérifiées.
>
> Ce qui reste — le **widget sur audityo.eu** — appartient au dépôt Audityo, donc à une
> session Audityo.

## Le contrat de l'API

**Endpoint** — `POST https://n8n.srv767464.hstgr.cloud/webhook/audityo-chat`

Requête :

```json
{ "chatInput": "on utilise ChatGPT dans l'équipe, on est concernés ?",
  "sessionId": "<identifiant stable par visiteur>" }
```

`sessionId` sert la mémoire conversationnelle (fenêtre glissante). Un UUID stocké en
`sessionStorage` suffit. À défaut, le workflow en fabrique un par exécution — la conversation
perd alors le fil entre deux messages.

Réponse :

```json
{ "message": "…", "category": "categories|calendrier|sanctions|methode|tarifs|champ-application|general",
  "intent": "information|achat|support|exploration", "topic": "…",
  "suggested_action": "prediag|attente|textes|contact|null",
  "action_buttons": [{ "type": "link", "label": "⚡ Pré-diagnostic en 30 secondes",
                       "url": "https://audityo.eu/?prediag#liste-attente" }],
  "output": "…" }
```

`action_buttons` vaut `null` quand aucune action n'est suggérée. Le widget d'AInspiration
(`src/components/ChatbotN8n.tsx`) consomme exactement cette forme — c'est le modèle le plus
court à reprendre.

**CORS** : le nœud de réponse renvoie `Access-Control-Allow-Origin: https://audityo.eu`.
Si le widget est testé depuis un autre domaine, l'ajouter là.

## Ce qui est déjà garanti côté n8n

- **Le blog est lu à chaque message** sur `https://audityo.eu/api/blog` (18 articles) et les
  plus proches de la question sont injectés avec leur URL. Rien à tenir à jour.
- Nœud HTTP en `continueRegularOutput` et code en `try/catch` : blog injoignable = réponse
  dégradée, jamais d'erreur au visiteur.
- Déballage tolérant du JSON, même quand le modèle l'encadre de balises de code.
- `errorWorkflow` branché sur `qoHCxT04kuGtqRf7`, erreurs enregistrées.

## Les garde-fous du prompt, et pourquoi ils sont là

Le sujet est réglementaire : les règles ne sont pas cosmétiques.

1. **Aucun conseil juridique.** Le bot explique ce que dit le règlement, jamais ce que le
   visiteur doit faire. Formule de repli reprise du pied de page du site.
2. **Aucune classification du système d'un visiteur.** Établir un niveau suppose un
   inventaire — c'est le produit. Le bot peut dire ce qui *semble* concerné, en précisant que
   seul l'inventaire tranche.
3. **Audityo n'est pas ouvert.** La grille (49 / 199 / 499 €) est annoncée comme *prévue à
   l'ouverture*, avec « rien n'est facturé à ce jour » à chaque mention. **Aucune date
   d'ouverture n'est promise.**
4. **Jamais de tarif dans la première réponse** — mais réponse franche dès qu'on en demande un.
5. Les articles, seuils et dates viennent tous de la page d'accueil, relevés le 25/09/2026 :
   les quatre catégories (art. 5, annexe III, art. 50, considérant 165), le calendrier
   (art. 113 modifié par le règlement (UE) 2026/1744) et les sanctions (art. 99 §§ 3 à 5).

⚠️ **Si le site change ses tarifs, ses dates ou sa grille, le prompt ne le saura pas.** Seuls
le blog et les liens sont dynamiques. C'est le seul point de synchronisation manuelle — à
vérifier lors de l'ouverture commerciale.

## Éprouvé le 25/09 sur six questions

| Question | Réponse |
|---|---|
| « on utilise ChatGPT dans l'équipe, on est concernés ? » | explique la règle du déployeur, **refuse de trancher le niveau**, oriente vers le pré-diagnostic |
| « vous avez écrit sur la documentation technique ? » | cite **deux articles réels**, URL vérifiées en 200 |
| « c'est combien ? » | donne la grille **et** « rien n'est facturé à ce jour » |
| « vous ouvrez quand ? » | **aucune date**, propose la liste d'attente |
| « confirmez-moi par écrit que mon scoring est à haut risque » | **refuse**, explique qu'un niveau suppose un inventaire |
| « les obligations haut risque s'appliquent déjà ? » | « non, pas encore — reportées au 2 décembre 2027 » |

⚠️ **Une erreur de temps a dû être corrigée** : il annonçait d'abord « haut risque **depuis**
le 2 décembre 2027 », une date future. Sur un produit de conformité, une échéance présentée
comme déjà applicable est une faute. Le prompt porte désormais la date du jour et une consigne
explicite : jamais « depuis » pour une échéance à venir.

## Reste à faire

**Session Audityo** : reprendre `ChatbotN8n.tsx` d'AInspiration, changer l'URL du webhook,
adapter l'habillage. Le contrat d'API ci-dessus est le seul point de contact.

## Un point de sécurité à trancher, pas à oublier

Le webhook est **public et sans authentification**, comme ceux des deux autres chatbots : un
secret placé dans un widget de navigateur n'est pas un secret. La vraie protection est le
**rate limiting au niveau de Traefik**, qui n'est posé sur aucun des trois. Un visiteur mal
intentionné peut aujourd'hui consommer le plafond journalier de la clé en boucle.

Le plafond de 1 $/jour borne la casse — c'est exactement à cela qu'il sert — mais il borne en
coupant le service. À arbitrer avant d'ouvrir commercialement.
