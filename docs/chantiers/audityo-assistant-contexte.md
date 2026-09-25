# Audityo — il n'y a pas de chatbot public à enrichir

> Constat du 25/09/2026, fait depuis une session AInspiration. **Rien n'a été modifié.**
> Si une suite est décidée, elle appartient à une session Audityo : le chat vit dans
> l'application Next.js, pas dans n8n.

## Ce qui a été cherché, et ce qui a été trouvé

**Aucun chatbot Audityo dans n8n.** Recherche portée sur les **41 workflows**, par nom
(`chat`, `bot`, `assistant`, `audityo`) *et* par type de nœud (`agent`, `chatTrigger`).
Trois workflows seulement portent un agent conversationnel : `chat Ainspiration - TEXT ONLY`,
`chat distr'action V4` et `120 min 2026`.

**Il existe bien un assistant, mais il est dans le produit.** `POST https://audityo.eu/api/chat`
répond **307** vers `/auth/login?callbackUrl=/api/chat` : c'est un assistant réservé aux
utilisateurs connectés, servi par le conteneur `audityo-web`. Ce n'est pas un widget de site
vitrine, et son contexte utile n'est pas le blog : ce sont les systèmes d'IA déclarés par le
client et leur conformité.

Les mentions d'« assistant » sur la page d'accueil sont du texte marketing
(« Un assistant conversationnel utilisé par vos équipes suffit à vous faire entrer dans le
champ du règlement »), pas un composant.

## Une chose vérifiée au passage, et qui évite une fausse alerte

Contrairement à `distr-action.com`, **Audityo ne souffre pas du défaut du SPA-fallback** :

| URL | audityo.eu | distr-action.com |
|---|---|---|
| `/blog/article-invente-xyz` | **404** | 200 + page d'accueil |
| `/page-inventee-xyz-12345` | **307** → login | 200 + page d'accueil |

J'ai failli l'annoncer comme défaut : mes premiers appels utilisaient `curl -sL`, qui suit les
redirections et rend donc `200` là où le serveur répond `307`. **Mesurer sans `-L` avant de
conclure.**

## Si l'assistant du produit doit un jour citer le blog

Les ingrédients existent déjà, publics et sans authentification :

- `GET https://audityo.eu/api/blog` → **18 articles**, avec `title`, `slug`, `metaDescription`,
  `content`, `publishedAt`.

La méthode appliquée aux deux autres chatbots se transpose telle quelle : sélectionner les
articles proches de la question, les injecter avec leur URL, et interdire au modèle d'en citer
un qui ne figure pas dans la liste. Voir la note du 25/09 dans `ops/journal/`.

**Mais c'est une décision produit**, pas une correction : l'assistant d'Audityo parle à des
clients connectés d'un sujet réglementaire, pas à des visiteurs qu'on cherche à convertir.
