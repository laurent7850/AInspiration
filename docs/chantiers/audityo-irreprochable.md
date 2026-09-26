# Audityo irréprochable — audit du 26/09/2026 et consigne à coller

**Audité depuis la session AInspiration, en production uniquement.** La règle « une session par
dépôt » interdit d'écrire dans `Audityo/` d'ici : tout ce qui touche au code de ce dépôt est
donc décrit ci-dessous, prêt à coller dans une session Audityo, pas appliqué.

**Déjà corrigé d'ici**, parce que n8n n'est pas un dépôt voisin : le prompt du chatbot
(workflow `rdqUmTQThti94POA`). Voir le point 1.

---

## 1. Le défaut grave : une erreur de droit sur l'argument central

`audityo.eu` annonce, juste avant les trois montants de sanctions :

> « Les plafonds sont fixés par le règlement lui-même. **Le montant retenu est le plus élevé
> des deux** : la somme absolue, ou le pourcentage du chiffre d'affaires mondial. »

Puis : **35 millions d'euros**, **15 millions**, **7,5 millions**.

C'est la règle du **régime général**, exacte pour une grande entreprise. Mais le titre de la
page est *« Conformité EU AI Act pour les **PME** européennes »*, et pour une PME la règle est
**inversée** :

> **Article 99 § 6** — « In the case of SMEs, including start-ups, each fine referred to in
> this Article shall be up to the percentages or amount referred to in paragraphs 3, 4 and 5,
> **whichever thereof is lower**. »

Vérifié le 26/09/2026 sur le service officiel de la Commission
(`ai-act-service-desk.ec.europa.eu/en/ai-act/article-99`), et concordant sur quatre autres
sources juridiques.

**Ce que ça produit.** Pour une PME à 2 M€ de chiffre d'affaires, le plafond de non-conformité
n'est pas 15 M€ mais **3 % de 2 M€, soit 60 000 €**. La page affiche donc à son public une
exposition fausse d'un facteur ~250, et ça se lit comme de la vente par la peur. Sur un
produit de conformité, une erreur de droit dans le chiffre d'accroche coûte la crédibilité
entière : c'est précisément ce qu'un juriste vérifiera en premier.

**Fait le 26/09 :** le prompt du chatbot portait la même phrase, recopiée de la page d'accueil
le 25/09. Corrigé dans n8n, testé en production. À la question « je suis une PME de 15
personnes, combien je risque ? », il répond désormais que pour une PME l'amende est plafonnée
au **plus bas** des deux, et refuse de chiffrer le cas faute de connaître le chiffre
d'affaires.

**À faire dans la session Audityo** — la section « Ce que coûte l'absence de dossier » de la
page d'accueil. Proposition de formulation :

> Les plafonds sont fixés par le règlement lui-même. Pour une grande entreprise, le montant
> retenu est le plus élevé des deux : la somme absolue ou le pourcentage du chiffre d'affaires
> mondial. **Pour une PME, l'article 99 § 6 retient le plus bas des deux** — c'est donc le
> pourcentage qui s'applique dès lors qu'il est inférieur.

Les trois montants et les trois pourcentages, eux, sont **exacts** (art. 99 §§ 3, 4, 5) et
n'ont pas à bouger. Ce qui change, c'est la phrase qui dit lequel des deux s'applique, et il
faut qu'elle distingue les deux régimes puisque la cible est la PME.

---

## 2. Dix-huit articles, zéro dans le sitemap

`sitemap.xml` porte **10 URLs** : l'accueil, `/contact`, `/textes-officiels`, `/blog`,
`/auth/login`, `/auth/register` et les quatre pages légales. **Aucun des 18 articles.**

Les articles existent, sont liés depuis `/blog` et — c'est le point rassurant — **sont bien
rendus côté serveur** : ~8 300 caractères de texte dans le HTML brut, sans exécuter de
JavaScript. Ils n'ont donc pas le défaut qui a rendu le blog d'AInspiration invisible pendant
trois mois. Ils ne sont simplement pas annoncés.

Pour comparaison, le sitemap d'AInspiration porte 88 URLs, chaque article compris.

**À faire :** générer les entrées d'articles dans le sitemap depuis la même source que
`/blog`. Les 18 slugs sont listés en annexe.

---

## 3. Le sitemap annonce deux pages `noindex`

`/auth/login` et `/auth/register` figurent dans le sitemap **et** portent
`<meta name="robots" content="noindex, follow">`. Signal contradictoire : Search Console le
remonte en « URL envoyée marquée “noindex” ». À retirer du sitemap — le `noindex` est le bon
choix, c'est l'annonce qui ne l'est pas.

---

## 4. Mineur : une URL inconnue rend 307 au lieu de 404

Toute route racine non reconnue redirige vers `/auth/login?callbackUrl=<chemin>` :
`/produits`, `/nawak`, `/page-inventee-xyz` — toutes en **307**, jamais en 404. C'est le
middleware Next.js qui traite tout chemin non apparié comme une route protégée.

**Le risque de duplication est déjà neutralisé, et bien** : `/auth/login` porte
`noindex, follow` *et* un `canonical` vers lui-même **sans** la query string. L'espace infini
de `callbackUrl` ne peut donc pas être indexé. C'est du travail propre.

Reste que c'est un *soft 404* : un lien mort ou une faute de frappe ne se signale jamais comme
une erreur, et le budget d'exploration s'y perd. À corriger quand ce sera commode, pas en
urgence. `/blog/<inventé>` et `/legal/<inventé>` rendent bien **404**, eux.

---

## 5. Deux affirmations à sourcer ou à adoucir

**« La même conformité est aujourd'hui vendue à la journée par des cabinets. »** Plausible,
mais c'est une comparaison chiffrée sur les pratiques de concurrents, sans source. La règle
« aucune preuve fabriquée » s'applique : soit une source, soit une formulation qui n'engage
que nous.

**« Satisfait ou remboursé 30 jours »**, alors que la page dit elle-même « rien n'est facturé
à ce jour ». Ce n'est pas faux, c'est un engagement jamais éprouvé. À garder si tu le tiens —
même arbitrage que les « réponse sous 24h » d'AInspiration (C10).

---

## Ce qui est juste, et qu'il ne faut pas toucher

Vérifié pièce par pièce, c'est solide :

- **Le calendrier, report compris.** La page annonce les systèmes à haut risque de l'annexe III
  **reportés au 2 décembre 2027** par le règlement omnibus. Confirmé sur
  `digital-strategy.ec.europa.eu` (la Commission) et par deux cabinets internationaux. L'article
  de blog du 27/08 va plus loin : il dit explicitement que le 2 août 2026 « n'est plus tout à
  fait exact », cite l'omnibus, et donne aussi le 2 août 2028 pour l'annexe I. C'est mieux tenu
  que la plupart des sites du secteur.
- **Les quatre catégories et leurs références** — article 5, annexe III, article 50,
  considérant 165. Exactes.
- **Les trois montants et pourcentages de l'article 99** §§ 3, 4, 5. Exacts pour le régime
  général.
- **TVA BE 0462.122.648** sur les quatre pages légales, cohérente avec AInspiration après la
  correction du 25/09.
- **Aucune preuve fabriquée** : pas de faux client, pas de témoignage inventé, pas d'étude de
  cas imaginaire. L'accueil dit « à l'ouverture, une seule offre ; rien n'est facturé à ce
  jour » — c'est exactement le ton qu'on veut.
- **Pas de contenu fabriqué sur URL inconnue**, contrairement au défaut qu'avait AInspiration.

---

## Annexe — les 18 slugs d'articles absents du sitemap

```
automatiser-taches-administratives-ia-pme
classification-risque-systeme-ia-eu-ai-act-2026-09-15
constituer-la-documentation-technique-exigee-par-l-eu-ai-act-2026-09-09
deadline-eu-ai-act-aout-2026-preparation-entreprises-2026-08-27
documentation-technique-ia-conformite-eu-ai-act-2026-08-17
eu-ai-act-guide-conformite-pme-2026
eu-ai-act-impact-pme-tpe-europeennes-2026-06-18
eu-ai-act-rgpd-differences-complementarites-double-conformite-2026-07-17
evaluation-conformite-ia-etapes-2026-07-07
fournisseur-deployeur-ia-responsabilites-2026-07-01
gouvernance-ia-entreprise-mise-en-place-2026-06-12
journalisation-tracabilite-systeme-ia-2026-09-25
marquage-ce-systeme-ia-haut-risque-comment-obtenir-2026-06-08
obligations-eu-ai-act-entreprise-2026-09-21
pratiques-ia-interdites-reglement-europeen-2026-08-05
registre-systemes-ia-entreprise-methode-pme-2026-07-13
systemes-ia-haut-risque-exemples-obligations-2026-08-21
transparence-ia-obligations-chatbot-informer-utilisateurs-2026-07-23
```

---

## Consigne prête à coller dans une session Audityo

> Trois corrections sur `audityo.eu`, trouvées en auditant la production le 26/09/2026. La
> première est une erreur de droit, les deux autres du référencement.
>
> **1. Sanctions : la règle des PME est inversée, et c'est notre public.** La page d'accueil
> dit « le montant retenu est le plus élevé des deux » avant d'afficher 35 M€ / 15 M€ / 7,5 M€.
> C'est vrai pour une grande entreprise, faux pour une PME : l'**article 99 § 6** du règlement
> (UE) 2024/1689 prévoit que pour les PME et les jeunes entreprises, l'amende est plafonnée au
> montant ou au pourcentage **le plus bas** des deux (vérifié sur
> `ai-act-service-desk.ec.europa.eu/en/ai-act/article-99`). Pour une PME à 2 M€ de chiffre
> d'affaires, le plafond de non-conformité est donc 60 000 €, pas 15 M€. Distingue les deux
> régimes dans cette phrase ; les montants et pourcentages eux-mêmes sont exacts, ne les
> touche pas. Le prompt du chatbot portait la même erreur et a déjà été corrigé dans n8n.
>
> **2. Les 18 articles du blog ne sont pas dans le sitemap.** Il ne porte que 10 URLs.
> Les articles sont bien rendus côté serveur (~8 300 caractères en HTML brut), donc
> indexables — ils ne sont simplement pas annoncés. Génère leurs entrées depuis la même source
> que la page `/blog`.
>
> **3. Retire `/auth/login` et `/auth/register` du sitemap** : ils portent `noindex`, et
> annoncer une page `noindex` fait remonter une erreur dans Search Console. Le `noindex` est
> le bon choix, garde-le.
>
> Mineur, pour plus tard : toute route racine inconnue rend **307** vers
> `/auth/login?callbackUrl=…` au lieu de 404 (middleware Next.js). Le risque d'indexation est
> déjà neutralisé par le `noindex` et le `canonical` sans query string — c'est seulement un
> soft 404, qui empêche de voir les liens morts. `/blog/<inventé>` et `/legal/<inventé>`
> rendent bien 404.
>
> Et deux affirmations à arbitrer avec Laurent, pas à corriger seul : « la même conformité est
> aujourd'hui vendue à la journée par des cabinets » (comparaison sans source) et « satisfait
> ou remboursé 30 jours » alors que rien n'est encore facturé.
>
> Le reste du site a été vérifié et est juste : calendrier avec le report au 2 décembre 2027,
> les quatre catégories et leurs références, les montants de l'article 99, la TVA, et aucune
> preuve fabriquée. Ne le défais pas en corrigeant le reste.
