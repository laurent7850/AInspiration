/**
 * Service d'intégration n8n pour le CRM intelligent
 * Permet d'envoyer des données au webhook n8n pour obtenir des insights IA
 */

import { Contact, Opportunity, Task, Activity } from '../utils/types';
import { logger } from '@/config/environment';

// Proxy backend — les webhooks n8n sont appelés via le serveur Express
const getWebhookUrl = () => '/api/webhook/crm';

export interface LeadScore {
  contactId: string;
  score: number; // 0-100
  factors: {
    engagement: number;
    recency: number;
    value: number;
    fit: number;
  };
  recommendation: string;
  priority: 'hot' | 'warm' | 'cold';
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'task' | 'contact' | 'general';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  relatedId?: string;
  createdAt: string;
}

export interface FollowUpSuggestion {
  contactId: string;
  contactName: string;
  reason: string;
  suggestedAction: string;
  suggestedDate: string;
  priority: 'high' | 'medium' | 'low';
  template?: string;
}

interface N8NPayload {
  action: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface N8NResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Envoie une requête au webhook n8n
 */
async function sendToN8N<T>(payload: N8NPayload): Promise<N8NResponse<T>> {
  try {
    const response = await fetch(getWebhookUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    logger.error('Erreur n8n:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Calcule le lead score pour un contact via n8n/IA
 */
export async function calculateLeadScore(
  contact: Contact,
  opportunities: Opportunity[],
  activities: Activity[]
): Promise<LeadScore | null> {
  const contactOpportunities = opportunities.filter(o => o.contact_id === contact.id);
  const contactActivities = activities.filter(a => a.related_to === contact.id);

  const response = await sendToN8N<LeadScore>({
    action: 'calculate_lead_score',
    data: {
      contact,
      opportunities: contactOpportunities,
      activities: contactActivities,
      activityCount: contactActivities.length,
      totalOpportunityValue: contactOpportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0),
      lastActivityDate: contactActivities.length > 0
        ? contactActivities.sort((a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )[0].created_at
        : null,
    },
    timestamp: new Date().toISOString(),
  });

  if (response.success && response.data) {
    return response.data;
  }

  // Fallback: calcul local basique si n8n n'est pas disponible
  return calculateLocalLeadScore(contact, contactOpportunities, contactActivities);
}

/**
 * Calcul local du lead score (fallback)
 */
function calculateLocalLeadScore(
  contact: Contact,
  opportunities: Opportunity[],
  activities: Activity[]
): LeadScore {
  // Score d'engagement basé sur les activités
  const engagementScore = Math.min(activities.length * 10, 25);

  // Score de récence basé sur la dernière activité
  let recencyScore = 0;
  if (activities.length > 0) {
    const lastActivity = activities.sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0];
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(lastActivity.created_at || 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyScore = Math.max(25 - daysSinceLastActivity, 0);
  }

  // Score de valeur basé sur les opportunités
  const totalValue = opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0);
  const valueScore = Math.min(totalValue / 1000, 25); // 1000€ = 25 points max

  // Score de fit basé sur les informations du contact
  let fitScore = 0;
  if (contact.company_id) fitScore += 10;
  if (contact.email) fitScore += 5;
  if (contact.phone) fitScore += 5;
  if (contact.job_title) fitScore += 5;
  fitScore = Math.min(fitScore, 25);

  const totalScore = engagementScore + recencyScore + valueScore + fitScore;

  let priority: 'hot' | 'warm' | 'cold';
  let recommendation: string;

  if (totalScore >= 70) {
    priority = 'hot';
    recommendation = 'Contact prioritaire - Planifier un appel cette semaine';
  } else if (totalScore >= 40) {
    priority = 'warm';
    recommendation = 'Contact prometteur - Envoyer une proposition personnalisée';
  } else {
    priority = 'cold';
    recommendation = 'Contact à nurturing - Inclure dans les campagnes email';
  }

  return {
    contactId: contact.id,
    score: Math.round(totalScore),
    factors: {
      engagement: engagementScore,
      recency: recencyScore,
      value: valueScore,
      fit: fitScore,
    },
    recommendation,
    priority,
  };
}

/**
 * Obtient les insights IA pour le dashboard
 */
export async function getAIInsights(
  opportunities: Opportunity[],
  tasks: Task[],
  contacts: Contact[]
): Promise<AIInsight[]> {
  const response = await sendToN8N<AIInsight[]>({
    action: 'get_ai_insights',
    data: {
      opportunities,
      tasks,
      contacts,
      stats: {
        totalOpportunities: opportunities.length,
        activeOpportunities: opportunities.filter(o => !['Gagné', 'Perdu'].includes(o.stage)).length,
        pendingTasks: tasks.filter(t => !t.completed).length,
        overdueTasks: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length,
        totalContacts: contacts.length,
      },
    },
    timestamp: new Date().toISOString(),
  });

  if (response.success && response.data) {
    return response.data;
  }

  // Fallback: générer des insights locaux basiques
  return generateLocalInsights(opportunities, tasks, contacts);
}

/**
 * Génère des insights locaux (fallback)
 */
function generateLocalInsights(
  opportunities: Opportunity[],
  tasks: Task[],
  contacts: Contact[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  // Insight: Opportunités à forte valeur en négociation
  const highValueNegotiations = opportunities.filter(
    o => o.stage === 'Négociation' && (o.estimated_value || 0) > 10000
  );
  if (highValueNegotiations.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-1`,
      type: 'opportunity',
      title: 'Opportunités à clôturer',
      description: `${highValueNegotiations.length} opportunité(s) de haute valeur en phase de négociation. Total: ${highValueNegotiations.reduce((s, o) => s + (o.estimated_value || 0), 0).toLocaleString('fr-FR')}€`,
      action: 'Prioriser le suivi de ces opportunités cette semaine',
      priority: 'high',
      createdAt: now.toISOString(),
    });
  }

  // Insight: Tâches en retard
  const overdueTasks = tasks.filter(
    t => !t.completed && t.due_date && new Date(t.due_date) < now
  );
  if (overdueTasks.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-2`,
      type: 'task',
      title: 'Tâches en retard',
      description: `${overdueTasks.length} tâche(s) en retard nécessitent votre attention`,
      action: 'Replanifier ou compléter ces tâches',
      priority: 'high',
      createdAt: now.toISOString(),
    });
  }

  // Insight: Contacts sans activité récente
  const inactiveContacts = contacts.filter(c => {
    // Simplification: considérer comme inactif si créé il y a plus de 30 jours
    const createdAt = new Date(c.created_at || 0);
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation > 30;
  });
  if (inactiveContacts.length > 5) {
    insights.push({
      id: `insight-${Date.now()}-3`,
      type: 'contact',
      title: 'Contacts à réactiver',
      description: `${inactiveContacts.length} contacts n'ont pas eu d'interaction récente`,
      action: 'Lancer une campagne de réengagement',
      priority: 'medium',
      createdAt: now.toISOString(),
    });
  }

  // Insight: Pipeline santé
  const activeOpps = opportunities.filter(o => !['Gagné', 'Perdu'].includes(o.stage));
  const qualificationOpps = opportunities.filter(o => o.stage === 'Qualification');
  if (activeOpps.length > 0 && qualificationOpps.length / activeOpps.length > 0.5) {
    insights.push({
      id: `insight-${Date.now()}-4`,
      type: 'general',
      title: 'Pipeline déséquilibré',
      description: 'Plus de 50% des opportunités sont en phase de qualification',
      action: 'Accélérer la qualification pour faire avancer le pipeline',
      priority: 'medium',
      createdAt: now.toISOString(),
    });
  }

  // Insight positif: Bon taux de conversion
  const closedOpps = opportunities.filter(o => ['Gagné', 'Perdu'].includes(o.stage));
  const wonOpps = opportunities.filter(o => o.stage === 'Gagné');
  if (closedOpps.length >= 5 && wonOpps.length / closedOpps.length > 0.3) {
    insights.push({
      id: `insight-${Date.now()}-5`,
      type: 'general',
      title: 'Excellent taux de conversion',
      description: `Taux de conversion de ${Math.round(wonOpps.length / closedOpps.length * 100)}% - au-dessus de la moyenne du secteur`,
      priority: 'low',
      createdAt: now.toISOString(),
    });
  }

  return insights;
}

/**
 * Obtient les suggestions de relance pour les contacts
 */
export async function getFollowUpSuggestions(
  contacts: Contact[],
  opportunities: Opportunity[],
  tasks: Task[],
  activities: Activity[]
): Promise<FollowUpSuggestion[]> {
  const response = await sendToN8N<FollowUpSuggestion[]>({
    action: 'get_followup_suggestions',
    data: {
      contacts,
      opportunities,
      tasks,
      activities,
    },
    timestamp: new Date().toISOString(),
  });

  if (response.success && response.data) {
    return response.data;
  }

  // Fallback: générer des suggestions locales
  return generateLocalFollowUpSuggestions(contacts, opportunities, tasks, activities);
}

/**
 * Génère des suggestions de relance locales (fallback)
 */
function generateLocalFollowUpSuggestions(
  contacts: Contact[],
  opportunities: Opportunity[],
  tasks: Task[],
  activities: Activity[]
): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = [];
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  contacts.forEach(contact => {
    const contactOpps = opportunities.filter(o => o.contact_id === contact.id);
    const contactActivities = activities.filter(a => a.related_to === contact.id);
    const contactTasks = tasks.filter(t => t.related_to === contact.id && !t.completed);

    // Ne pas suggérer si une tâche est déjà planifiée
    if (contactTasks.length > 0) return;

    const contactName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Contact';

    // Opportunité en négociation sans activité récente
    const negotiationOpp = contactOpps.find(o => o.stage === 'Négociation');
    if (negotiationOpp) {
      const lastActivity = contactActivities
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];

      const daysSinceActivity = lastActivity
        ? Math.floor((now.getTime() - new Date(lastActivity.created_at || 0).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceActivity > 3) {
        suggestions.push({
          contactId: contact.id,
          contactName,
          reason: `Opportunité "${negotiationOpp.name}" en négociation sans suivi depuis ${daysSinceActivity} jours`,
          suggestedAction: 'Appel de suivi pour faire avancer la négociation',
          suggestedDate: tomorrow.toISOString().split('T')[0],
          priority: 'high',
          template: `Bonjour ${contact.first_name || ''},\n\nJe me permets de vous recontacter concernant notre proposition. Avez-vous eu l'occasion de l'examiner ?\n\nJe reste disponible pour en discuter.\n\nCordialement`,
        });
        return;
      }
    }

    // Contact avec opportunité en proposition
    const propositionOpp = contactOpps.find(o => o.stage === 'Proposition');
    if (propositionOpp) {
      suggestions.push({
        contactId: contact.id,
        contactName,
        reason: `Proposition envoyée pour "${propositionOpp.name}"`,
        suggestedAction: 'Email de suivi pour recueillir les impressions',
        suggestedDate: nextWeek.toISOString().split('T')[0],
        priority: 'medium',
        template: `Bonjour ${contact.first_name || ''},\n\nJ'espère que vous avez bien reçu notre proposition. Je serais ravi d'avoir vos retours et de répondre à vos questions.\n\nBien cordialement`,
      });
      return;
    }

    // Contact sans activité depuis longtemps
    if (contactActivities.length === 0 && contact.created_at) {
      const daysSinceCreation = Math.floor(
        (now.getTime() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreation > 14 && daysSinceCreation < 90) {
        suggestions.push({
          contactId: contact.id,
          contactName,
          reason: `Aucune interaction depuis la création du contact (${daysSinceCreation} jours)`,
          suggestedAction: 'Email de prise de contact initial',
          suggestedDate: nextWeek.toISOString().split('T')[0],
          priority: 'low',
        });
      }
    }
  });

  // Limiter à 10 suggestions maximum
  return suggestions
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 10);
}

/**
 * Envoie un événement CRM à n8n pour traitement
 */
export async function trackCRMEvent(
  eventType: 'opportunity_created' | 'opportunity_stage_changed' | 'task_completed' | 'contact_created' | 'deal_won' | 'deal_lost',
  data: Record<string, unknown>
): Promise<void> {
  await sendToN8N({
    action: 'track_event',
    data: {
      eventType,
      ...data,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Demande une analyse IA d'une opportunité spécifique
 */
export async function analyzeOpportunity(
  opportunity: Opportunity,
  contact: Contact | null,
  activities: Activity[]
): Promise<{ analysis: string; recommendations: string[]; riskLevel: 'low' | 'medium' | 'high' }> {
  const response = await sendToN8N<{ analysis: string; recommendations: string[]; riskLevel: 'low' | 'medium' | 'high' }>({
    action: 'analyze_opportunity',
    data: {
      opportunity,
      contact,
      activities: activities.filter(a => a.related_to === opportunity.id),
    },
    timestamp: new Date().toISOString(),
  });

  if (response.success && response.data) {
    return response.data;
  }

  // Fallback: analyse basique locale
  const daysSinceCreation = opportunity.created_at
    ? Math.floor((Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const recommendations: string[] = [];

  if (daysSinceCreation > 60 && opportunity.stage === 'Qualification') {
    riskLevel = 'high';
    recommendations.push('Opportunité stagnante - envisager une relance directe ou une disqualification');
  } else if (daysSinceCreation > 30 && opportunity.stage !== 'Gagné') {
    riskLevel = 'medium';
    recommendations.push('Accélérer le processus de vente');
  }

  if (!contact) {
    recommendations.push('Ajouter un contact principal à cette opportunité');
  }

  if (opportunity.stage === 'Négociation' && !opportunity.close_date) {
    recommendations.push('Définir une date de clôture prévisionnelle');
  }

  return {
    analysis: `Opportunité ${opportunity.name} en phase ${opportunity.stage} depuis ${daysSinceCreation} jours.`,
    recommendations: recommendations.length > 0 ? recommendations : ['Opportunité en bonne voie'],
    riskLevel,
  };
}
