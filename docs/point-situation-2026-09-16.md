# Point de situation — AInspiration

**16 septembre 2026**

---

## Ce qui s'était cassé

Une seule cause, découverte le matin du 16/09 par le mail de surveillance : la credential n8n qui portait l'authentification des workflows contenait un **jeton JWT administrateur collé à la main**. La rotation de `JWT_SECRET` du 8 septembre s'est terminée à moitié — le jeton reposé avait été signé avec un autre secret que celui que faisait tourner le conteneur.

Conséquences, toutes silencieuses :

- l'auto-blog générait des articles puis les perdait à la publication (09/09 et 15/09, OpenRouter facturé pour rien) ;
- la newsletter ne lisait plus ses abonnés depuis le 10/09 ;
- une **seconde chaîne de publication** (« Publish from AutoSEO ») était morte depuis le 8 septembre elle aussi, pour la même raison, avec trois jetons admin en clair dans ses nœuds.

Dix-neuf jours sans article. Rien ne l'avait signalé avant la surveillance mise en place la veille.

---

## Ce qui est réglé

**Le couplage a été supprimé, pas seulement le symptôme.** Les workflows n'utilisent plus de JWT. Un secret de service (`SERVICE_SECRET`) porte désormais l'authentification machine : indépendant de `JWT_SECRET`, sans expiration, fermé par défaut si la variable manque, et il n'ouvre **que** les deux routes dont n8n a besoin au lieu du CRM entier.

- Backend : commit `d8c537d` sur `main`, intégration continue verte, déployé et vérifié en production.
- Huit nœuds basculés sur la nouvelle credential, répartis sur quatre workflows.
- La sonde de surveillance lit désormais une route dédiée (`/api/ingest/probe`) au lieu d'exiger un accès CRM complet pour lire une date.
- L'ancienne credential et son jeton admin d'un an : supprimés. Les trois jetons en clair : supprimés.
- Huit tests verrouillent le tout, dont celui qui vérifie qu'une variable absente **ferme** la porte au lieu de l'ouvrir.
- Seuil de fraîcheur du contenu porté de 10 à 15 jours : l'écart normal entre deux publications peut légitimement atteindre 13 jours, l'ancien seuil aurait crié au loup une semaine sur deux.

Surveillance au moment de la rédaction : **5 contrôles verts sur 6**.

---

## Ce qui reste ouvert

### 1. Aucun article depuis 19 jours

Le seul contrôle encore rouge. Il se videra à la première publication. Décision en attente : déclencher l'auto-blog manuellement pour rattraper, ou le laisser repartir à sa prochaine date tirée au sort.

### 2. Deux workflows non inspectés, probablement atteints du même mal

`Distr-Action — Publish from AutoSEO` et `Audityo — Publish from AutoSEO` suivent le même patron que celui où les jetons en clair ont été trouvés. Autres projets, autres secrets — inspection en attente de feu vert.

### 3. La newsletter ne pourra pas envoyer

Trois de ses nœuds (`Sauvegarder Newsletter`, `Logger Envoi`, `Mettre à jour statut`) sont réglés sur « authentification : aucune » alors que les routes appelées en exigent une. Ils n'ont jamais tourné parce qu'il n'y a aucun abonné actif — la chaîne s'arrête en 0,4 seconde. Le jour où un abonné sera confirmé, l'envoi échouera.

### 4. Le contrôle qualité renvoie les articles en brouillon

Celui du 15/09 a été retenu pour la formulation « résultat mesuré ». Les brouillons s'accumulent dans `/blog-admin` et attendent une relecture humaine.

---

## Ce qu'on retient

Deux chaînes de publication étaient mortes depuis huit jours, et la seule raison pour laquelle on l'a su, c'est qu'un workflow de surveillance avait été écrit la veille. Le reste du système répondait 200 partout.

L'enseignement vaut au-delà de cet incident : **un secret qu'un humain recopie à la main est une panne en attente.** Le vrai correctif n'était pas de recoller le bon jeton, c'était de faire en sorte qu'il n'y ait plus de jeton à recoller.

Deux pièges opérationnels notés en mémoire, qui ont coûté le plus de temps de diagnostic :

- la console web du VPS n'accepte pas le collage entrant ;
- la sélection d'une ligne entière dans un terminal emporte le retour à la ligne invisible — une heure de diagnostic pour un caractère.
