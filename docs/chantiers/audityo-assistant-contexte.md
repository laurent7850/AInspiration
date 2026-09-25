# Audityo — aucun chatbot trouvé, et ce qu'on peut affirmer sans se tromper

> Constat du 25/09/2026, fait depuis une session AInspiration. **Rien n'a été modifié.**
> Cette note a été **corrigée le jour même** : sa première version affirmait qu'un assistant
> existait dans le produit. C'était faux — voir « la fausse piste » plus bas.

## Ce qui est établi

**Aucun chatbot Audityo dans n8n.** Recherche portée sur les **41 workflows**, par nom
(`chat`, `bot`, `assistant`, `audityo`) *et* par type de nœud (`agent`, `chatTrigger`).
Trois workflows seulement portent un agent conversationnel : `chat Ainspiration - TEXT ONLY`,
`chat distr'action V4` et `120 min 2026`.

**Le site vitrine n'annonce aucun chat.** Dix pages publiques au sitemap : accueil, contact,
textes-officiels, blog, connexion, inscription et quatre pages légales. Pas de page
fonctionnalités. Le mot « assistant » n'apparaît qu'une fois sur l'accueil, et c'est un exemple
réglementaire : *« Un assistant conversationnel utilisé par vos équipes suffit à vous faire
entrer dans le champ du règlement. »* Ce n'est pas une description de produit.

## La fausse piste, et pourquoi elle était convaincante

`POST https://audityo.eu/api/chat` répond **307** vers `/auth/login?callbackUrl=/api/chat`.
J'en avais conclu que la route existait et qu'elle était protégée.

Calibrage :

```
POST /api/chat                307 -> /auth/login?callbackUrl=%2Fapi%2Fchat
POST /api/chemin-invente-xyz  307 -> /auth/login?callbackUrl=%2Fapi%2Fchemin-invente-xyz
POST /api/zzz-nawak           307 -> /auth/login?callbackUrl=%2Fapi%2Fzzz-nawak
```

Le middleware renvoie **toute** route `/api/` non authentifiée vers la connexion, qu'elle
existe ou non. Le 307 ne prouve donc rien, et le `callbackUrl` qui reprend le chemin demandé
donnait l'illusion d'une route reconnue.

## Ce qu'on ne peut pas savoir de l'extérieur

Si l'application propose un assistant **derrière la connexion**, aucune sonde publique ne le
dira : les bundles de la page vitrine ne chargent pas le code de l'application. Le savoir
suppose de regarder dans le dépôt Audityo — **donc depuis une session Audityo**, pas d'ici.
Laurent, lui, connaît son produit : la question se règle en une phrase.

## Vérifié au passage — Audityo ne souffre pas du défaut de Distr'Action

| URL | audityo.eu | distr-action.com |
|---|---|---|
| `/blog/article-invente-xyz` | **404** | 200 + page d'accueil |
| `/page-inventee-xyz-12345` | **307** → login | 200 + page d'accueil |

Là aussi j'ai failli annoncer un défaut inexistant : mes premiers appels utilisaient
`curl -sL`, qui suit les redirections et rend donc `200` là où le serveur répond `307`.
**Mesurer sans `-L` avant de conclure.**

## Si un assistant existe et doit un jour citer le blog

L'ingrédient est prêt, public et sans authentification :

- `GET https://audityo.eu/api/blog` → **18 articles**, avec `title`, `slug`, `metaDescription`,
  `content`, `publishedAt`.

La méthode appliquée aux chatbots d'AInspiration et de Distr'Action se transpose telle quelle :
sélectionner les articles proches de la question, les injecter avec leur URL, interdire d'en
citer un absent de la liste. Mais ce serait une **décision produit** — un assistant de
conformité qui parle à des clients connectés n'a pas les mêmes besoins qu'un chatbot de
conversion.
