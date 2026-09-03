# Chiffres des fiches — ce qui est établi, ce qu'il me manque

> Réponse à la **question 9** de l'audit, la dernière encore ouverte.
> Objectif : qu'aucune fiche ne parte avec un `[À VALIDER]` visible à l'écran.

J'ai cherché tout ce qui était **déductible d'une source** avant de te demander quoi que ce soit.
Résultat : les **dates et durées** sont largement récupérables ; les **gains constatés** ne le sont
jamais. C'est normal — un gain est une mesure, pas une trace laissée par un outil.

---

## 1. Deux pièges de méthode, avant les chiffres

**Un workflow modifié huit mois plus tard n'est pas un projet de huit mois.** n8n donne une date de
création et une date de dernière modification. La première est un bon indicateur de mise en
service ; l'écart entre les deux ne mesure **pas** une durée de projet, il mesure une durée de
maintenance. Les deux se disent, mais pas de la même façon : *« en service depuis janvier 2026 »*
est vrai et vendeur ; *« huit mois de développement »* serait faux.

**Six dépôts ont une histoire tronquée.** Audityo, DreamOracle, Paperclip, Rampa, la brasserie et
Dreams portent tous un premier commit `chore: initial commit (project extracted from monorepo)`
daté du **15 avril 2026** — c'est la date de l'extraction, pas celle du projet. Pour ceux-là, git
ne peut pas m'aider : c'est à toi de donner le mois de départ, même approximatif.

---

## 2. Ce qui est établi — utilisable tel quel

| # | Fiche | Établi | Source |
|---|---|---|---|
| 1 | Chat IA du site | En service depuis **janvier 2026**, maintenu (dernière évolution août 2026) | n8n `oz9stSLsjRtRFA8F`, créé le 2026-01-03 |
| 3 | Facturation automatisée | En service depuis **janvier 2026** | n8n `mjZouVog4vArYBPI`, créé le 2026-01-07 |
| 5 | Labo Nostalgie | Version classique **janvier 2026**, déclinaison saisonnière **juin 2026**, audit catalogue **août 2026** | n8n `8N7Vb3R8mrBK6DLl`, `Mrvg6cCeYZEcpv1y`, `RYWMDjWiSoK8C72O` |
| 6 | Spotify | En service depuis **juillet 2026** | n8n `lwTH2RIV2QmyTlLX`, créé le 2026-07-01 |
| 7 | L'Artpéro | **2 février → 26 mars 2026**, 15 commits — soit **environ 8 semaines** | historique git complet |
| 8 | Enghien | Démarré le **4 février 2026**, 47 commits, toujours enrichi (dernier : 1ᵉʳ septembre 2026) | historique git complet |
| 11 | Préparation d'émission | En service depuis **janvier 2026** | n8n `bWQJiJlSMXQeMyyE`, créé le 2026-01-10 |
| 13 | TL Services | **24 → 27 avril 2026**, 12 commits — **livré en 4 jours** | historique git complet |
| 14 | Réconciliation de caisse (variante) | **15 → 18 avril 2026**, 7 commits — **4 jours** | historique git complet du dépôt `reconciliation-caisse` |
| 17 | AutoSEO / SEOPilot | Socle démarré le **27 février 2026**, 63 commits ; hub n8n **mars 2026**, puis branchement des trois marques : AInspiration **mai**, Distr-Action **mai**, Audityo **août 2026** | git + n8n |

Ces dix lignes n'ont besoin d'aucune validation : elles sont sourcées et vérifiables.

---

## 3. Ce que je ne peux pas déduire — 12 questions, une ligne de réponse chacune

### Dates manquantes (histoire git tronquée)

1. **Audityo** — quel mois as-tu commencé, et quand la première version a-t-elle été utilisable ?
2. **DreamOracle** — même question : mois de départ et mois de mise en ligne.
3. **Paperclip** — mois du premier comité de direction lancé ?
4. **Rampa** — mois de départ. (La fin est connue : dernière évolution le 20 août 2026.)
5. **Réconciliation de caisse — le premier restaurant.** Le second a pris 4 jours. Le premier,
   combien ? (Il n'est pas versionné, je n'ai aucune trace.)
6. **Extraction de factures fournisseurs** — mois de réalisation.
7. **Veille YouTube** — mois de mise en service. (Trois générations de workflow existent, jamais
   commitées : je n'ai pas de date fiable.)

### Gains constatés — les seuls chiffres qui font vendre

Un ordre de grandeur validé suffit. **Une fourchette vaut mieux qu'un chiffre inventé, et le
silence vaut mieux qu'une fourchette fausse.**

8. **Facturation** — combien de temps te prenait la facturation d'un mois **avant**, et combien
   **maintenant** ? C'est le chiffre le plus important de toute la vitrine : c'est le cas censé
   convertir.
9. **Réconciliation de caisse** — combien de temps prenait le rapprochement mensuel des caisses
   avant l'outil, combien après ? Et as-tu constaté des erreurs évitées ?
10. **Extraction de factures fournisseurs** — combien de fournisseurs, combien de factures traitées,
    et combien de temps aurait pris la saisie à la main ? (Le dépôt donne une trentaine de
    fournisseurs — je peux compter les lignes produit si tu veux un chiffre exact.)
11. **Labo Nostalgie** — combien d'auditeurs ont reçu une playlist ? Même un ordre de grandeur.
12. **TL Services** — combien de demandes reçues via le formulaire depuis avril ? Ou, à défaut,
    la position du site sur une requête « métier + commune ».

---

## 4. Les fiches qui n'auront pas de chiffre de résultat — et pourquoi c'est bien

Toutes les fiches n'ont pas besoin d'un bloc résultats, et prétendre le contraire mènerait droit à
l'invention. Quatre cas où le chiffre n'a pas de sens :

| Fiche | Pourquoi pas de chiffre |
|---|---|
| **Audityo** | Produit du groupe, pas une livraison. Le résultat se mesurera en clients, pas en heures gagnées. |
| **Rampa**, **Enghien** | Format réduit décidé : une image et une explication, sans bloc résultats. |
| **Paperclip** | R&D interne. Son résultat *est* qualitatif : un comité a tourné sur un objectif commercial. |
| **Baseline sécurité** | Encart transversal, pas une carte projet. |

Pour celles-là, la règle de rédaction est simple : **décrire ce qui a été construit et ce que ça
permet**, sans bloc chiffré. « Livré en quatre jours » ou « en service depuis janvier 2026 » sont
déjà des résultats, et ils sont vrais.

---

## 5. Ce qu'il se passe si tu ne réponds pas à tout

Ce n'est pas bloquant. Les dix lignes du §2 suffisent à écrire les fiches ; les questions du §3
enrichissent. La seule règle à ne pas plier :

> **Un `[À VALIDER]` ne doit jamais être publié.** C'est un marqueur de travail, utile dans le
> dépôt, désastreux à l'écran. Si un chiffre manque au moment de publier, on retire la ligne — on
> ne publie ni le marqueur, ni une estimation présentée comme une mesure.
