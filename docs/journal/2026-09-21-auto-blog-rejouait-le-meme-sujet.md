---
date: 2026-09-21
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Vérifier le jeudi 24/09 que la parution sort dans les trois langues — c'est le premier vrai test du correctif antislashes du 16/09
---

## Fait

Mail d'alerte n8n à 10h01 : `Publier FR`, « Your request is invalid or could not be
processed by the service ». Le message du nœud HTTP ne dit rien ; le corps de la réponse,
lui, est net : **409 `Subject already covered`**, jaccard **1.000** avec l'article publié
le 16/09.

**Ce n'était donc pas une panne.** Le garde anti-redondance du backend a fait exactement
son travail : l'auto-blog venait de régénérer, mot pour mot, le sujet « L'IA dans les PME
du Hainaut ». Le défaut était en amont, dans le choix du sujet.

**Le tirage ne visitait qu'un sujet du pool sur deux.** `Jour de publication ?` choisissait
par `topics[seed % topics.length]`, avec `seed = année × 53 + semaine × 7919` et un pool de
22 entrées. Or `7919 mod 22 = 21`, soit `−1`, et le mode « sujet » ne tombe que les semaines
**paires** : l'index était donc toujours **pair**. Vérifié en déroulant la suite sur deux ans :

```
indices atteints : 0,2,4,6,8,10,12,14,16,18,20
jamais atteints  : 1,3,5,7,9,11,13,15,17,19,21
```

**11 des 22 sujets n'ont jamais pu sortir**, et les 11 autres revenaient tous les 5 mois.
Le sujet Hainaut est ressorti en semaine 38 — cinq jours après qu'un rattrapage manuel l'eut
publié le 16/09. Le rattrapage n'a fait qu'avancer une collision de toute façon programmée.

Le tirage des réalisations, lui, couvre bien ses 14 entrées : rien à y changer.

**Deuxième défaut, plus coûteux : le garde était en bout de chaîne.** Le 409 tombe *après*
la génération FR — 48 s d'appel au modèle payées pour un article jeté — et `Publier FR`
ouvrant la chaîne, ni l'anglais ni le néerlandais n'ont été produits. Un refus légitime
coûtait donc une semaine entière de publication.

**Corrigé dans n8n** (`t8SuGsq3sOPuDfdV`, 10 opérations en une transaction) :

1. `Jour de publication ?` compte désormais les semaines-sujet et avance d'un cran à chaque
   tirage — parcours exhaustif des 22 sujets, cycle de 44 semaines, continu au passage
   d'année (semaine 52 → index 12, puis semaine 2 → index 13). Le pool part avec la décision,
   pour rester défini à un seul endroit.
2. Deux nœuds posés entre `Charger réalisations` et `Préparer le brief` : **`Charger le blog
   publié`** (les titres réels, via l'API publique) et **`Choisir le sujet`**, qui écarte un
   sujet déjà couvert et avance dans le pool jusqu'au premier libre — **avant** de payer la
   génération.
3. `Préparer le brief` lit maintenant `realisations.json` par référence nommée plutôt que par
   `$input`, puisqu'un nœud s'intercale devant lui.

Seuil de similarité **0.5**, réglé sur les 32 titres FR réellement publiés et non à l'estime :
il écarte le doublon Hainaut (1.00) et un doublon « tâches administratives » (0.57), et laisse
20 sujets sur 22 disponibles.

Vérifié avant de poser, puis après : 7 tests du nœud contre les vrais articles (doublon
écarté, sujet libre inchangé, liste injoignable, mode réalisation, pool épuisé, rattrapage
manuel, décision incomplète), puis 12 parutions simulées de bout en bout — **aucun doublon**,
et le garde s'exerce trois fois.

## Cassé

Rien. Le workflow est resté actif, les 10 opérations ont été appliquées en une transaction
atomique, et n8n le valide à 0 erreur / 0 avertissement.

## Reste

- **Jeudi 24/09, parution en mode retour d'expérience** : vérifier que les trois langues
  sortent. La chaîne EN/NL n'a pas été exercée depuis le correctif antislashes du 16/09 —
  c'est son premier vrai test. Rien à rattraper pour la semaine du 21 : 16/09 → 24/09 fait
  8 jours, soit le rythme nominal.
- **L'article du 16/09 n'a toujours pas ses versions EN et NL** (chantier 2b, inchangé).
- **Contrôle de santé du lundi : deux jobs rouges, aucun chantier neuf.**
  **(a) Lighthouse** mobile donnait la homepage à **41 < budget 50** (LCP 5,1 s), vert le
  14/09. Relancé : **repassé à vert**. C'était du bruit de mesure, pas une régression — rien
  à ouvrir côté performance. Une mesure Lighthouse isolée ne prouve rien, il faut la répéter
  avant d'en tirer quoi que ce soit.
  **(b) `health-check.mjs`** échoue sur **un point unique** : `0 hreflang` sur l'article du
  16/09, alors que toutes les autres pages en ont quatre. C'est le chantier 2b déjà connu —
  cet article n'a jamais eu ses versions EN et NL. Le contrôle restera rouge tant qu'elles
  n'auront pas été produites. Les 24 autres vérifications passent, TLS compris (31 jours).

## Ce que j'en retiens

**Un défaut de couverture est muet.** Pendant six mois, la moitié du pool éditorial était
morte sans qu'aucun message d'erreur ne le dise — exactement comme le champ `lead_source`
sans colonne, ou le `responseMode` rangé dans `options`. Avant de se fier à un `% longueur`,
dérouler la suite et compter les indices réellement atteints : trois lignes de script.

**Et un garde d'aval ne remplace pas un contrôle d'amont.** Il protège la base, ce qui est
son rôle, mais il la protège au prix de tout ce qui le précède. D'où le sens choisi pour la
panne : si la liste des articles est injoignable, on publie quand même et le 409 rattrape.
Se taire reste un pire défaut que republier.
