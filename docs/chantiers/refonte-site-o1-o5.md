# Chantier — aligner le site sur l'offre O1–O5

**Cadré en session Cowork le 18/09/2026.** À exécuter en session Claude Code.
Objectif : que le site ne contredise plus l'offre, **avant** le lancement de la campagne LinkedIn.

> Le risque qu'on écarte : envoyer des prospects vers une vitrine qui raconte
> l'ancienne stratégie. Un prospect qui lit « audit IA gratuit en 24h » après avoir
> entendu parler d'un Diagnostic à 2 400 € ne revient pas.

## Décisions de Laurent — déjà prises, ne pas rouvrir

| Sujet | Décision (18/09) |
|---|---|
| Adresse | **Chaussée Brunehault 27, 7041 Givry** — confirmée exacte. Le site est déjà correct. |
| Forme juridique | **SRL**. Fait, commit `50665e4`. |
| Nombre de réalisations | **15**. Rampa retiré, fait, commit `50665e4`. |
| Fiche playlists radio | **Anonymiser**, pas retirer. |
| Prestation offerte | **RDV découverte 30 min, et rien d'autre.** Plus aucun livrable gratuit. |
| Grille tarifaire | **O1–O5 uniquement**, avec tarif fondateur −20 % pour les 3 premiers clients en échange d'un témoignage. |

## Déjà fait — ne pas refaire

- `Distr'Action SPRL` → `SRL` : 55 occurrences, CGU/CGV/mentions légales/vie privée, fr+en+nl.
  `Green Garden SPRL` (contact de démonstration du CRM) laissé intact volontairement.
- Rampa sorti de la vitrine : `realisations.ts`, les 3 `realisations.json`, `seoConfig.ts`,
  `about.json`, `common.json`, et les commentaires devenus faux. 15 partout.
  Les « seize nœuds » des workflows n8n parlent de nœuds : **ne pas y toucher**.
- `type-check` et `lint --max-warnings 0` passent. **Les tests n'ont pas pu être joués**
  depuis la session Cowork (binaires natifs Windows dans `node_modules`) : commence par là.

## À faire

### 1. Anonymiser complètement la fiche playlists radio

Le texte est déjà anonyme (« Une radio nationale francophone »). Ce qui fuit, c'est la technique :

- `slug: 'labo-nostalgie'` dans `src/data/realisations.ts` → un slug neutre, ex. `playlists-auditeurs`
- la clé `"labo-nostalgie"` dans `public/locales/{fr,en,nl}/realisations.json`
- `cover: '/images/realisations/labo-nostalgie.jpg'` et le fichier image lui-même
- `REALISATION_DETAIL_SLUGS` dans `docker/backend/routes/seo.js`
- `public/sitemap.xml`
- **une redirection 301** de `/realisations/labo-nostalgie` vers le nouveau slug — l'ancienne
  URL est indexée, la casser perdrait le référencement acquis

### 2. Retirer l'ancienne stratégie du site

« Audit IA gratuit en 24h » apparaît dans le menu, l'accueil, la page contact, les CGV et la
page vie privée. Cette offre a été **abandonnée le 16/09**. Elle est remplacée par le
**RDV découverte de 30 minutes**, qui est un appel de qualification et non un livrable.

Les CGV contiennent aussi une clause de responsabilité « au titre des recommandations
formulées dans le rapport d'audit » : vestige de la même stratégie, à réécrire.

### 3. Aligner les prix sur O1–O5

À retirer : 1 043 € + 290 €/mois, et les 490 € / 1 490 € de la page formation.

| | Offre | Prix HTVA |
|---|---|---|
| O1 | Diagnostic IA, 2 jours | 2 400 € |
| O2 | Atelier, ½ jour / 1 jour | 900 € / 1 500 € |
| O3 | Sprint automatisation | 3 500 – 6 000 € |
| O4 | Abonnement « Pilote IA », 6 mois | 590 €/mois |
| O5 | Check AI Act | 990 € |

### 4. Retirer ce qui n'est pas vrai

- **Les témoignages fictifs de `/formation`.** Non négociable : ils ne peuvent pas rester
  sur le site d'une société qui vend de la conformité.
- **Les chiffres sans source** : « 10h par semaine », « −60 % ». Soit une source vérifiable,
  soit ils sautent. Règle du projet : aucun chiffre inventé.
- **« notre équipe »** : Laurent est seul. Écrire à la première personne.

### 5. Vérifier le rendu pour les robots

L'audit signale plusieurs pages d'offre rendues côté client et quasi vides dans le HTML brut.
Vérifier **sur le HTML brut, pas sur le code de retour** — c'est la leçon du 16/09.

## Point mineur, à trancher

`package.json` porte encore `"name": "distr-action-sprl"`. Interne, invisible du public,
mais incohérent. Le changer touche `package-lock.json` : à faire dans un commit séparé, ou à laisser.

## Rappel de méthode

Ce chantier touche le contenu commercial : **aucun texte de prix ou de promesse ne se publie
sans que Laurent l'ait validé.** En cas de doute sur une formulation, proposer plutôt que décider.
