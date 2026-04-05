/**
 * Protocole "Audit Live" J+30 — AInspiration
 *
 * Processus de suivi 30 jours après la livraison de l'audit IA.
 * Objectifs : mesurer la satisfaction, tracker les KPIs, détecter
 * les opportunités d'upsell et réengager les prospects inactifs.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface SurveyQuestion {
  id: string;
  /** Texte de la question (FR) */
  question: string;
  /** Type de réponse attendu */
  type: 'rating_1_5' | 'rating_1_10' | 'multiple_choice' | 'open_text' | 'yes_no';
  /** Options pour les questions à choix multiples */
  options?: string[];
  /** La question est-elle obligatoire ? */
  required: boolean;
  /** Catégorie de la question */
  category: 'satisfaction' | 'impact' | 'intent' | 'feedback';
}

export interface KPIMeasurement {
  id: string;
  /** Nom du KPI */
  name: string;
  /** Description courte */
  description: string;
  /** Unité de mesure */
  unit: string;
  /** Comment collecter cette donnée */
  collectionMethod: 'survey' | 'automatic' | 'manual_check';
  /** Seuil indiquant un bon résultat */
  successThreshold: string;
  /** Seuil déclenchant une alerte */
  alertThreshold: string;
}

export interface UpsellSignal {
  id: string;
  /** Nom du signal */
  name: string;
  /** Condition de détection */
  trigger: string;
  /** Score de probabilité de conversion (1-10) */
  conversionScore: number;
  /** Action recommandée */
  recommendedAction: string;
  /** Offre suggérée */
  suggestedOffer: string;
}

export interface ReEngagementEmail {
  /** Objet de l'email */
  subject: string;
  /** Corps HTML de l'email */
  body: string;
  /** Condition d'envoi */
  sendCondition: string;
  /** Délai après J+30 si pas de réponse */
  followUpDelay: string;
}

export interface AuditLiveProtocol {
  /** Nom du protocole */
  name: string;
  /** Version */
  version: string;
  /** Déclencheur (nombre de jours après livraison de l'audit) */
  triggerDaysAfterDelivery: number;
  /** Étapes du protocole */
  steps: ProtocolStep[];
  /** Questions de l'enquête de satisfaction */
  surveyQuestions: SurveyQuestion[];
  /** KPIs à mesurer */
  kpiMeasurements: KPIMeasurement[];
  /** Signaux d'upsell à détecter */
  upsellSignals: UpsellSignal[];
  /** Email de réengagement */
  reEngagementEmail: ReEngagementEmail;
}

export interface ProtocolStep {
  /** Ordre de l'étape */
  order: number;
  /** Nom de l'étape */
  name: string;
  /** Description */
  description: string;
  /** Responsable */
  owner: 'system' | 'sales' | 'support';
  /** Délai d'exécution (relatif au déclenchement du protocole) */
  timing: string;
  /** Automatisable ? */
  automated: boolean;
}

// ---------------------------------------------------------------------------
// Données du protocole
// ---------------------------------------------------------------------------

export const auditLiveProtocol: AuditLiveProtocol = {
  name: 'Audit Live — Suivi J+30',
  version: '1.0',
  triggerDaysAfterDelivery: 30,

  // ── Étapes du protocole ─────────────────────────────────────────────────
  steps: [
    {
      order: 1,
      name: 'Envoi de l\'enquête de satisfaction',
      description:
        'Email automatique contenant le lien vers l\'enquête de satisfaction. L\'email rappelle les recommandations clés de l\'audit et invite le prospect à partager son retour d\'expérience.',
      owner: 'system',
      timing: 'J+30, 9h00',
      automated: true,
    },
    {
      order: 2,
      name: 'Analyse des réponses et scoring',
      description:
        'Le système collecte les réponses, calcule le score de satisfaction global et identifie les signaux d\'upsell. Les prospects avec un score >= 4/5 sont marqués comme "chauds".',
      owner: 'system',
      timing: 'J+30 à J+33 (dès réception de la réponse)',
      automated: true,
    },
    {
      order: 3,
      name: 'Mesure des KPIs',
      description:
        'Vérification manuelle ou automatique des indicateurs clés : le prospect a-t-il mis en place des recommandations ? A-t-il visité le site récemment ? A-t-il ouvert les emails précédents ?',
      owner: 'sales',
      timing: 'J+31 à J+33',
      automated: false,
    },
    {
      order: 4,
      name: 'Appel de suivi personnalisé',
      description:
        'Pour les prospects ayant répondu positivement (score >= 4/5) ou montrant des signaux d\'upsell : appel de 15 min pour discuter des prochaines étapes. Proposition du Pack Automatisation Express si pertinent.',
      owner: 'sales',
      timing: 'J+33 à J+35',
      automated: false,
    },
    {
      order: 5,
      name: 'Email de réengagement (si pas de réponse)',
      description:
        'Si aucune réponse à l\'enquête après 5 jours, envoi automatique de l\'email de réengagement avec une nouvelle proposition de valeur.',
      owner: 'system',
      timing: 'J+35',
      automated: true,
    },
    {
      order: 6,
      name: 'Clôture et archivage',
      description:
        'Mise à jour du CRM avec les résultats du protocole. Le prospect est classé : converti, en nurturing long terme, ou inactif.',
      owner: 'system',
      timing: 'J+40',
      automated: true,
    },
  ],

  // ── Enquête de satisfaction ─────────────────────────────────────────────
  surveyQuestions: [
    {
      id: 'sat_01',
      question: 'Comment évaluez-vous la qualité globale de votre audit IA ?',
      type: 'rating_1_5',
      required: true,
      category: 'satisfaction',
    },
    {
      id: 'sat_02',
      question: 'Les recommandations étaient-elles pertinentes pour votre activité ?',
      type: 'rating_1_5',
      required: true,
      category: 'satisfaction',
    },
    {
      id: 'sat_03',
      question: 'Avez-vous commencé à mettre en place une ou plusieurs recommandations de l\'audit ?',
      type: 'yes_no',
      required: true,
      category: 'impact',
    },
    {
      id: 'sat_04',
      question: 'Si oui, laquelle ou lesquelles ?',
      type: 'open_text',
      required: false,
      category: 'impact',
    },
    {
      id: 'sat_05',
      question: 'Avez-vous constaté un gain de temps ou d\'efficacité depuis l\'audit ?',
      type: 'multiple_choice',
      options: [
        'Oui, un gain significatif',
        'Oui, un petit gain',
        'Pas encore, mais c\'est en cours',
        'Non, je n\'ai pas encore agi',
        'Non, les recommandations ne me convenaient pas',
      ],
      required: true,
      category: 'impact',
    },
    {
      id: 'sat_06',
      question: 'Quel est votre principal frein pour passer à l\'action ?',
      type: 'multiple_choice',
      options: [
        'Manque de temps',
        'Manque de compétences techniques',
        'Budget limité',
        'Pas convaincu(e) du ROI',
        'J\'attends le bon moment',
        'Aucun frein, j\'ai déjà commencé',
      ],
      required: true,
      category: 'intent',
    },
    {
      id: 'sat_07',
      question: 'Seriez-vous intéressé(e) par un accompagnement pour implémenter les automatisations recommandées ?',
      type: 'multiple_choice',
      options: [
        'Oui, c\'est exactement ce qu\'il me faut',
        'Peut-être, j\'aimerais en savoir plus',
        'Pas pour le moment',
        'Non merci',
      ],
      required: true,
      category: 'intent',
    },
    {
      id: 'sat_08',
      question: 'Recommanderiez-vous l\'audit AInspiration à un confrère ou une connaissance ? (NPS)',
      type: 'rating_1_10',
      required: true,
      category: 'satisfaction',
    },
    {
      id: 'sat_09',
      question: 'Un commentaire ou une suggestion pour améliorer notre service ?',
      type: 'open_text',
      required: false,
      category: 'feedback',
    },
  ],

  // ── KPIs à mesurer ──────────────────────────────────────────────────────
  kpiMeasurements: [
    {
      id: 'kpi_01',
      name: 'Taux de réponse à l\'enquête',
      description: 'Pourcentage de prospects ayant complété l\'enquête de satisfaction J+30',
      unit: '%',
      collectionMethod: 'automatic',
      successThreshold: '>= 40%',
      alertThreshold: '< 20%',
    },
    {
      id: 'kpi_02',
      name: 'Score de satisfaction moyen',
      description: 'Moyenne des notes de satisfaction globale (question sat_01)',
      unit: '/5',
      collectionMethod: 'survey',
      successThreshold: '>= 4.0',
      alertThreshold: '< 3.0',
    },
    {
      id: 'kpi_03',
      name: 'NPS (Net Promoter Score)',
      description: 'Score NPS calculé à partir de la question sat_08',
      unit: 'score NPS',
      collectionMethod: 'survey',
      successThreshold: '>= 50',
      alertThreshold: '< 20',
    },
    {
      id: 'kpi_04',
      name: 'Taux de mise en action',
      description: 'Pourcentage de prospects ayant commencé à implémenter au moins une recommandation',
      unit: '%',
      collectionMethod: 'survey',
      successThreshold: '>= 30%',
      alertThreshold: '< 10%',
    },
    {
      id: 'kpi_05',
      name: 'Taux d\'intention d\'accompagnement',
      description: 'Pourcentage de prospects intéressés par un accompagnement (réponses positives à sat_07)',
      unit: '%',
      collectionMethod: 'survey',
      successThreshold: '>= 25%',
      alertThreshold: '< 10%',
    },
    {
      id: 'kpi_06',
      name: 'Taux de conversion Pack Express',
      description: 'Pourcentage de prospects J+30 convertis en clients Pack Automatisation Express',
      unit: '%',
      collectionMethod: 'manual_check',
      successThreshold: '>= 8%',
      alertThreshold: '< 3%',
    },
    {
      id: 'kpi_07',
      name: 'Taux d\'ouverture email J+30',
      description: 'Taux d\'ouverture de l\'email d\'enquête de satisfaction',
      unit: '%',
      collectionMethod: 'automatic',
      successThreshold: '>= 50%',
      alertThreshold: '< 25%',
    },
  ],

  // ── Signaux d'upsell ───────────────────────────────────────────────────
  upsellSignals: [
    {
      id: 'ups_01',
      name: 'Satisfaction élevée + intention forte',
      trigger: 'Score satisfaction >= 4/5 ET réponse sat_07 = "Oui, c\'est exactement ce qu\'il me faut"',
      conversionScore: 9,
      recommendedAction: 'Appel de suivi prioritaire dans les 24h avec proposition Pack Express',
      suggestedOffer: 'Pack Automatisation Express — 1 043 € HTVA (lancement) + 290 €/mois',
    },
    {
      id: 'ups_02',
      name: 'Action déjà engagée + besoin technique',
      trigger: 'Réponse sat_03 = "Oui" ET frein principal = "Manque de compétences techniques"',
      conversionScore: 8,
      recommendedAction: 'Proposer un appel technique gratuit de 30 min pour débloquer la situation',
      suggestedOffer: 'Pack Automatisation Express — 1 043 € HTVA (lancement) + 290 €/mois',
    },
    {
      id: 'ups_03',
      name: 'NPS promoteur',
      trigger: 'Score NPS >= 9/10',
      conversionScore: 7,
      recommendedAction: 'Demander un témoignage + proposer le programme de parrainage (10 % de réduction)',
      suggestedOffer: 'Pack Express avec réduction parrainage',
    },
    {
      id: 'ups_04',
      name: 'Intérêt modéré — demande d\'information',
      trigger: 'Réponse sat_07 = "Peut-être, j\'aimerais en savoir plus"',
      conversionScore: 5,
      recommendedAction: 'Envoyer un cas client du même secteur + proposer un appel sans engagement',
      suggestedOffer: 'Pack Automatisation Express — 1 043 € HTVA (lancement) + 290 €/mois',
    },
    {
      id: 'ups_05',
      name: 'Frein budget — timing potentiel',
      trigger: 'Frein principal = "Budget limité" ET satisfaction >= 3/5',
      conversionScore: 4,
      recommendedAction: 'Ajouter au nurturing long terme. Proposer le paiement en 3 fois si disponible.',
      suggestedOffer: 'Pack Express avec facilités de paiement',
    },
    {
      id: 'ups_06',
      name: 'Visite récurrente du site',
      trigger: 'Le prospect a visité ainspiration.eu >= 3 fois dans les 7 derniers jours (tracking analytics)',
      conversionScore: 7,
      recommendedAction: 'Email personnalisé avec rappel de l\'audit + proposition d\'appel',
      suggestedOffer: 'Pack Automatisation Express — 1 043 € HTVA (lancement) + 290 €/mois',
    },
  ],

  // ── Email de réengagement ───────────────────────────────────────────────
  reEngagementEmail: {
    subject: '{{prenom}}, votre audit IA — un mois après, où en êtes-vous ?',
    sendCondition: 'Aucune réponse à l\'enquête de satisfaction après 5 jours',
    followUpDelay: 'J+35 (5 jours après l\'envoi de l\'enquête)',
    body: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.7; max-width: 600px; margin: 0 auto; padding: 24px;">

  <p style="font-size: 16px;">Bonjour {{prenom}},</p>

  <p>
    Il y a un mois, vous avez reçu votre audit IA personnalisé pour <strong>{{entreprise}}</strong>.
    On voulait simplement prendre de vos nouvelles.
  </p>

  <p>
    On sait que le quotidien d'un entrepreneur belge ne laisse pas beaucoup de temps
    pour se pencher sur de nouveaux outils. C'est justement pour ça qu'on est là.
  </p>

  <p>Depuis votre audit, nous avons aidé plusieurs entreprises de votre secteur à :</p>

  <ul>
    <li>Gagner <strong>5 à 10 heures par semaine</strong> sur les tâches répétitives</li>
    <li>Réduire les erreurs manuelles de <strong>80 %</strong></li>
    <li>Améliorer leur réactivité client grâce à l'automatisation</li>
  </ul>

  <p>
    Si vous n'avez pas encore eu le temps de mettre en place les recommandations de votre audit,
    pas de souci — on peut le faire pour vous.
  </p>

  <div style="background: #f8f9fa; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 8px; font-weight: 700;">Une question rapide :</p>
    <p style="margin: 0;">
      Quel est le principal frein qui vous empêche d'avancer ?
      Répondez simplement à cet email — on vous orientera vers la meilleure solution.
    </p>
  </div>

  <p>
    Et si vous préférez en discuter de vive voix, on peut planifier un appel de 15 minutes :
  </p>

  <p style="text-align: center; margin: 24px 0;">
    <a href="{{lien_agenda}}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px;">
      Planifier un appel rapide
    </a>
  </p>

  <p>
    Dans tous les cas, votre audit reste valable et nos recommandations aussi.
    On est à votre disposition quand vous serez prêt(e).
  </p>

  <p>A bientôt,<br><strong>L'équipe AInspiration</strong></p>

  <p style="font-size: 12px; color: #888; margin-top: 32px;">
    AInspiration — Automatisation IA pour entreprises belges<br>
    <a href="https://ainspiration.eu" style="color: #3b82f6;">ainspiration.eu</a>
  </p>

</body>
</html>`,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retourne les questions filtrées par catégorie */
export function getQuestionsByCategory(
  category: SurveyQuestion['category'],
): SurveyQuestion[] {
  return auditLiveProtocol.surveyQuestions.filter((q) => q.category === category);
}

/** Retourne les signaux d'upsell triés par score de conversion décroissant */
export function getUpsellSignalsByPriority(): UpsellSignal[] {
  return [...auditLiveProtocol.upsellSignals].sort(
    (a, b) => b.conversionScore - a.conversionScore,
  );
}

/** Retourne les KPIs en alerte pour un jeu de données donné */
export function getKPIsInAlert(
  measurements: Record<string, number>,
): KPIMeasurement[] {
  return auditLiveProtocol.kpiMeasurements.filter((kpi) => {
    const value = measurements[kpi.id];
    if (value === undefined) return false;
    const threshold = parseFloat(kpi.alertThreshold.replace(/[^0-9.-]/g, ''));
    return kpi.alertThreshold.startsWith('<') ? value < threshold : value > threshold;
  });
}

/** Calcule le NPS à partir d'un tableau de scores (1-10) */
export function calculateNPS(scores: number[]): number {
  if (scores.length === 0) return 0;
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

/** Retourne les étapes du protocole triées par ordre */
export function getProtocolSteps(): ProtocolStep[] {
  return [...auditLiveProtocol.steps].sort((a, b) => a.order - b.order);
}
