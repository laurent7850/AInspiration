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

## 3. Les gains complets — réponses de Laurent, 3 septembre 2026

| Fiche | Avant | Après | Ce qui se dit sur la fiche |
|---|---|---|---|
| **Facturation** | **1 heure** par mois, à la main, avec risque d'erreur | **13 s** | *« La facturation d'un mois : d'une heure à treize secondes. »* |
| **Préparation d'émission** | **2 heures** par émission | **~3 min** | *« De deux heures à trois minutes par émission. »* |
| **Labo Nostalgie** | **1 heure** de composition par auditeur, **un auditeur par jour, du lundi au vendredi** | **~70 s** par playlist | *« Une heure de composition par auditeur, ramenée à soixante-dix secondes — un auditeur servi chaque jour de la semaine. »* |
| **Factures fournisseurs** | **2 jours** de saisie | script | *« Deux jours de saisie pour 646 références chez 25 fournisseurs. »* |
| **Réconciliation de caisse** | **1 heure par jour d'exploitation** | *non mesuré* | voir réserve 2 |
| **Chat du site** | — | **20 demandes/semaine** | voir réserve 3 |

Les trois premières lignes sont des soustractions complètes, sourcées des deux côtés. **Ce sont les
trois meilleurs chiffres de la vitrine**, et la facturation reste le plus fort : une heure de
travail mensuel réduite à treize secondes se comprend sans explication.

> 📌 **Correction utile.** Ma question parlait d'un rapprochement de caisse *mensuel* ; la réponse
> dit **par jour d'exploitation**. C'est très différent, et bien meilleur : une corvée quotidienne
> pèse plus qu'une corvée mensuelle, et le lecteur restaurateur la reconnaît immédiatement. La
> fiche doit dire « chaque jour », pas « chaque mois ».

### Trois réserves avant publication

**1. « Plus d'erreur humaine » ne peut pas s'écrire tel quel.** ⚠️ L'automatisation ne supprime pas
l'erreur, elle en change la nature : l'outil du premier restaurant lit des tickets scannés **par
OCR d'un modèle de langage**, et une mauvaise lecture reste possible. Écrire « plus d'erreur »
serait une promesse que le code ne tient pas — et le premier client qui trouve un écart aurait
raison contre nous.

Ce qui est **vrai, vérifiable et déjà inscrit dans le code** dit presque la même chose, en plus
solide :

- *« Les cellules déjà remplies ne sont jamais écrasées »* — garantie explicite du code.
- *« La ressaisie manuelle disparaît »* — donc la classe d'erreurs propre à la ressaisie aussi.
- *« Les écarts sont signalés au lieu d'être corrigés en silence »* — l'outil marque les conflits.

Formulation à retenir : **on supprime la ressaisie, on ne supprime pas la vigilance.**

**2. Il manque l'« après » de la réconciliation de caisse.** Contrairement aux workflows n8n, ces
deux applications ne laissent aucun journal d'exécution — l'une tourne dans le navigateur, l'autre
dans un conteneur sans historique. **Combien de temps te prend le rapprochement d'une journée
aujourd'hui ?** Deux minutes, cinq minutes ? Sans cette valeur, la fiche dira « une heure par jour
d'exploitation avant l'outil » sans pouvoir refermer la soustraction.

**3. Publier « 20 demandes par semaine » n'est pas évident.** ⚠️ C'est le volume de **notre propre**
site : le publier renseigne autant les concurrents que les prospects, et vingt est un chiffre
modeste qui peut se retourner contre nous. L'avantage réel de ce projet n'est de toute façon pas le
volume mais la **disponibilité** — il répond la nuit et le week-end. **Recommandation : ne pas
afficher le nombre.** Il me manque d'ailleurs la seule donnée qui compterait ici : **quelle
proportion des demandes arrive en dehors des heures de bureau ?**

> ✅ **Le Labo Nostalgie se recoupe tout seul, et c'est ce qui le rend crédible.** Une heure de
> composition pour *un* auditeur, un auditeur *par jour*, du lundi au vendredi — et le workflow
> s'appelle précisément « CLASSIQUE (lundi-vendredi) ». Le rythme déclaré, la charge déclarée et le
> nom du workflow disent la même chose. C'est le genre de cohérence qu'un prospect sceptique peut
> vérifier lui-même.
>
> ⚠️ **Publier le rythme, jamais un cumul.** « Un auditeur par jour, cinq jours sur sept » est un
> fait. « Plus de 150 auditeurs servis » serait une extrapolation depuis ce rythme — un calcul, pas
> une mesure. Si tu veux un total, il faut le compter dans le Google Sheet de la liste noire ;
> n8n purge son historique et ne peut pas le dire.

### Reste ouvert

- **Réconciliation de caisse** : le temps de rapprochement d'une journée aujourd'hui (réserve 2).
- **Chat** : la part des demandes hors heures de bureau (réserve 3).

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
