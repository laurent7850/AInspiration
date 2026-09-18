# HANDOFF — AInspiration

> **Lis ce fichier en premier, avant tout code.** Il porte le contexte qui ne tient pas
> dans une conversation : l'état réel du projet, les décisions déjà tranchées, les pièges
> connus et la prochaine action.
>
> **Et mets-le à jour avant de finir ta session.** Un handoff périmé est pire qu'absent.

**Dernière mise à jour :** 18 septembre 2026 · session Cowork (hygiène du dépôt réglée)
**Journal complet :** Notion → Distr'Action — Poste de pilotage → Journal de bord

---

## 1. Le projet en trois lignes

AInspiration est la division conseil/formation IA de Distr'Action SRL et le tremplin
commercial du groupe. Le dépôt porte deux choses distinctes : le **site vitrine trilingue**
`ainspiration.eu` (FR par défaut, EN, NL) et le **CRM interne** qui sert tout le portefeuille
de projets, pas seulement AInspiration.

Stack : React 18 + Vite + Tailwind + i18next / Express + PostgreSQL 16 (`docker/backend/`) /
n8n pour l'orchestration / VPS Hostinger `srv767464.hstgr.cloud` derrière Traefik.
L'arbre de dépendances détaillé est dans `CLAUDE.md` — lis-le avant de toucher au routage
ou aux composants CRM.

---

## 2. Règles non négociables

1. **Aucun chiffre inventé.** Rien ne se publie, ni sur le site ni dans un livrable, qui
   n'ait été vérifié dans une source réelle (GSC, GA4, base de données) ou validé par Laurent.
2. **Clients anonymisés par défaut.** Le nom de la radio, en particulier, ne sort jamais.
3. **Pas de Supabase** pour les nouveaux développements, autant que possible.
4. **Pas de secret recopié à la main.** L'incident du 16/09 vient de là. Tout secret vit en
   variable d'environnement, et une variable absente doit **fermer** la porte, jamais l'ouvrir.
5. **Design existant respecté.** On ajoute, on ne refond pas.
6. **Un seul CRM pour tout le portefeuille.** Les prospects des autres projets (Audityo compris)
   y entrent aussi, distingués par le champ `source`.
7. **Ne pas confondre `/crm` et `/crm-dashboard`.** `/crm` est la page vitrine publique avec
   accès démo. `/crm-dashboard` est l'application réelle. Le cloisonnement démo/réel a été
   déployé et vérifié le 15/09 — ne le casse pas en « simplifiant » `ownerScope()`.

---

## 3. État au 18 septembre 2026

### Ce qui tourne

- Site public et CRM en production, cloisonnement démo/réel vérifié (15/09).
- Les 4 formulaires du site créent une fiche dans le CRM, avec un champ `source`.
- Authentification des workflows n8n par `SERVICE_SECRET` : indépendant de `JWT_SECRET`,
  sans expiration, n'ouvre que les deux routes nécessaires. 8 tests la verrouillent.
- Surveillance quotidienne des parcours métier (écriture + relecture d'une fiche sonde,
  secret d'ingestion, jeton CRM, liens d'articles dans le HTML brut, fraîcheur du contenu
  à 15 jours). Tous les contrôles étaient OK au 16/09.
- Rapport SEO mensuel automatique : le 1er du mois à 7h, script sur le VPS (la base SEOPilot
  est sur un autre réseau Docker que n8n, d'où le script plutôt qu'un workflow).

### Ce qui est cassé, en pause, ou vide

- **Le CRM est quasiment vide** : une seule fiche, la sonde de surveillance. L'ingestion
  depuis les formulaires ne fonctionne que depuis le 15/09. Aucun prospect réel.
- **Newsletter abandonnée comme canal** (0 abonné actif, 0 envoi en 9 mois). Capture retirée
  du site, workflow n8n désactivé. **Conservés volontairement** : pages de confirmation et de
  désinscription, routes API, tables — un abonné en attente existe et ses droits RGPD doivent
  rester servis. Décision réversible, ne supprime rien sans arbitrage.
- **Versions EN et NL du dernier article** : échouées. Cause trouvée (voir pièges), correctif
  posé à la source, **pas encore vérifié en conditions réelles** — la prochaine publication
  est prévue lundi 21 septembre et c'est elle qui fait la preuve.
- *(Réglé le 18/09 — conservé ici parce que le symptôme peut revenir.)* Le dépôt affichait
  **321 fichiers modifiés** sans qu'aucune modification réelle n'existe : arbre de travail en
  CRLF, index en LF, `core.autocrlf` à `false`. Un `.gitattributes` avec `* text=auto eol=lf`
  a été posé (commit `174afba`) et `git status` est repassé à zéro. **Ne supprime pas ce
  fichier** : c'est lui seul qui tient la normalisation.

### Décisions déjà tranchées — ne pas rouvrir sans raison neuve

| Date | Décision |
|---|---|
| 13/09 | La grille d'offres **O1–O5** du volet 2 du plan de lancement est **la seule** stratégie commerciale de référence. Objectif : 3 000 €/mois. |
| 16/09 | Les décisions des comités de direction consignées dans Notion (audit IA gratuit comme produit d'appel, Pack Automatisation Express à 1 490 €) sont **abandonnées**. |
| 16/09 | Renoncement au Pool d'experts IA de Start IA pour l'instant. À réexaminer une fois des missions clients livrées. |
| 16/09 | Blog conservé en trois langues. **Fenêtre de décision : fin novembre 2026.** Critère fixé d'avance : **500 impressions et 15 clics sur 28 jours**. En dessous, changer de format ou arrêter. Ce critère ne se renégocie pas après coup. |
| 16/09 | Pool de sujets du blog réorienté vers le terrain gagnable : audit IA, PME, Hainaut, Bruxelles, Belgique, conformité EU AI Act. |
| 14/09 | Un seul CRM pour tout le portefeuille, démo publique conservée et cloisonnée. |

---

## 4. Chantiers ouverts

| # | Chantier | Où ça en est | Prochaine action |
|---|---|---|---|
| 1 | **Vitrine des réalisations** (`/realisations` + une fiche par projet, 15 retenues) | Cadré : architecture, angle éditorial (résultats business d'abord), périmètre. Matériel de travail dans `docs/audit-realisations.md`, `docs/realisations-chiffres.md`, `docs/PROMPT-realisations.md`. | Construire la page `/realisations` et la première fiche détaillée, dans le design existant. Captures d'écran produites par pilotage de navigateur, jamais inventées. |
| 2 | **Chaîne de publication** | Correctif antislashes posé à la source, 2 articles sur 95 nettoyés en base. | Vérifier la publication du **lundi 21/09** : les trois langues doivent sortir. Si EN/NL échouent encore, c'est que la cause n'était pas uniquement l'échappement. |
| 3 | **Remplir le CRM** | Ingestion opérationnelle depuis le 15/09, mais aucun prospect réel. | Relève du GTM LinkedIn (grille O1–O5), pas du code. Côté dépôt : rien à faire tant que le flux entrant n'existe pas. |
| 4 | **Newsletter** | Désactivée, tables conservées. | Aucune action. Décision de suppression définitive ou de relance à prendre plus tard. |

---

## 5. Pièges connus

- **Le modèle échappe parfois ses guillemets à l'intérieur du HTML qu'il produit.** Ces
  antislashes s'affichent sur la page et, recopiés dans le prompt de traduction, font produire
  un JSON malformé au traducteur. Ce n'est **pas** une troncature : augmenter `max_tokens` ne
  corrige rien (réflexe appliqué à tort le 1er septembre).
- **Un appelant sans identité recevait `NULL`** dans `ownerScope()`, c'est-à-dire « voit tout ».
  Il reçoit désormais un identifiant qui ne correspond à aucune ligne. Si tu retouches cette
  fonction, garde ce comportement : sans identité, on ne voit **rien**.
- **`admin@ainspiration.eu` n'avait aucun mot de passe** depuis sa création — `init.sql` crée
  le compte sans `password_hash`. Un mot de passe a été posé et rangé dans 1Password. Si tu
  touches à `init.sql`, ne recrée pas le trou.
- **Le dépôt vit sous OneDrive.** Un fichier écrit depuis une autre session peut ne pas être
  encore synchronisé quand tu lis le dépôt. Vérifie la présence réelle d'un changement avant
  de conclure qu'il n'a pas été fait.
- **Les pannes ici sont silencieuses.** Tout répondait 200 pendant que deux chaînes de
  publication étaient mortes depuis huit jours. Un test qui vérifie qu'une page répond ne
  vérifie rien. Vérifie le parcours, pas le code de retour.

---

## 6. Rituel de fin de session — obligatoire

Avant de rendre la main :

1. Mets à jour la section **3** (état) et le tableau de la section **4** (chantiers) ci-dessus.
2. Change la date de « Dernière mise à jour » en tête de fichier.
3. Commite ce fichier avec le reste de ton travail.
4. Produis, en fin de réponse, un **bloc de note de journal** prêt à coller dans Notion,
   au format suivant :

```
Titre    : <projet> — <ce qui a été fait, en une ligne>
Date     : AAAA-MM-JJ
Où       : Claude Code
Type     : Avancée | Incident | Décision | Point de situation | Abandon
Fait     : - ...
Cassé    : - ...   (ou « rien »)
Reste    : - ...
Prochaine action : <une seule action, concrète>
```

C'est Laurent (ou la session Cowork) qui dépose ce bloc dans la base **Journal de bord**.
