---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Supprimer la fiche et la société de test depuis /contacts, connecté en admin@ainspiration.eu
---

## Fait

- **Le formulaire de contact d'`ainspiration.eu` arrive désormais sur `info@ainspiration.eu`.**
  Le nœud `Gmail - Send to Owner` du workflow `wZuJtzIyeU4aVK4g` envoyait à
  `divers@distr-action.com` depuis l'origine. Chaîne complète :
  `ContactPage`/`StartForm` → `POST /api/webhook/contact` (proxy Express) →
  `n8n/Aimaginationcontact` → envoi.

- **Les deux emails partent maintenant d'`AInspiration <info@ainspiration.eu>` en SMTP
  Hostinger**, plus du Gmail personnel de Laurent. Les nœuds `n8n-nodes-base.gmail` sont
  devenus des `n8n-nodes-base.emailSend` (typeVersion 2.1, `emailFormat: html`), sur une
  credential SMTP créée par Laurent — `smtp.hostinger.com:465`, SSL. Le `messageId` est
  passé de `@mail.gmail.com` à `@ainspiration.eu`. **Le gain n'est pas cosmétique :** la
  réponse d'un prospect à l'accusé de réception arrive désormais dans `info@`, la boîte
  que le relevé planifié de 8h / 13h / 18h ouvre déjà, au lieu d'une boîte personnelle.

- **Signature de marque corrigée.** Les deux emails annonçaient Distr'Action sur un
  formulaire AInspiration — le mail interne titrait « Nouveau message (Distr-action) », et
  surtout **l'accusé envoyé au prospect était signé « L'équipe Distr-action »**. Reste d'un
  copier-coller du workflow Distr'Action.

- **Un `=` parasite en tête de chaque email, corrigé.** Le champ portait le préfixe `==` au
  lieu de `=` : n8n lit le premier comme marqueur d'expression et rend le second
  littéralement. Tous les emails sortants du formulaire commençaient donc par un `=` isolé,
  depuis toujours. Invisible dans l'éditeur n8n — seule la relecture du corps reçu l'a montré.

- **La section « Messages » du CRM n'était alimentée par rien — branchée.** La table
  `contact_messages` était **vide, zéro ligne**, pas même le jeu de démonstration. La route
  `POST /api/contact-messages` existe pourtant, publique et faite pour ça (`formLimiter`,
  piège à robots, validation Zod, message attribué à l'administrateur), mais personne ne
  l'appelait : le service frontend sait lire, mettre à jour et supprimer mais **n'a pas de
  méthode de création**, et le workflow n'écrivait que dans `contacts`. **Le dégât n'était
  pas la page vide** : `NotificationContext` compte les messages `new` via
  `/contact-messages/stats`, donc le compteur de notifications du CRM ne pouvait jamais
  sonner. Nœud `CRM — Message de contact` ajouté sur la branche valide de `IF Valid`, en
  parallèle des envois, `onError: continueRegularOutput` et timeout de 5 s — sur le modèle
  exact du nœud d'ingestion. Vérifié en base : `status: new`, propriétaire
  `admin@ainspiration.eu`, `source: formulaire-ainspiration`. Les deux tables ne font pas le
  même travail : `contacts` porte le prospect relançable, `contact_messages` porte le
  message et son cycle de vie.

- **Un badge rouge sur l'entrée « Messages » du menu CRM, déployé.** Le compteur existait
  depuis toujours — `NotificationContext` interroge `/contact-messages/stats` toutes les
  30 s, déclenche une notification navigateur et un son — mais **rien ne l'affichait dans le
  menu, et il valait zéro** puisque la table était vide. `CrmLayout.tsx` consomme désormais
  `newMessagesCount` : badge `bg-red-500` avec le nombre (`99+` au-delà), qui **remplace** le
  chevron quand il est présent pour ne pas encombrer la ligne, et porte un `aria-label`.
  Aucun appel réseau supplémentaire : seulement l'affichage d'une donnée déjà chargée.
  Déployé dans l'ordre : build (209 entrées) → **push du manifeste avant tout** →
  `netlify deploy --prod` → **209/209 entrées vérifiées une à une sur le CDN** →
  `--force-recreate`, conteneur reparti sur « Frontend: 209 files downloaded », 209 fichiers
  sur disque. `bg-red-500` et `99+` retrouvés dans le chunk `CrmLayout-CKAMp7Qg.js` servi en
  production. Un asset absent renvoie toujours 404 `text/plain` — le garde-fou du 8 juin est
  intact. Contrôle de santé : **24 vérifications passées, 1 échec, celui déjà connu** (article
  du 16/09 sans `hreflang`, chantier 2b).

- **Vérifié par le parcours réel, jamais par le code de retour du webhook.** Cinq
  soumissions, dix messages relus en boîte (uid 35 à 44), et pour les deux derniers la
  relecture du corps rendu, texte et HTML. Contrôles complémentaires : une soumission sans
  `consent: true` est refusée en 400, et le limiteur anti-spam a rendu 429 à la cinquième
  soumission depuis la même IP — les deux gardes fonctionnent.

- **Contrôlé sur le graphe publié**, pas seulement sur le brouillon : n8n distingue les deux
  et `mode: 'active'` est le seul qui dise ce qui tourne réellement.

## Cassé

- **Rien qui subsiste.** Une régression a été introduite puis corrigée dans la même session :
  en repartant d'un `options` vide, la bascule avait réactivé l'attribution automatique n8n
  (« *This email was sent automatically with n8n* ») que l'ancien nœud Gmail désactivait par
  `appendAttribution: false`. Visible par le prospect, remise à `false`, revérifiée.

## Reste

- **Une fiche et une société de test à supprimer** : `test-relais-info-22092026@ainspiration.eu`,
  contact `7cd4e873-a85f-4753-ad9f-ec31ebf91065`, société `185f4cb1-f51a-4706-a149-f38db83e18a8`
  (« Distr-Action SRL »), et le message `9e200a9e-8938-43cf-9134-aa3fc3111f8a` dans la section
  Messages, source `formulaire-ainspiration`. Les cinq soumissions n'ont produit
  qu'une fiche — l'ingestion est idempotente sur l'email. Il n'existe pas de route de purge
  pour une fiche arbitraire, seule celle de la sonde Audityo l'est, et par conception.

- **⚠️ La collecte POP3 de Gmail est CASSÉE — confirmé à 11h00 UTC.** Journal d'accès :
  `2026-09-22T10:51:36Z · pop3 · 2001:4860:4864:21::7 (Google) · result: "Incorrect password"`,
  alors que les cinq relèves précédentes de la journée (05:39, 06:49, 08:00, 09:06, 10:08)
  étaient toutes en succès. Le nouveau mot de passe n'a pas été reporté dans Gmail →
  *Paramètres* → *Comptes et importation* → *Consulter d'autres comptes*. **Gmail désactive
  la collecte après une série d'échecs**, il faut donc agir sans attendre.

- **Le mot de passe de la boîte a changé aujourd'hui** (l'ancien était faux, prouvé par un
  `result: "Incorrect password"` en SMTP depuis l'IP du VPS dans les journaux d'accès
  Hostinger). **Gmail relève `info@ainspiration.eu` en POP3 toutes les heures** — les
  journaux le montrent, depuis des adresses Google. Si le mot de passe n'a pas été mis à
  jour dans Gmail → *Paramètres* → *Comptes et importation*, **cette collecte s'est arrêtée
  en silence**. À vérifier dans les journaux d'accès de la boîte.

- **Les noms disent encore Gmail** : le workflow s'appelle « Ainspiration - Contact Form
  (Gmail) » et ses nœuds « Gmail - Send to Owner » / « Gmail - Confirmation to User », alors
  qu'ils n'envoient plus par Gmail. Renommer suppose de refaire les connexions, qui sont
  référencées par nom — à faire proprement, pas au passage.

- **Le reste des workflows envoie toujours par la credential Gmail** : `Error trigger`,
  les trois workflows Audityo, les alertes VPS. Même incohérence d'expéditeur, même correctif
  possible.

- **`Source : website-contact-form`** dans le corps du mail interne, alors que le CRM reçoit
  `formulaire-ainspiration`. Sans conséquence, mais les deux devraient dire la même chose.

- **La demande initiale portait sur un alias, elle était sans objet.** `info@ainspiration.eu`
  est en **catch-all** : toute adresse `@ainspiration.eu` y tombe déjà, ce que les tests ont
  prouvé au passage. Zéro alias, zéro forwarder sur le domaine, aucun besoin d'en créer.
  C'est aussi ce qui explique que trois prospects aient écrit à `laurent.marechal@ainspiration.eu`
  en mai et juin.
