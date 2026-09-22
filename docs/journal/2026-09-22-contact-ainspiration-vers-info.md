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
  (« Distr-Action SRL »), source `formulaire-ainspiration`. Les cinq soumissions n'ont produit
  qu'une fiche — l'ingestion est idempotente sur l'email. Il n'existe pas de route de purge
  pour une fiche arbitraire, seule celle de la sonde Audityo l'est, et par conception.

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
