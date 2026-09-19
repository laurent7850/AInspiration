---
date: 2026-09-19
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Ajouter le filtre « Sonde ? » au workflow Audityo PeZexnxVbueaKV81, pour que la sonde quotidienne cesse d'envoyer un mail à info@audityo.eu
---

## Fait

Le parcours de contact d'Audityo est désormais surveillé tous les jours à 6h15, par
l'effet réel et non par le code de statut.

**Pourquoi le code de statut ne valait rien.** Le paramètre `responseMode` du webhook
`audityo-contact` est posé **à l'intérieur de `options`**, alors que le nœud le lit au
premier niveau. Il est donc ignoré, et le mode effectif reste `onReceived` : le 200 part
avant la moindre exécution. C'est ce 200 qui est parti pendant six jours pendant que le
formulaire était muet. La note du nœud « CRM — Ingestion contact » affirme le contraire
(« ce webhook répond en mode lastNode ») — elle est fausse.

**Deux routes backend, sous `INGEST_SECRET`** (`docker/backend/routes/webhooks.js`), sur
le modèle de `/api/ingest/probe` posé le 16/09 :

| | |
|---|---|
| `GET /api/ingest/probe/audityo` | `{ exists, source, updated_at }` |
| `DELETE /api/ingest/probe/audityo` | `{ deleted, activities_deleted }` |

L'alternative — un nœud Postgres dans n8n — aurait donné au moniteur un compte capable
de supprimer n'importe quelle ligne de `contacts` pour surveiller un formulaire. C'est
exactement ce que la décision du 16/09 avait écarté : « la surveillance exigeait un accès
CRM complet pour lire une date ». L'adresse effacée est figée dans le code du backend et
n'est jamais prise dans la requête : la route de purge ne peut viser que cette fiche-là,
quoi qu'on lui envoie.

**Quatre nœuds ajoutés au workflow `ydW4SMHaeQQ58O4v`**, en série après « HTML brut du
blog » : `Sonde Audityo` (POST au webhook public, credential `Audityo-Contact-Webhook`)
→ `Laisser le CRM ecrire` (10 s) → `Relire la fiche Audityo` → `Purger la fiche Audityo`.
Le verdict exige trois choses, pas une : la fiche existe, elle date de moins de deux
minutes, et sa `source` vaut `formulaire-audityo`. Un échec de purge est signalé lui aussi.

**La fiche ne se garde pas**, contrairement à celle du parcours prospect. Elle porte
`source = 'formulaire-audityo'` — c'est tout l'intérêt, c'est exactement ce qu'écrit le
vrai formulaire — et compterait donc comme un prospect Audityo réel dans `LeadSourceChart`
et dans les rapports. La purge efface aussi les lignes d'`activities` qui la visent :
`entity_id` n'a pas de clé étrangère, elles resteraient orphelines et le flux d'activité
de l'administrateur recevrait un « Nouveau contact via formulaire-audityo » par jour.

Vérifié en production, bout en bout : écriture (`created: true`), relecture
(`source: formulaire-audityo`, date du jour), une trace d'activité en base, purge
(`deleted: 1, activities_deleted: 1`), puis plus rien — ni contact, ni activité, ni
société vide. 9 tests neufs dans `test/audityo-probe.test.mjs`, 143 au total, aucun échec.

## Cassé

Rien. Le conteneur a redémarré proprement (17 fichiers backend, 209 fichiers frontend),
après vérification que les 209 entrées du manifeste étaient bien servies par le CDN.

## Reste

- **La sonde enverra un mail par jour à `info@audityo.eu`.** Elle traverse le workflow
  Audityo en entier, boîte comprise. Le correctif tient en un nœud — un `IF` « Sonde ? »
  entre `Message valide ?` et `Relayer vers la boîte`, laissant passer tout ce qui n'est
  pas `sonde-audityo@surveillance.ainspiration.eu` — mais la modification de ce workflow
  m'a été refusée dans cette session. Sans elle, le canal devient du bruit qu'on apprend
  à ignorer, ce qui est précisément la panne qu'on cherche à éviter. **Déposé dans le CRM**
  (`handoff:ainspiration:sonde-audityo-filtre-mail`, échéance 21/09) : les opérations
  exactes y sont, Laurent le pose lui-même ou m'autorise à modifier ce workflow.
- **Le `responseMode` mal placé n'a pas été corrigé, délibérément.** Le remettre au
  premier niveau ferait basculer un formulaire vivant en `lastNode` : la réponse HTTP
  deviendrait celle du dernier nœud et arriverait ~3 s plus tard. C'est une décision de
  produit, pas une correction de surveillance.
- Le workflow complet n'a pas pu être exécuté de bout en bout depuis la session : un
  déclencheur planifié ne s'appelle pas en HTTP, et le MCP instance-level de n8n n'est
  pas configuré. La première exécution réelle est celle de demain 6h15.
