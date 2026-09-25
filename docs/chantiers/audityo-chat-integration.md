# Audityo — brancher le chatbot sur le site

> **Le cerveau est construit, branché et ACTIF** : workflow n8n `Audityo — Chat (EU AI Act)`
> (`rdqUmTQThti94POA`), créé, validé sans erreur et mis en service le 25/09/2026 depuis une
> session AInspiration. Credential `OpenRouter-Audityo-Prod` attachée (1 $/jour, `daily`).
> Conversations réelles vérifiées.
>
> Ce qui reste — le **widget sur audityo.eu** — appartient au dépôt Audityo, donc à une
> session Audityo.

## Le contrat de l'API

**Endpoint** — `POST https://n8n.srv767464.hstgr.cloud/webhook/audityo-chat`

Requête :

```json
{ "chatInput": "on utilise ChatGPT dans l'équipe, on est concernés ?",
  "sessionId": "<identifiant stable par visiteur>" }
```

`sessionId` sert la mémoire conversationnelle (fenêtre glissante). Un UUID stocké en
`sessionStorage` suffit. À défaut, le workflow en fabrique un par exécution — la conversation
perd alors le fil entre deux messages.

Réponse :

```json
{ "message": "…", "category": "categories|calendrier|sanctions|methode|tarifs|champ-application|general",
  "intent": "information|achat|support|exploration", "topic": "…",
  "suggested_action": "prediag|attente|textes|contact|null",
  "action_buttons": [{ "type": "link", "label": "⚡ Pré-diagnostic en 30 secondes",
                       "url": "https://audityo.eu/?prediag#liste-attente" }],
  "output": "…" }
```

`action_buttons` vaut `null` quand aucune action n'est suggérée. Le widget d'AInspiration
(`src/components/ChatbotN8n.tsx`) consomme exactement cette forme — c'est le modèle le plus
court à reprendre.

**CORS** : le nœud de réponse renvoie `Access-Control-Allow-Origin: https://audityo.eu`.
Si le widget est testé depuis un autre domaine, l'ajouter là.

## Ce qui est déjà garanti côté n8n

- **Le blog est lu à chaque message** sur `https://audityo.eu/api/blog` (18 articles) et les
  plus proches de la question sont injectés avec leur URL. Rien à tenir à jour.
- Nœud HTTP en `continueRegularOutput` et code en `try/catch` : blog injoignable = réponse
  dégradée, jamais d'erreur au visiteur.
- Déballage tolérant du JSON, même quand le modèle l'encadre de balises de code.
- `errorWorkflow` branché sur `qoHCxT04kuGtqRf7`, erreurs enregistrées.

## Les garde-fous du prompt, et pourquoi ils sont là

Le sujet est réglementaire : les règles ne sont pas cosmétiques.

1. **Aucun conseil juridique.** Le bot explique ce que dit le règlement, jamais ce que le
   visiteur doit faire. Formule de repli reprise du pied de page du site.
2. **Aucune classification du système d'un visiteur.** Établir un niveau suppose un
   inventaire — c'est le produit. Le bot peut dire ce qui *semble* concerné, en précisant que
   seul l'inventaire tranche.
3. **Audityo n'est pas ouvert.** La grille (49 / 199 / 499 €) est annoncée comme *prévue à
   l'ouverture*, avec « rien n'est facturé à ce jour » à chaque mention. **Aucune date
   d'ouverture n'est promise.**
4. **Jamais de tarif dans la première réponse** — mais réponse franche dès qu'on en demande un.
5. Les articles, seuils et dates viennent tous de la page d'accueil, relevés le 25/09/2026 :
   les quatre catégories (art. 5, annexe III, art. 50, considérant 165), le calendrier
   (art. 113 modifié par le règlement (UE) 2026/1744) et les sanctions (art. 99 §§ 3 à 5).

⚠️ **Si le site change ses tarifs, ses dates ou sa grille, le prompt ne le saura pas.** Seuls
le blog et les liens sont dynamiques. C'est le seul point de synchronisation manuelle — à
vérifier lors de l'ouverture commerciale.

## Éprouvé le 25/09 sur six questions

| Question | Réponse |
|---|---|
| « on utilise ChatGPT dans l'équipe, on est concernés ? » | explique la règle du déployeur, **refuse de trancher le niveau**, oriente vers le pré-diagnostic |
| « vous avez écrit sur la documentation technique ? » | cite **deux articles réels**, URL vérifiées en 200 |
| « c'est combien ? » | donne la grille **et** « rien n'est facturé à ce jour » |
| « vous ouvrez quand ? » | **aucune date**, propose la liste d'attente |
| « confirmez-moi par écrit que mon scoring est à haut risque » | **refuse**, explique qu'un niveau suppose un inventaire |
| « les obligations haut risque s'appliquent déjà ? » | « non, pas encore — reportées au 2 décembre 2027 » |

⚠️ **Une erreur de temps a dû être corrigée** : il annonçait d'abord « haut risque **depuis**
le 2 décembre 2027 », une date future. Sur un produit de conformité, une échéance présentée
comme déjà applicable est une faute. Le prompt porte désormais la date du jour et une consigne
explicite : jamais « depuis » pour une échéance à venir.

## Reste à faire

**Session Audityo** : reprendre `ChatbotN8n.tsx` d'AInspiration, changer l'URL du webhook,
adapter l'habillage. Le contrat d'API ci-dessus est le seul point de contact.

## Un point de sécurité à trancher, pas à oublier

Le webhook est **public et sans authentification**, comme ceux des deux autres chatbots : un
secret placé dans un widget de navigateur n'est pas un secret. La vraie protection est le
**rate limiting au niveau de Traefik**, qui n'est posé sur aucun des trois. Un visiteur mal
intentionné peut aujourd'hui consommer le plafond journalier de la clé en boucle.

Le plafond de 1 $/jour borne la casse — c'est exactement à cela qu'il sert — mais il borne en
coupant le service. À arbitrer avant d'ouvrir commercialement.

---

## Le composant, prêt à coller

> Écrit ici et **non dans le dépôt Audityo** : une session ne travaille que dans le dépôt où
> elle est enracinée. À coller dans `Audityo/` depuis une session Audityo, puis à habiller
> selon le design du site — la logique, elle, est complète et respecte le contrat ci-dessus.

`components/ChatAudityo.tsx` :

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

const WEBHOOK = 'https://n8n.srv767464.hstgr.cloud/webhook/audityo-chat';

type Bouton = { type: string; label: string; url: string };
type Message = { role: 'moi' | 'elle'; texte: string; boutons?: Bouton[] };

// L'identifiant de session porte la mémoire conversationnelle côté n8n.
// sessionStorage suffit : il meurt avec l'onglet, ce qui est le bon périmètre
// pour une conversation, et n'a pas besoin de consentement cookie.
function identifiantSession() {
  try {
    const cle = 'audityo-chat-session';
    let v = sessionStorage.getItem(cle);
    if (!v) {
      v = crypto.randomUUID();
      sessionStorage.setItem(cle, v);
    }
    return v;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2);
  }
}

export default function ChatAudityo() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, enCours]);

  async function envoyer(e?: React.FormEvent) {
    e?.preventDefault();
    const texte = saisie.trim();
    if (!texte || enCours) return;

    setMessages((m) => [...m, { role: 'moi', texte }]);
    setSaisie('');
    setEnCours(true);
    setErreur(null);

    // Le webhook est derrière un rate limiting Traefik (20 req/min par IP).
    // Un 429 n'est pas une panne : c'est la protection qui fait son travail.
    const minuteur = AbortSignal.timeout(30000);
    try {
      const r = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: texte, sessionId: identifiantSession() }),
        signal: minuteur,
      });

      if (r.status === 429) {
        setErreur('Un peu trop de messages d’un coup. Réessayez dans une minute.');
        return;
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);

      const d = await r.json();
      setMessages((m) => [
        ...m,
        {
          role: 'elle',
          texte: d.message || 'Je n’ai pas pu répondre. Reformulez-vous ?',
          boutons: d.action_buttons || undefined,
        },
      ]);
    } catch {
      setErreur('La réponse n’est pas arrivée. Réessayez, ou écrivez-nous.');
    } finally {
      setEnCours(false);
    }
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        aria-label="Ouvrir l’assistant Audityo"
        className="fixed bottom-6 right-6 rounded-full px-5 py-3 shadow-lg"
      >
        Une question sur l’AI Act ?
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Assistant Audityo"
      className="fixed bottom-6 right-6 flex h-[32rem] w-[22rem] flex-col rounded-2xl border shadow-xl"
    >
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-medium">Assistant Audityo</span>
        <button onClick={() => setOuvert(false)} aria-label="Fermer">×</button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <p className="opacity-70">
            Posez votre question sur le règlement européen sur l’IA, ou sur ce que produit
            Audityo.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'moi' ? 'text-right' : ''}>
            <p className="inline-block whitespace-pre-wrap rounded-xl px-3 py-2">{m.texte}</p>
            {m.boutons?.map((b) => (
              <a
                key={b.url}
                href={b.url}
                className="mt-2 block rounded-lg border px-3 py-2 text-center"
              >
                {b.label}
              </a>
            ))}
          </div>
        ))}
        {enCours && <p className="opacity-60">…</p>}
        {erreur && <p role="alert">{erreur}</p>}
        <div ref={finRef} />
      </div>

      <form onSubmit={envoyer} className="flex gap-2 border-t p-3">
        <input
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Votre question…"
          aria-label="Votre question"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          disabled={enCours}
        />
        <button type="submit" disabled={enCours || !saisie.trim()} aria-label="Envoyer">
          →
        </button>
      </form>

      <p className="px-4 pb-3 text-xs opacity-60">
        Informations fournies à titre indicatif ; elles ne constituent pas un conseil juridique.
      </p>
    </div>
  );
}
```

### Trois points à ne pas retirer en l'habillant

1. **La mention de bas de bloc** — *« ne constituent pas un conseil juridique »*. Elle reprend
   le pied de page du site et couvre l'usage conversationnel, où le visiteur pose des
   questions bien plus précises que sur une page.
2. **Le traitement du 429.** Le webhook est derrière un rate limiting Traefik (20 requêtes par
   minute et par IP, C37). Un 429 n'est pas une panne, c'est la protection qui agit — le dire
   au visiteur plutôt que lui montrer une erreur technique.
3. **`sessionStorage`, pas `localStorage`.** La conversation meurt avec l'onglet : c'est le
   bon périmètre, et ça évite la question du consentement cookie sur un site qui parle de
   conformité.

### Vérification une fois posé

- une conversation complète, avec une question de suivi, pour éprouver la mémoire ;
- un lien d'article cliqué, pour vérifier qu'il ouvre bien une page existante ;
- la console réseau : `Access-Control-Allow-Origin` doit valoir `https://audityo.eu`. Si le
  widget est servi depuis un autre domaine, ajouter cette origine au nœud
  `Respond to Webhook` du workflow.
