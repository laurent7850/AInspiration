---
date: 2026-09-19
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Soumettre une fois le formulaire de contact d'audityo.eu et vérifier que le message arrive bien dans info@audityo.eu
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

- **Le relais Gmail d'Audityo n'a pas pu être vérifié, et c'est le seul point ouvert.**
  Sur autorisation de Laurent, le nœud `IF` « Sonde ? » a finalement été posé et publié
  dans `PeZexnxVbueaKV81` : la sonde ne va plus jusqu'à `info@audityo.eu`. La
  configuration est vérifiée dans la version publiée, piège de version compris. Mais
  prouver que les messages **réels** passent encore demanderait de soumettre le vrai
  formulaire et de lire `info@audityo.eu` — je ne peux faire ni l'un ni l'autre. Un `IF`
  mal configuré les jetterait **en silence**, et la surveillance ne le verrait pas : elle
  contrôle la branche CRM, pas la branche Gmail. Tâche déposée
  (`handoff:ainspiration:verif-relais-mail-audityo`, échéance 21/09). Retour arrière d'un
  seul geste : rebrancher `Message valide ?` directement sur `Relayer vers la boîte`.
- **Le `responseMode` mal placé n'a pas été corrigé, délibérément** — seule la note du
  nœud qui affirmait le contraire l'a été. Le remettre au
  premier niveau ferait basculer un formulaire vivant en `lastNode` : la réponse HTTP
  deviendrait celle du dernier nœud et arriverait ~3 s plus tard. C'est une décision de
  produit, pas une correction de surveillance.
- Le workflow complet n'a pas pu être exécuté de bout en bout depuis la session : un
  déclencheur planifié ne s'appelle pas en HTTP, et le MCP instance-level de n8n n'est
  pas configuré. La première exécution réelle est celle de demain 6h15.
