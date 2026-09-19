---
date: 2026-09-19
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Au prochain prix ajouté dans une locale, écrire ses espaces internes en insécables
---

## Fait

- **Les montants des offres ne se coupent plus en deux.** Laurent a vu « 900 € / 1 » sur
  une ligne et « 500 € » sur la suivante, sur la carte O2. Les espaces des montants étaient
  des espaces ordinaires : le navigateur avait parfaitement le droit de couper là.
  Corrigé à la source, en espace insécable (U+00A0) à l'intérieur des montants — séparateur
  de milliers, et entre le nombre et le symbole — sur les **dix prix FR et NL**.
- **Le `/` et le `–` restent sécables**, volontairement. Rendre tout le prix insécable
  l'aurait fait déborder de sa carte sur mobile ; ce qu'on veut, c'est que la coupure tombe
  sur le séparateur et jamais à l'intérieur d'un nombre.
- **Même chasse, donc aucun changement visuel.** U+00A0 a la largeur d'une espace ordinaire.
  Seul le point de coupure bouge. J'ai écarté U+202F, l'espace fine insécable que voudrait
  la typographie française : elle change la largeur, et rien ne garantit qu'Outfit la porte.
- **Déployé** : build, Netlify, sondage des 210 fichiers du CDN, `--force-recreate`.
  Le manifeste n'a pas bougé — seuls des fichiers non hashés changent — donc pas de commit
  de manifeste cette fois.

## Cassé

- **O2 n'était pas seule.** En forçant la colonne à 200 px sur la production, le même test
  a sorti `"3 500 – 6 "` + `"000 €"` pour O3, et en néerlandais le **`€` pouvait se
  retrouver seul sur sa ligne** (`€ 900` s'écrit avec l'espace après le symbole). Cinq prix
  français et cinq néerlandais étaient exposés ; seul l'anglais ne l'était pas, ses montants
  n'ayant pas d'espace interne (« €2,400 »).
- **Je n'ai pas su reproduire le défaut en redimensionnant la fenêtre.** Balayage de 640 à
  1150 px : le prix tenait sur une ligne partout. C'est en forçant la largeur de la colonne
  à 200 px que le mécanisme est apparu, à l'identique de la capture. **Ne pas conclure
  qu'un bug n'existe pas parce qu'on ne l'a pas reproduit dans les conditions qu'on a
  essayées** — la capture d'écran, elle, était sans appel.

## Reste

- Les prix cités **en prose** (`prompts.json`, `training.json` — « à 900 € la demi-journée
  ou 1 500 € la journée ») gardent leurs espaces ordinaires. Une coupure y est bien moins
  visible qu'en gros caractères sur une carte, mais le correctif serait le même.
