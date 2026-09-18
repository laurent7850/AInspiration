# Chantier — les dernières traces de l'offre abandonnée

**Cadré en session Cowork le 18/09/2026, après vérification du site en production.**
À exécuter en session Claude Code.

> La refonte O1–O5 est déployée et vérifiée : l'ancienne offre a **zéro occurrence** dans le
> HTML brut de l'accueil, carte SEO backend comprise. Ce qui reste n'est plus sur les pages
> commerciales — c'est dans les **textes contractuels** et dans **un article de blog**.
>
> C'est le dernier obstacle avant la campagne LinkedIn.

## Pourquoi c'est prioritaire

Un prospect qui lit les CGV avant de signer y trouve aujourd'hui une prestation qui n'existe
plus, avec une clause de responsabilité sur un rapport que vous ne produisez plus, et un
engagement de niveau de service portant sur un Pack Express abandonné. Pour une société qui
vend du Check AI Act à 990 €, c'est l'incohérence la plus coûteuse qui subsiste.

## Règle absolue pour ce chantier

**Aucun texte contractuel ne se publie sans validation de Laurent.** Propose les
formulations, montre-les, attends l'accord. Ce n'est pas une précaution de style : ce sont
des engagements opposables.

---

## 1. CGV — `public/locales/{fr,en,nl}/legal.json`, objet `cgv`

Inventaire exact, relevé le 18/09 :

| Clé | Contenu actuel | Ce qu'il faut en faire |
|---|---|---|
| `s2_li1` | « Audit IA gratuit pour PME » | Remplacer par la liste O1–O5 réelle |
| `s3_title` | « 3. Audit IA gratuit — Conditions spécifiques » | **Réécrire la section entière** pour le rendez-vous découverte de 30 min |
| `s3_body1` | Décrit l'audit comme « prestation de service intellectuel offerte sans contrepartie financière », avec « le rapport d'audit délivré » | Le RDV découverte ne délivre **aucun livrable** : c'est un appel de qualification. La clause doit le dire |
| `s3_body2` | Traitement RGPD des données de l'audit | À conserver dans l'esprit, à réécrire pour le RDV |
| `s3_body3` | Responsabilité « au titre des recommandations formulées dans le rapport d'audit » | Sans rapport, plus de clause à porter dessus |
| `s4_body` | « L'audit initial est gratuit et sans engagement. » | À retirer ou reformuler pour le RDV |
| `s11_body` | SLA : « 24h pour les audits, 5 jours ouvrés pour les **Packs Express** », 99 % de disponibilité, 4h sur incident critique | **Le plus exposé.** Le Pack Express est abandonné depuis le 16/09. Les délais O1–O5 sont différents. À reprendre entièrement |

**Ne renumérote pas.** Remplace le contenu de la section 3 plutôt que de la supprimer :
supprimer décale tout de 3 à 12, dans trois langues, pour aucun gain.

**Ne touche pas à `cgu.s2_body`** : le « gratuitement » qui s'y trouve parle de l'accès au
site, pas d'une prestation. C'est correct.

### Le document SLA

`s11_body` renvoie à un « document SLA complet disponible sur demande ». Ce document existe
dans Notion (*SLA — Accord de Niveau de Service v1.0*, avril 2026) et décrit l'ancienne
offre. **Il n'est pas dans le dépôt** : signale-le à Laurent, ne tente pas de le corriger.

---

## 2. Politique de confidentialité — même fichier, objet `privacy`

| Clé | Contenu | Action |
|---|---|---|
| `s3_title` | « Données collectées lors de l'audit IA » | Réécrire pour le RDV découverte et le formulaire de contact |
| `s3_intro` | « Dans le cadre de l'audit IA gratuit, nous collectons… » | Idem |
| `s3_body` | Conservation 12 mois, « le rapport d'audit contient des recommandations… » | La durée de conservation est une vraie clause RGPD : **garde-la**, retire la phrase sur le rapport |

Les quatre formulaires alimentent le CRM depuis le 15/09 : la politique doit décrire **ce
flux-là**, qui est réel, plutôt qu'un audit qui ne l'est plus.

---

## 3. L'article « Thierry » — décision : le retirer

`src/pages/ThierryBlogPage.tsx`, route `/blog/thierry-facturation-ia`.

Construit de bout en bout sur le parcours audit gratuit → Pack Express. Le réécrire coûte
plus qu'il ne rapporte : le blog est en fenêtre de décision jusqu'à fin novembre, et ce
tunnel n'a jamais converti.

**Retirer la page et la route, poser une redirection 301 vers `/realisations`.** Vérifier
qu'aucun lien interne ne pointe encore dessus, et retirer l'entrée du sitemap s'il y en a une.

---

## 4. Deux grilles tarifaires hors O1–O5

**L'essai gratuit de 14 jours du CRM** (`crm.json`) : à retirer. Il contredit la décision
« rien de gratuit sauf le RDV découverte » et promet un produit qui n'est pas en vente. Le
compte de démonstration public remplit déjà ce rôle.

**La tarification de la création visuelle** (`content.json`) : **en attente d'arbitrage.**
Soit elle rentre dans O3, soit elle sort du site. Ne tranche pas seul — demande à Laurent.

---

## 5. Pendant que tu y es

Le contrôle de santé signale **0 hreflang** sur l'article du 16/09, contre 4 sur un article
complet. C'est le problème EN/NL connu, et la publication du **lundi 21/09** en est la preuve
attendue. Si tu passes lundi, c'est le premier point à regarder.

---

## Vérification avant de rendre la main

1. `type-check`, `lint --max-warnings 0`, les tests — **en session Claude Code**, ils ne
   tournent pas depuis Cowork.
2. `node scripts/health-check.mjs` sur la production après déploiement.
3. Les trois langues, sur le **HTML brut** et **insensible à la casse** : « Free Audit » avait
   survécu à deux passes le 18/09 parce que la recherche était sensible à la casse.
4. Rappel du piège Netlify : **committer avant de déployer**, il rejoue `npm run build`
   depuis le dépôt et écrase le `dist/` poussé.

## Un sujet plus large, à ne pas traiter ici

La surveillance ne sait pas distinguer un déploiement d'une panne. Le 18/09, une session
Cowork a déclaré une panne pendant une fenêtre de déploiement de quatorze minutes. L'inverse
est plus grave : si le site tombait pendant qu'un déploiement tourne, personne ne le verrait.
À traiter dans un chantier à part.
