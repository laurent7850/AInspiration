# Point de situation — AInspiration

**16 septembre 2026** — journée complète

---

## 1. La panne du jour

Une seule cause, découverte le matin par le mail de surveillance : la credential n8n qui portait l'authentification des workflows contenait un **jeton JWT administrateur collé à la main**. La rotation de `JWT_SECRET` du 8 septembre s'est terminée à moitié — le jeton reposé avait été signé avec un autre secret que celui que faisait tourner le conteneur.

Conséquences, toutes silencieuses :

- l'auto-blog générait des articles puis les perdait à la publication (09/09 et 15/09, OpenRouter facturé pour rien) ;
- la newsletter ne lisait plus ses abonnés depuis le 10/09 ;
- une **seconde chaîne de publication** (« Publish from AutoSEO ») était morte depuis le 8 septembre elle aussi, avec trois jetons admin en clair dans ses nœuds.

Vingt jours sans article. Rien ne l'avait signalé avant la surveillance mise en place la veille.

---

## 2. Ce qui a été corrigé

### Authentification des workflows

**Le couplage a été supprimé, pas seulement le symptôme.** Les workflows n'utilisent plus de JWT. Un secret de service (`SERVICE_SECRET`) porte désormais l'authentification machine : indépendant de `JWT_SECRET`, sans expiration, fermé par défaut si la variable manque, et il n'ouvre **que** les deux routes dont n8n a besoin au lieu du CRM entier.

Huit nœuds basculés sur quatre workflows. L'ancienne credential et son jeton admin d'un an : supprimés. Les trois jetons en clair : supprimés. Huit tests verrouillent le tout, dont celui qui vérifie qu'une variable absente **ferme** la porte au lieu de l'ouvrir.

Vérifié : Distr'Action et Audityo utilisaient **déjà** un secret de service en variable d'environnement. Seul AInspiration portait des jetons en dur.

### Compte administrateur

Le compte `admin@ainspiration.eu` **n'avait aucun mot de passe** depuis sa création : `init.sql` le crée sans `password_hash` et rien ne lui en posait ensuite. Aucun mot de passe n'aurait jamais fonctionné ; la note « réinitialisé le 5 avril » était fausse. Un mot de passe a été posé et rangé dans 1Password.

### Cloisonnement du CRM

`ownerScope()` ne fait plus d'exception pour l'administrateur : chaque compte ne voit que ses propres lignes. Le CRM admin n'affiche plus les fiches de démonstration. **Rien n'a été supprimé** — la démo publique continue de voir les siennes, vérifié après déploiement (4 contacts, 3 sociétés, 3 opportunités, 2 tâches).

Au passage : un appelant sans identité recevait `NULL`, c'est-à-dire « voit tout ». Il reçoit désormais un identifiant qui ne correspond à aucune ligne — il ne voit **rien** au lieu de **tout**.

### Newsletter abandonnée comme canal

Zéro abonné actif, zéro newsletter rédigée, zéro envoi en neuf mois. Le module ne pouvait d'ailleurs pas fonctionner : trois de ses nœuds appelaient des routes authentifiées sans authentification.

Le défaut n'était pas un réglage : « abonnez-vous à la newsletter » n'offre rien de précis, et perdait sur la même page contre un appel à l'action bien plus fort — l'audit gratuit, qui demande le même e-mail, qualifie mieux, et alimente le CRM.

Retirés : la fenêtre surgissante, le formulaire du pied de page, l'entrée du menu CRM. Workflow n8n désactivé. Conservés : pages de confirmation et de désinscription, routes API et tables — un abonné en attente existe, ses droits RGPD doivent rester servis, et la décision reste réversible.

### Antislashes parasites

Le modèle échappe parfois ses guillemets **à l'intérieur du HTML** qu'il produit. Ces antislashes s'affichent sur la page et, recopiés dans le prompt de traduction, font produire au traducteur un **JSON malformé** : plus aucune version EN ni NL.

Ce n'est pas une troncature — la traduction du 16/09 était complète (1915 tokens sur 8000 autorisés) et pourtant impossible à parser. Augmenter `max_tokens`, le réflexe appliqué le 1er septembre, ne pouvait rien y faire.

Corrigé à la source. Deux articles sur 95 étaient touchés, nettoyés en base.

---

## 3. Le blog : mesuré pour la première fois

Pendant six mois, on a produit sans mesurer. Le seul contrôle existant vérifiait qu'un article avait été **publié**, pas qu'il avait été **lu**.

Les données existaient pourtant : SEOPilot suit `ainspiration.eu` avec Search Console et GA4 connectés.

| | |
|---|---|
| Articles publiés (31 sujets × 3 langues) | 93 |
| Mots-clés positionnés | 18 |
| Impressions (fenêtre GSC) | 41 |
| Clics | 1 |
| Position moyenne | 41 |
| Trafic organique | 1 à 3 visites/jour |

**Les sujets du blog ne se positionnent pas** : « prompt ia », « ia prompts », « bibliothèque de prompts » sortaient en position 60 à 71.

**Les termes commerciaux, eux, sont en page 1-2** : « audit stratégie intelligence artificielle pour pme » (9), « audit ia gratuit » (11), « audit ia pme » (11). Ce sont les pages de service qui les portent, pas les articles.

**Nuance décisive** : le blog n'est indexable que depuis le 13 août. Il n'a eu qu'un mois de chance réelle — le condamner aujourd'hui serait le juger sur une période où il ne pouvait pas fonctionner.

### Décisions

1. **Pool de sujets réécrit** vers le terrain gagnable : audit IA, PME, Hainaut, Bruxelles, Belgique, conformité EU AI Act.
2. **Fenêtre de décision datée : fin novembre 2026.** Critère fixé **d'avance** pour ne pas déplacer la barre après coup : **500 impressions et 15 clics sur 28 jours**. En dessous, changer de format ou arrêter.
3. **Trois langues conservées.**

### Rapport mensuel automatique

Le 1er de chaque mois à 7h, un mail avec les cinq chiffres, les dix termes qui accrochent et un verdict face à l'objectif. Le script vit sur le VPS parce que la base SEOPilot est sur un autre réseau Docker que n8n ; le secret d'authentification n'est stocké qu'à un seul endroit, relu à l'exécution.

---

## 4. Publication relancée

L'article **« L'IA dans les PME du Hainaut »** est en ligne — premier sujet du nouveau pool, catégorie correcte, huit sections dans le HTML brut. Les vingt jours de silence sont rompus et la chaîne fonctionne de bout en bout avec le secret de service.

Les versions EN et NL ont échoué : c'est ce qui a mené à la découverte des antislashes. Le correctif s'appliquera au prochain article, **lundi 21 septembre**.

---

## 5. État de la surveillance

| Contrôle | État |
|---|---|
| Parcours prospect : fiche écrite | ✅ |
| Parcours prospect : fiche relue et datée du jour | ✅ |
| Secret d'ingestion | ✅ |
| Jeton CRM | ✅ |
| SEO : liens d'articles dans le HTML brut | ✅ |
| Fraîcheur du contenu | ✅ (article du jour) |

Seuil de fraîcheur porté de 10 à 15 jours : l'écart normal entre deux publications peut légitimement atteindre 13 jours, l'ancien seuil aurait crié au loup une semaine sur deux.

---

## 6. Ce qui reste ouvert

- **Le CRM est quasiment vide** — une seule fiche, la sonde de surveillance. C'est la réalité : aucun prospect réel n'y figure encore. L'ingestion depuis les formulaires ne fonctionne que depuis le 15 septembre.
- **La newsletter** reste en base, désactivée. À supprimer définitivement ou à relancer, un jour.
- **Les termes anglais accrochés n'ont aucune valeur commerciale** (« ai aspiration », « automating your invoices in talentia »). À réexaminer quand les chiffres par langue seront disponibles.

---

## Ce qu'on retient

Deux chaînes de publication étaient mortes depuis huit jours, et la seule raison pour laquelle on l'a su, c'est qu'un workflow de surveillance avait été écrit la veille. Le reste du système répondait 200 partout.

Deux enseignements qui valent au-delà de cet incident :

**Un secret qu'un humain recopie à la main est une panne en attente.** Le vrai correctif n'était pas de recoller le bon jeton, c'était de faire en sorte qu'il n'y ait plus de jeton à recoller.

**Produire sans mesurer, c'est travailler à l'aveugle.** Quatre-vingt-treize articles ont été écrits avant que quiconque regarde s'ils étaient lus. Les données étaient disponibles depuis le début.
