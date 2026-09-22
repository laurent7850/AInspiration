---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Vérifier jeudi 24/09 que la parution du blog sort dans les trois langues
---

## Fait

- **Le rendez-vous de découverte est réservable.** `VITE_BOOKING_URL` était vide depuis
  toujours : les quatre boutons (hero, pied de page, deux sur `/pme-hainaut-bruxelles`)
  étaient masqués par la garde `env.bookingUrl && (...)`, alors que ce rendez-vous est le
  **seul tunnel d'entrée** de la grille O1–O5. Outil retenu : **Cal.com en hébergé**,
  compte créé par Laurent. L'auto-hébergement sur le VPS a été écarté — un 44ᵉ conteneur à
  maintenir et sauvegarder pour une page de réservation.
- **Trois corrections avant de compiler.** Le lien valait `cal.com/divers-distr-action.com`,
  identifiant généré depuis l'adresse e-mail et destiné au hero d'un site qui vend un
  diagnostic à 2 400 €. Le nom affiché était « laurent Distraction », qui n'est pas la
  marque. Et l'adresse visait la page de profil, qui proposait aussi un rendez-vous de
  15 minutes là où les CGV promettent trente. Retenu : `cal.com/ainspiration/30min`.
  `VITE_BOOKING_URL` étant lue à la construction et gravée dans le bundle, ces réglages
  coûtaient trente secondes avant, et un cycle de déploiement complet après.
- **Deux déploiements, l'ordre de la maison tenu à chaque fois** : build → manifeste poussé
  d'abord → `netlify deploy --prod` → 209/209 entrées vérifiées une à une sur le CDN →
  `--force-recreate`. Conteneur reparti sur « Frontend: 209 files downloaded » les deux fois.
- **Vérifié en production** : le chunk servi porte l'adresse, les boutons sont visibles et
  pointent sur `/30min` dans les trois langues, et un asset absent renvoie toujours
  `404 text/plain` — le garde-fou du 8 juin est intact. 84/84 tests verts, contrôle de
  santé à 21 vérifications passées.

## Cassé

- **Le bouton annonçait « 20 min » alors que tout le reste dit trente.** Découvert
  seulement après le premier déploiement, en lisant le bouton rendu. Six chaînes portaient
  ce chiffre — trois langues × deux fichiers (`common.json` du hero, `local.json` de la page
  Hainaut/Bruxelles). Le site promettait donc moins que ce qui est offert, et se
  contredisait lui-même : Cal.com dit 30, la grille O1–O5 dit trente, les CGV aussi.
  Corrigé vers trente minutes — ce sont les CGV et la grille qui sont opposables, pas la
  page Cal.com — puis redéployé.
  **Même famille que le « 48h » en double** : un nombre posé dans une chaîne de traduction
  que personne ne recoupe avec l'engagement contractuel. Je cherchais le lien, pas le
  libellé.
- **Un piège noté au passage** : le build fait *avant* l'ajout de la variable était **octet
  pour octet identique à la production** — manifeste inchangé, `git status` vide. Le
  déployer n'aurait rien changé et aurait été du risque pur. Un manifeste qui ne bouge pas
  après un build censé changer quelque chose est une information, pas un détail.

## Reste

- La description du rendez-vous sur Cal.com et le sort du créneau de 15 minutes
  appartiennent à Laurent ; le site n'y renvoie pas.
- Le contrôle de santé reste rouge d'un seul échec : l'article du 16/09 sans `hreflang`,
  antérieur, suivi en chantier C9 du carnet. Il le restera chaque lundi tant que ses
  traductions n'auront pas été regénérées.
