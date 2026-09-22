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
- **Trois autres workflows Audityo ACTIFS n'ont aucune gestion d'erreur** (audit d'instance) :
  `Audityo — Password Reset`, `Audityo — Waitlist Welcome`,
  `Audityo - Stripe Payment Alert Relay`. Même défaut, même correctif d'une ligne. Le premier
  est le plus coûteux : un utilisateur qui ne peut pas réinitialiser son mot de passe, et
  personne ne le sait. **Non corrigés, en attente de l'accord de Laurent** — c'était hors du
  périmètre demandé. Les formulaires AInspiration et Distr'Action, eux, sont bien rattachés.
- **Piège relevé :** le compteur `messages_used` de l'API d'administration mail est
  périodiquement synchronisé (`synced_at`) et **retarde**. Il annonçait 1 message là où la
  boîte en contenait 3. Pour un compte réel, lire les dossiers, pas l'usage.
