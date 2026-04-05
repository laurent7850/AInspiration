/**
 * Contenu LinkedIn — Promotion de l'audit IA gratuit — AInspiration
 *
 * 5 posts ciblant chacun un secteur différent du marché belge.
 * Chaque post redirige vers ainspiration.eu/audit.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LinkedInSector =
  | 'comptabilite'
  | 'restaurant_horeca'
  | 'ecommerce'
  | 'agence_marketing'
  | 'artisans_independants';

export interface LinkedInPost {
  /** Identifiant du secteur cible */
  sector: LinkedInSector;
  /** Libellé lisible du secteur */
  sectorLabel: string;
  /** Contenu du post (texte brut avec emojis et sauts de ligne) */
  content: string;
  /** Hashtags suggérés */
  hashtags: string[];
  /** Nombre de mots approximatif */
  wordCount: number;
}

// ---------------------------------------------------------------------------
// Données
// ---------------------------------------------------------------------------

export const linkedinPosts: LinkedInPost[] = [
  // ── 1. Comptabilité / Expertise comptable ───────────────────────────────
  {
    sector: 'comptabilite',
    sectorLabel: 'Comptabilité / Expertise comptable',
    hashtags: ['#Comptabilité', '#AutomatisationIA', '#ExpertComptable', '#DigitalBelgique', '#AInspiration', '#Productivité'],
    wordCount: 195,
    content: `🧮 Chers experts-comptables, combien d'heures par semaine perdez-vous sur des tâches qui ne demandent aucune expertise ?

Encodage de factures. Relances de paiement. Classification de documents. Compilation de rapports.

Ce ne sont pas des tâches « à faible valeur ». Ce sont des tâches qui n'ont plus besoin de vous.

En 2026, un cabinet comptable belge peut automatiser jusqu'à 40 % de ces processus répétitifs grâce à l'intelligence artificielle — sans changer de logiciel, sans recruter.

Le résultat ?
✅ Plus de temps pour le conseil stratégique
✅ Moins d'erreurs d'encodage
✅ Des collaborateurs qui se concentrent sur ce qui compte

Chez AInspiration, nous aidons les cabinets comptables à identifier précisément quelles tâches automatiser en premier.

Comment ? Avec un audit IA gratuit et personnalisé.

En 48h, vous recevez un rapport clair :
→ Les processus à automatiser en priorité
→ Le temps que vous allez récupérer
→ Un plan d'action concret

Pas de jargon technique. Pas d'engagement.

🎯 Faites votre audit gratuit maintenant :
👉 ainspiration.eu/audit

Votre cabinet mérite de travailler plus intelligemment.`,
  },

  // ── 2. Restaurant / Horeca ──────────────────────────────────────────────
  {
    sector: 'restaurant_horeca',
    sectorLabel: 'Restaurant / Horeca',
    hashtags: ['#Horeca', '#Restaurant', '#AutomatisationIA', '#GestionRestaurant', '#AInspiration', '#DigitalHoreca'],
    wordCount: 210,
    content: `🍽️ Gérer un restaurant en 2026, c'est jongler entre les réservations, les avis Google, les stocks, les réseaux sociaux et… les clients assis devant vous.

Et si une partie de cette charge mentale disparaissait ?

Imaginez :
📲 Les réservations se gèrent toutes seules (même à 23h)
⭐ Les demandes d'avis Google partent automatiquement après chaque service
📦 Vos commandes fournisseurs se déclenchent quand le stock atteint un seuil
📱 Vos posts Instagram et Facebook se planifient sans y penser

Ce n'est pas de la science-fiction. C'est de l'automatisation intelligente, adaptée au rythme de l'horeca.

Chez AInspiration, nous comprenons la réalité du terrain. Pas de solutions génériques : des automatisations pensées pour votre établissement.

Et tout commence par un audit IA gratuit.

En quelques questions, on analyse votre fonctionnement et vous recevez sous 48h :
→ Vos 3 plus gros gaspillages de temps identifiés
→ Les automatisations adaptées à votre taille
→ Une estimation du temps récupéré chaque semaine

C'est gratuit, rapide et sans engagement.

🎯 Passez à l'action :
👉 ainspiration.eu/audit

Votre cuisine mérite toute votre attention. Le reste, on s'en occupe.`,
  },

  // ── 3. E-commerce ───────────────────────────────────────────────────────
  {
    sector: 'ecommerce',
    sectorLabel: 'E-commerce',
    hashtags: ['#Ecommerce', '#AutomatisationIA', '#VenteEnLigne', '#ShopifyBelgique', '#AInspiration', '#GrowthHacking'],
    wordCount: 205,
    content: `🛒 Vous gérez un e-commerce et vous avez l'impression de courir en permanence ?

Mises à jour de stock. Emails de relance de panier abandonné. Réponses au SAV. Synchronisation des marketplaces. Suivi des retours.

Chacune de ces tâches peut être automatisée — et devrait l'être.

Les e-commerçants qui grandissent en 2026 ne travaillent pas plus. Ils automatisent mieux.

Quelques exemples concrets :
🔄 Synchronisation automatique des stocks entre votre boutique et les marketplaces
📧 Séquences email post-achat personnalisées sans intervention manuelle
🤖 Chatbot qui gère 80 % des questions SAV courantes
📊 Tableaux de bord qui se mettent à jour en temps réel

Résultat : vous passez moins de temps sur l'opérationnel et plus sur la stratégie qui fait vraiment croître votre chiffre d'affaires.

Chez AInspiration, nous aidons les e-commerçants belges à identifier les automatisations les plus rentables pour leur business.

Notre audit IA gratuit vous donne en 48h :
→ Une cartographie de vos processus automatisables
→ Le ROI estimé de chaque automatisation
→ Un plan d'implémentation priorisé

🎯 Demandez votre audit gratuit :
👉 ainspiration.eu/audit

Scalez sans multiplier les heures.`,
  },

  // ── 4. Agence marketing ─────────────────────────────────────────────────
  {
    sector: 'agence_marketing',
    sectorLabel: 'Agence marketing',
    hashtags: ['#AgenceMarketing', '#AutomatisationIA', '#MarketingDigital', '#Productivité', '#AInspiration', '#MarTech'],
    wordCount: 200,
    content: `📢 Vous dirigez une agence marketing et vos équipes passent plus de temps à reporter qu'à créer ?

Compilation de KPIs depuis 5 plateformes. Screenshots de dashboards. Copier-coller entre outils. Envoi manuel de rapports clients chaque lundi.

Soyons honnêtes : ce n'est pas pour ça que vos talents ont rejoint votre agence.

L'IA et l'automatisation permettent aujourd'hui de :
📊 Générer des rapports clients automatiquement chaque semaine
✍️ Produire des premiers jets de contenu en quelques minutes
🔗 Connecter tous vos outils (CRM, analytics, social media) sans code
📋 Automatiser le suivi de projet et les relances internes

Les agences qui adoptent ces outils libèrent 10 à 15 heures par collaborateur et par semaine.

Chez AInspiration, nous travaillons spécifiquement avec des agences marketing en Belgique. On connaît vos outils, vos contraintes et vos objectifs.

Notre audit IA gratuit vous montre exactement où agir en premier.

En 48h, vous recevez :
→ Les tâches à automatiser en priorité dans votre agence
→ Les outils IA adaptés à votre stack actuel
→ Un plan d'action réaliste

🎯 C'est par ici :
👉 ainspiration.eu/audit

Créez plus. Reportez moins.`,
  },

  // ── 5. Artisans / Indépendants ──────────────────────────────────────────
  {
    sector: 'artisans_independants',
    sectorLabel: 'Artisans / Indépendants',
    hashtags: ['#Indépendant', '#Artisan', '#AutomatisationIA', '#EntrepreneurBelge', '#AInspiration', '#GagnerDuTemps'],
    wordCount: 210,
    content: `🔧 Vous êtes indépendant ou artisan et vous passez vos soirées sur l'administratif au lieu de profiter de votre famille ?

Devis. Factures. Relances. Plannings. Réseaux sociaux. Réponses aux demandes de devis.

Quand on est seul ou en petite équipe, chaque heure compte double. Et trop d'heures partent dans des tâches qui pourraient tourner toutes seules.

En 2026, l'automatisation n'est plus réservée aux grandes entreprises. Un artisan ou un indépendant belge peut aujourd'hui :

📝 Envoyer des devis professionnels en 2 clics depuis son téléphone
💰 Automatiser ses factures et relances de paiement
📅 Laisser ses clients réserver directement dans son agenda
⭐ Recevoir des avis Google sans devoir y penser

Pas besoin d'être un expert en technologie. Il suffit de savoir où commencer.

C'est exactement ce que notre audit IA gratuit vous apporte.

En répondant à quelques questions simples, vous recevez sous 48h :
→ Les 2-3 tâches qui vous font perdre le plus de temps
→ Des solutions concrètes adaptées à votre budget
→ Une estimation du temps que vous allez récupérer

C'est gratuit et ça prend 5 minutes.

🎯 Faites le test :
👉 ainspiration.eu/audit

Votre métier, c'est votre passion. L'admin, c'est notre problème.`,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retourne le post LinkedIn pour un secteur donné */
export function getPostBySector(sector: LinkedInSector): LinkedInPost | undefined {
  return linkedinPosts.find((p) => p.sector === sector);
}

/** Retourne le contenu formaté avec les hashtags en fin de post */
export function formatPostWithHashtags(post: LinkedInPost): string {
  return `${post.content}\n\n${post.hashtags.join(' ')}`;
}
