---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Soumettre une fois le formulaire d'audityo.eu depuis le navigateur et vérifier l'arrivée dans info@audityo.eu, désormais lisible par API
---

## Fait

La boîte `info@audityo.eu` est devenue lisible depuis une session, et c'est ce qui a permis
de regarder enfin le bout de chaîne que la note du 19/09 laissait dans le noir. Le montage
lui-même est hors dépôt — quatre serveurs MCP Hostinger en portée utilisateur, un token par
commande mail — et documenté dans `~/.claude/hostinger-mail-mcp.md`.

**Ce que contient la boîte.** Trois messages : le courriel de bienvenue Hostinger du 02/09,
et les deux tests du 15/09 (`Message de Test Diagnostic`, `Message de Recette Navigateur`).
Le corps du second est sans ambiguïté — « Nouveau message depuis le formulaire de contact
d'audityo.eu », tous les champs, signé `sent automatically with n8n`. Le relais a donc
fonctionné le 15 septembre.

**Mais cela ne referme pas la question du 19/09, et il faut le dire net.** Ces deux messages
sont **antérieurs** au nœud `IF` « Sonde ? », posé le 19/09. Ils prouvent que le relais
marchait avant la modification, pas que l'`IF` laisse passer les messages réels après. Et
comme **aucune soumission réelle n'est arrivée depuis le 15/09**, ce tronçon n'a jamais été
exercé dans sa configuration actuelle. La configuration publiée a été relue une fois de plus
(sens de la condition, `typeVersion: 2` **et** `conditions.options.version: 2`) : elle est
correcte. Mais relire une configuration n'est pas la même chose que voir un message arriver.

**La vraie trouvaille est ailleurs, et elle était plus grave.** Le workflow
`PeZexnxVbueaKV81` n'avait **aucun `errorWorkflow`** dans ses réglages, et
`saveDataErrorExecution: "none"`. Autrement dit : si le nœud Gmail échouait — credential
expirée, quota, erreur d'API — **rien n'alertait, et l'échec n'était même pas enregistré**.
Pas de mail, et rien à retrouver après coup dans la liste des exécutions. C'est le mode de
défaillance le plus probable des trois branches, et c'était le seul totalement aveugle.

Corrigé : `errorWorkflow: qoHCxT04kuGtqRf7` (l'`Error trigger` partagé) et
`saveDataErrorExecution: "all"`. Vérifié par l'audit d'instance — le workflow ne figure plus
parmi ceux sans gestion d'erreur.

**Un jeton dormant révoqué au passage.** `OAuth - laurent.marechal…CPHZ0gH9vF`, créé le
26/06, plus utilisé depuis le 23/07, doublon de celui du jour : reconnecter le connecteur
Hostinger en crée un nouveau **sans retirer l'ancien**. Contrôle après coup : 5 jetons → 4,
et le connecteur `distr-action.com` répond toujours 200.

**Les trois autres workflows Audityo actifs ont été rattachés dans la même foulée**, sur
accord de Laurent : `Password Reset`, `Waitlist Welcome`, `Stripe Payment Alert Relay`. Même
réglage, en conservant les réglages propres à chacun — celui de Stripe portait un
`callerPolicy` et un `availableInMCP` qu'il aurait été facile d'écraser en recopiant le jeu
de valeurs du formulaire de contact. Vérifié par l'audit d'instance : 5 workflows sans
gestion d'erreur → 2, et **les deux restants sont inactifs** (`Anthropic Healthcheck`, la
copie archivée `Luckybirdy`). Tous les workflows actifs de l'instance alertent désormais.

## Cassé

Rien. Le seul changement en production est un réglage de workflow n8n, sans toucher aux
nœuds ni aux connexions : le retour arrière est le réglage inverse.

## Reste

- **La question du 19/09 reste ouverte, dans ses termes exacts.** Il faut une soumission
  réelle du formulaire d'audityo.eu **postérieure au 19/09** pour prouver que l'`IF` ne
  jette rien. La lecture de la boîte, elle, n'est plus un obstacle.
- **Le contrôle hebdomadaire de bout en bout : conception arrêtée, un prérequis manque.**
  Laisser la sonde traverser jusqu'à la boîte **un jour par semaine** (le lundi), puis lire
  `info@audityo.eu` par l'API et y supprimer le message. L'élégance du montage est d'utiliser
  **la même adresse de sonde** : la purge CRM existante la couvre déjà, donc rien à changer
  côté backend, ni pollution de `LeadSourceChart`. Hebdomadaire et non quotidien, pour ne pas
  recréer le bruit que le filtre du 19/09 avait précisément supprimé. **Prérequis : un token
  de l'API Email d'audityo.eu en credential n8n** — à créer par Laurent dans hPanel, un token
  créé par API renverrait sa valeur dans une conversation.
- **Les gardes `IF` de ces trois workflows sont probablement inertes, et il ne faut PAS les
  « réparer » tels quels.** Leurs nœuds portent `typeVersion: 2` mais leur objet `conditions`
  **n'a aucun bloc `options`**, donc pas de `version: 2` : c'est exactement le piège documenté
  en section 5 du HANDOFF, où un `IF` v2 avec des conditions v1 laisse tout passer sans
  avertissement. Le `Sonde ?` du formulaire de contact, lui, porte bien les deux versions —
  d'où le contraste.
  - **`Password Reset` est le cas à ne surtout pas corriger à l'aveugle.** Sa condition sur le
    jeton est `^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$`, soit **deux** segments séparés par un point,
    alors qu'un JWT en compte **trois**. Si le garde se mettait à fonctionner, il rejetterait
    donc toutes les réinitialisations légitimes. Autrement dit : la fonction marche
    vraisemblablement *parce que* le garde est inerte. Corriger la version **sans** corriger la
    regex casserait la réinitialisation de mot de passe en production.
  - **`Stripe Payment Alert Relay` enverrait alors une alerte « Paiement échoué » pour
    n'importe quel événement Stripe**, et sa branche `Mark Received` ne tournerait jamais.
    Non observé : le workflow n'a **aucune exécution enregistrée**, le webhook n'a donc
    apparemment jamais été appelé. Test décisif désormais disponible, les exécutions en erreur
    étant conservées.
- **Le webhook Stripe n'a aucune authentification**, contrairement aux deux autres webhooks
  Audityo qui portent une `headerAuth`. Son champ `authentication` est simplement absent :
  quiconque connaît l'URL peut déclencher un mail d'alerte vers `divers@distr-action.com`.
  La baseline exige par ailleurs une **signature HMAC vérifiée** sur les webhooks Stripe
  entrants — il n'y a ni l'une ni l'autre. Non corrigé : cela demande un arbitrage, pas un
  réglage.
- Les formulaires AInspiration et Distr'Action, eux, sont bien rattachés à l'`Error trigger`.
- **Piège relevé :** le compteur `messages_used` de l'API d'administration mail est
  périodiquement synchronisé (`synced_at`) et **retarde**. Il annonçait 1 message là où la
  boîte en contenait 3. Pour un compte réel, lire les dossiers, pas l'usage.
