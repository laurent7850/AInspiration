# Chiffres des fiches — le gain, pas le temps de fabrication

> Réponse à la **question 9** de l'audit, la dernière encore ouverte.
> Objectif : qu'aucune fiche ne parte avec un `[À VALIDER]` visible à l'écran.

**Correction de cadrage.** Ma première version chiffrait les durées de réalisation. C'était une
erreur : j'ai mesuré ce qui était facile à mesurer plutôt que ce qui compte. Le prospect ne se
demande pas combien de temps l'outil a pris à construire, il se demande **ce qu'il lui rapporte une
fois en place**. Ce document part donc du gain.

---

## 1. Le principe : je mesure l'« après », tu donnes l'« avant »

Un gain de temps est une soustraction. La moitié droite — le temps que prend l'outil aujourd'hui —
est **mesurable dans les journaux d'exécution**, et je l'ai relevée. La moitié gauche — le temps que
ça prenait avant — n'existe que dans ta tête.

Ça réduit beaucoup ce que j'ai à te demander : **une seule valeur par fiche**, celle d'avant.

---

## 2. Le « après » — mesuré, sourcé, utilisable tel quel

| Fiche | Mesure | Source |
|---|---|---|
| **Facturation** | La facturation complète d'un mois s'exécute en **13 secondes** — lecture du calendrier, calcul des tarifs, écriture dans le tableur, envoi de la facture et du comparatif | exécution du 2026-09-01, `mjZouVog4vArYBPI` |
| **Labo Nostalgie** | Une playlist personnalisée de 25 titres, **justifiée titre par titre**, est générée et envoyée par email en **~70 secondes** | 6 exécutions des 27-28 août 2026, de 67 à 71 s |
| **Spotify** | Une playlist thématique créée dans le compte de l'utilisateur en **25 à 40 secondes**, à partir d'une phrase | 3 exécutions, août-septembre 2026 |
| **AutoSEO / SEOPilot** | **50 articles publiés** sur ainspiration.eu entre le **10 mai et le 27 août 2026**, sans intervention humaine — et le même moteur alimente trois marques | API `/api/blog-posts`, comptage direct |

Ces quatre lignes sont vérifiables et n'ont besoin d'aucune validation.

> ⚠️ **Ce que ces mesures ne disent pas.** n8n purge son historique : je vois 6 exécutions du Labo
> Nostalgie, pas le total depuis janvier. **Les durées sont fiables, les volumes ne le sont pas.**
> Ne jamais écrire « 6 playlists générées » — ce serait faux, et très en dessous de la réalité.
> Pour un volume, il faut compter ailleurs (le Google Sheet de la liste noire, par exemple).

---

## 3. Le « avant » — ce que toi seul peux donner

Six questions, une valeur chacune. Un ordre de grandeur suffit : « une demi-journée », « deux
heures », « trois jours par mois ».

1. **Facturation** — combien de temps te prenait la facturation d'un mois **à la main** ?
   *C'est le chiffre le plus rentable de toute la vitrine : « de X heures à 13 secondes » est la
   phrase qui fait demander un audit.*
2. **Réconciliation de caisse** — combien de temps prenait le rapprochement mensuel des caisses
   avant l'outil ? Et **combien d'erreurs** t'a-t-il évitées ou révélées ? *Sur de la comptabilité,
   l'erreur évitée vaut souvent plus que le temps gagné.*
3. **Extraction de factures fournisseurs** — combien de temps aurait pris la saisie manuelle des
   factures d'une trentaine de fournisseurs ? *Je peux compter les lignes produit exactes dans le
   classeur si tu veux le dénominateur.*
4. **Labo Nostalgie** — combien de temps mettait un humain à composer une playlist personnalisée de
   25 titres en respectant les quotas et la liste noire ? *Et combien d'auditeurs servis, si tu as
   le Sheet sous la main.*
5. **Préparation d'émission** — même question : le temps de préparation d'une émission avant.
6. **Chat du site** — combien de demandes reçoit-il par semaine, et lesquelles n'auraient pas eu de
   réponse en dehors des heures de bureau ? *Ici l'avantage n'est pas le temps mais la
   disponibilité.*

---

## 4. Quand l'avantage n'est pas du temps

Forcer toutes les fiches dans un gabarit « X heures gagnées » les rendrait fausses. Quatre autres
formes d'avantage, toutes plus honnêtes selon les cas :

| Forme | Fiche concernée | Ce qui se dit |
|---|---|---|
| **Disponibilité** | Chat du site | Répond la nuit et le week-end, quand personne n'est là. |
| **Capacité** | Labo Nostalgie, Spotify, AutoSEO | Fait à l'échelle ce qu'un humain ne ferait pas du tout : une playlist *par auditeur*, un article *par semaine et par marque*. Le gain n'est pas du temps économisé, c'est du travail qui n'aurait jamais eu lieu. |
| **Fiabilité** | Réconciliation de caisse, Factures fournisseurs | Ne se trompe pas de ligne, n'écrase jamais une cellule déjà remplie. Sur de la comptabilité, c'est l'argument. |
| **Accès** | Enghien | Rend interrogeable un fonds documentaire que personne n'aurait lu en entier. |

**Pour Enghien et Rampa, rien à demander** : format réduit, pas de bloc résultats.

---

## 5. Les fiches qui n'auront pas de chiffre — et pourquoi c'est un choix

| Fiche | Pourquoi |
|---|---|
| **Audityo** | Produit du groupe, pas une livraison. Se mesurera en clients, pas en heures. |
| **Rampa**, **Enghien** | Format réduit : une image et une explication. |
| **Paperclip** | R&D interne. Son résultat est qualitatif : un comité a tourné sur un objectif commercial. |
| **Baseline sécurité** | Encart transversal, pas une carte projet. |
| **TL Services**, **L'Artpéro** | Sites vitrines : le résultat serait des demandes reçues ou une position SEO — des faits à relever, pas à estimer. À défaut, décrire ce qui a été livré. |

---

## 6. Annexe — les durées de réalisation

Le brief les demande dans l'**en-tête** de la fiche détail (§5.3 : titre, secteur, année, durée,
statut). C'est une métadonnée, pas un argument de vente — elle ne va **jamais** dans le bloc
résultats. Relevées pour mémoire, depuis les historiques git complets :

| Fiche | Durée | Année |
|---|---|---|
| TL Services | 4 jours | avril 2026 |
| Réconciliation de caisse (variante) | 4 jours | avril 2026 |
| L'Artpéro | ~8 semaines | février-mars 2026 |
| Enghien | démarré en février 2026, enrichi depuis | 2026 |
| AutoSEO / SEOPilot | socle en février 2026, trois marques branchées jusqu'en août | 2026 |

Six dépôts ont une histoire tronquée au 15 avril 2026 (extraction d'un monorepo) : Audityo,
DreamOracle, Paperclip, Rampa, la brasserie, Dreams. Pour ceux-là, **seule l'année compte** et elle
est connue — inutile de chercher une durée.

---

## 7. La règle à ne pas plier

> **Un `[À VALIDER]` ne se publie jamais.** C'est un marqueur de travail, utile dans le dépôt,
> désastreux à l'écran. Si un chiffre manque au moment de publier : on retire la ligne. Ni le
> marqueur, ni une estimation présentée comme une mesure.
