# Distr'Action — chatbot enrichi, et un défaut SEO à corriger

> **Ce fichier est une consigne à exécuter depuis une session Distr'Action.**
> Il est déposé ici parce que le travail est parti d'une session AInspiration, mais
> le dépôt `distr-action.com` doit écrire sa propre note — un journal ne raconte pas
> le travail fait ailleurs.

## Ce qui a déjà été fait (25/09/2026, depuis n8n — pas depuis le dépôt)

Le chatbot `chat distr'action V4` (`ZroPJAjhPmWkj2sI`) lit désormais le blog du site
à chaque message, comme celui d'AInspiration.

- Nœud HTTP **`Articles du blog`** → `https://www.distr-action.com/api/blog-posts?language=fr`
  (12 articles), en `continueRegularOutput`, inséré entre `Merge` et `Préparer le Prompt`.
- **`Préparer le Prompt` réécrit** : il lit `$('Merge')`, `$('Détection du thème')` et
  `$('Articles du blog')`, sélectionne les articles les plus proches du message
  (recouvrement de mots, repli sur les deux plus récents), et les injecte avec leur URL.
- Consignes ajoutées : ne jamais citer un article absent de la liste, ne jamais inventer
  une URL ni un titre, ne jamais inventer un chiffre, un client, un prix ou un délai.
- **Le catalogue de services reste le Google Sheet** déjà câblé — Distr'Action n'a pas de
  `seo-routes.json`, et n'en a pas besoin : son Sheet fait mieux.

Vérifié sur la version publiée, et en conditions réelles : l'article cité existe (200),
le Sheet alimente toujours les réponses, et la règle « jamais de vidéo » tient.

## ⚠️ Le défaut à corriger, lui, est dans le dépôt Distr'Action

**`www.distr-action.com` répond `200` à n'importe quelle URL inconnue**, en servant le HTML
de la page d'accueil :

```
/seo-routes.json            200  <!doctype html>…
/page-qui-nexiste-pas-12345 200  <!doctype html>…
/blog/article-invente-xyz   200  <!doctype html>…
```

Pour comparaison, `ainspiration.eu` renvoie `404` sur les deux dernières.

C'est **exactement** le défaut qu'AInspiration a corrigé le 13/08/2026, décrit dans son
`CLAUDE.md` : *« Le SPA-fallback répondait 200 à toute URL inconnue, y compris aux liens
morts, ce qui fabrique une duplication illimitée de la homepage. »* Le correctif consiste à
tenir une **liste blanche des routes** et à ne servir le fallback que pour elles.

**Deux conséquences, pas une.**

1. **SEO** : chaque lien mort, chaque faute de frappe, chaque URL devinée par un robot
   devient une copie de la page d'accueil aux yeux des moteurs.
2. **Le garde-fou du chatbot y est plus faible.** Sur AInspiration, un lien inventé répond
   404 : on le détecte en une requête. Sur Distr'Action, il répondrait 200. La consigne du
   prompt — ne citer que les articles listés — est donc la **seule** protection, et il n'y a
   pas de filet derrière elle.

## À faire depuis une session Distr'Action

1. Poser la liste blanche des routes et renvoyer 404 hors liste (voir le handler SEO
   d'AInspiration, `docker/backend/server.js`, section « STATIC FILES + SPA FALLBACK »).
2. Vérifier après coup avec le seul test qui vaut : `curl` sans exécuter de JavaScript.
3. Écrire la note dans le journal de ce dépôt-là.
