/**
 * Service OpenRouter pour l'IA générative dans le CRM
 * Utilise GPT/Claude via OpenRouter pour des analyses intelligentes
 */

import { logger } from '@/config/environment';

// Proxy backend — la clé API est stockée côté serveur uniquement
const AI_PROXY_URL = '/api/ai/chat';

// Modèle par défaut - Claude 3 Haiku pour un bon rapport qualité/prix
const DEFAULT_MODEL = 'anthropic/claude-3-haiku';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Envoie une requête à OpenRouter
 */
async function sendToOpenRouter(
  messages: ChatMessage[],
  model: string = DEFAULT_MODEL
): Promise<string | null> {
  try {
    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    logger.error('Erreur OpenRouter:', error);
    return null;
  }
}

/**
 * Génère un email de relance personnalisé
 */
export async function generateFollowUpEmail(
  contactName: string,
  context: {
    opportunityName?: string;
    lastInteraction?: string;
    stage?: string;
    customContext?: string;
  }
): Promise<string | null> {
  const systemPrompt = `Tu es un assistant commercial expert en relation client B2B.
Tu rédiges des emails professionnels, concis et engageants en français.
Ton objectif est de relancer poliment le prospect tout en apportant de la valeur.
Ne jamais être insistant ou agressif. Toujours proposer une action concrète.`;

  let userPrompt = `Rédige un email de relance pour ${contactName}.`;

  if (context.opportunityName) {
    userPrompt += `\nOpportunité concernée: ${context.opportunityName}`;
  }
  if (context.stage) {
    userPrompt += `\nÉtape actuelle: ${context.stage}`;
  }
  if (context.lastInteraction) {
    userPrompt += `\nDernière interaction: ${context.lastInteraction}`;
  }
  if (context.customContext) {
    userPrompt += `\nContexte additionnel: ${context.customContext}`;
  }

  userPrompt += `\n\nL'email doit être court (max 150 mots), professionnel et terminer par une question ou proposition d'action.`;

  return sendToOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * Analyse une opportunité et génère des recommandations
 */
export async function analyzeOpportunityWithAI(
  opportunityData: {
    name: string;
    stage: string;
    value: number;
    daysInPipeline: number;
    contactName?: string;
    activityCount: number;
    lastActivityDate?: string;
  }
): Promise<{
  analysis: string;
  recommendations: string[];
  riskScore: number;
  nextBestAction: string;
} | null> {
  const systemPrompt = `Tu es un expert en analyse commerciale CRM.
Analyse les données d'opportunité et fournis:
1. Une analyse concise de la situation
2. 3 recommandations actionnables
3. Un score de risque de 0 à 100 (100 = très risqué)
4. La prochaine meilleure action à entreprendre

Réponds en JSON avec la structure: { "analysis": "", "recommendations": ["", "", ""], "riskScore": 0, "nextBestAction": "" }`;

  const userPrompt = `Analyse cette opportunité:
- Nom: ${opportunityData.name}
- Étape: ${opportunityData.stage}
- Valeur: ${opportunityData.value}€
- Jours dans le pipeline: ${opportunityData.daysInPipeline}
- Contact: ${opportunityData.contactName || 'Non défini'}
- Nombre d'activités: ${opportunityData.activityCount}
- Dernière activité: ${opportunityData.lastActivityDate || 'Aucune'}`;

  const response = await sendToOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  if (!response) return null;

  try {
    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    logger.error('Erreur parsing réponse IA:', e);
  }

  return null;
}

/**
 * Génère des insights généraux pour le dashboard
 */
export async function generateDashboardInsights(
  stats: {
    totalOpportunities: number;
    activeOpportunities: number;
    totalValue: number;
    wonValue: number;
    winRate: number;
    pendingTasks: number;
    overdueTasks: number;
    totalContacts: number;
  }
): Promise<string[] | null> {
  const systemPrompt = `Tu es un conseiller commercial IA pour un CRM.
Génère 3-4 insights pertinents et actionnables basés sur les statistiques.
Chaque insight doit être concis (max 20 mots) et orienté action.
Réponds en JSON: { "insights": ["insight1", "insight2", "insight3"] }`;

  const userPrompt = `Statistiques CRM actuelles:
- Opportunités totales: ${stats.totalOpportunities}
- Opportunités actives: ${stats.activeOpportunities}
- Valeur pipeline: ${stats.totalValue}€
- Valeur gagnée: ${stats.wonValue}€
- Taux de conversion: ${stats.winRate}%
- Tâches en attente: ${stats.pendingTasks}
- Tâches en retard: ${stats.overdueTasks}
- Contacts: ${stats.totalContacts}`;

  const response = await sendToOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  if (!response) return null;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights || null;
    }
  } catch (e) {
    logger.error('Erreur parsing insights:', e);
  }

  return null;
}

/**
 * Suggère un score de lead basé sur les données
 */
export async function suggestLeadScore(
  contactData: {
    name: string;
    company?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    source?: string;
    activityCount: number;
    opportunityValue: number;
    daysSinceLastActivity: number;
  }
): Promise<{
  score: number;
  reasoning: string;
  priority: 'hot' | 'warm' | 'cold';
} | null> {
  const systemPrompt = `Tu es un expert en qualification de leads B2B.
Évalue le potentiel du contact et attribue un score de 0 à 100.
Réponds en JSON: { "score": 0, "reasoning": "", "priority": "hot|warm|cold" }
- hot: score >= 70
- warm: score 40-69
- cold: score < 40`;

  const userPrompt = `Évalue ce lead:
- Nom: ${contactData.name}
- Entreprise: ${contactData.company || 'Non renseignée'}
- Poste: ${contactData.jobTitle || 'Non renseigné'}
- Email: ${contactData.email ? 'Oui' : 'Non'}
- Téléphone: ${contactData.phone ? 'Oui' : 'Non'}
- Source: ${contactData.source || 'Inconnue'}
- Activités: ${contactData.activityCount}
- Valeur opportunités: ${contactData.opportunityValue}€
- Jours depuis dernière activité: ${contactData.daysSinceLastActivity}`;

  const response = await sendToOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  if (!response) return null;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    logger.error('Erreur parsing lead score:', e);
  }

  return null;
}

/**
 * Génère une réponse à un message client
 */
export async function generateClientResponse(
  messageContext: {
    originalMessage: string;
    senderName: string;
    company?: string;
    previousInteractions?: string;
  }
): Promise<string | null> {
  const systemPrompt = `Tu es un assistant commercial professionnel.
Rédige une réponse appropriée au message du client.
La réponse doit être:
- Professionnelle et chaleureuse
- Concise (max 200 mots)
- Terminer par une proposition d'action claire
- En français`;

  const userPrompt = `Message reçu de ${messageContext.senderName}${messageContext.company ? ` (${messageContext.company})` : ''}:

"${messageContext.originalMessage}"

${messageContext.previousInteractions ? `\nContexte des interactions précédentes: ${messageContext.previousInteractions}` : ''}

Génère une réponse appropriée.`;

  return sendToOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}
