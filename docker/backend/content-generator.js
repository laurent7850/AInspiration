/**
 * LinkedIn Content Generator using OpenRouter AI
 */
const { v4: uuidv4 } = require('uuid');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';

const CONTENT_ANGLES = [
  'service_highlight',
  'client_problem',
  'social_proof',
  'seasonality',
  'ai_trend',
  'tip_of_week',
  'behind_scenes',
  'case_study',
  'industry_news',
  'question_engage'
];

const ANGLE_DESCRIPTIONS = {
  service_highlight: 'Mets en avant un service spécifique avec ses bénéfices concrets',
  client_problem: 'Pars d\'un problème courant des PME et montre comment l\'IA le résout',
  social_proof: 'Partage un résultat client ou une statistique de réussite',
  seasonality: 'Relie le contenu à la saison ou à l\'actualité du moment',
  ai_trend: 'Commente une tendance IA récente et son impact pour les PME',
  tip_of_week: 'Partage un conseil pratique et actionnable sur l\'IA en entreprise',
  behind_scenes: 'Montre les coulisses d\'AInspiration ou un projet en cours',
  case_study: 'Présente une étude de cas d\'un client (anonymisé si besoin)',
  industry_news: 'Commente une actualité du secteur IA/digital',
  question_engage: 'Pose une question engageante à l\'audience pour susciter l\'interaction'
};

const SERVICES = [
  { name: 'Audit IA gratuit', desc: 'Diagnostic personnalisé de maturité digitale pour PME' },
  { name: 'Chatbot IA', desc: 'Assistant conversationnel intelligent pour site web' },
  { name: 'Automatisation', desc: 'Workflows intelligents : CRM, emails, reporting automatisé' },
  { name: 'Formation IA', desc: 'Ateliers pratiques pour équipes sur les outils IA' },
  { name: 'Stratégie digitale', desc: 'Plan de transformation IA sur mesure pour PME' },
  { name: 'Newsletter IA', desc: 'Création et envoi de contenu automatisé' },
  { name: 'Analyse de données', desc: 'Tableaux de bord et prédictions par intelligence artificielle' }
];

function getSeasonContext() {
  const month = new Date().getMonth();
  const contexts = {
    0: 'Début d\'année : bonnes résolutions digitales, budget formation, nouveaux projets',
    1: 'Février : optimisation des processus, préparation du printemps commercial',
    2: 'Mars : fin Q1, bilan premier trimestre, ajustement stratégie digitale',
    3: 'Avril : renouveau printanier, nouvelles initiatives, événements sectoriels',
    4: 'Mai : préparation de l\'été, automatisation pour gérer la période creuse',
    5: 'Juin : mi-année, bilan semestriel, planification S2',
    6: 'Juillet : été, temps pour la réflexion stratégique et formation',
    7: 'Août : préparation rentrée, planification Q4',
    8: 'Septembre : rentrée, nouveaux projets, budget formation automne',
    9: 'Octobre : dernière ligne droite, projets avant fin d\'année',
    10: 'Novembre : Black Friday digital, préparation fin d\'année',
    11: 'Décembre : bilan annuel, préparation 2027, tendances IA à venir'
  };
  return contexts[month] || 'Contexte général : transformation digitale des PME';
}

/**
 * Select content angle, avoiding recently used ones
 */
async function selectAngle(pool) {
  const recent = await pool.query(`
    SELECT angle FROM linkedin_posts
    WHERE deleted_at IS NULL AND angle IS NOT NULL
    ORDER BY created_at DESC LIMIT 3
  `);
  const recentAngles = recent.rows.map(r => r.angle);

  const available = CONTENT_ANGLES.filter(a => !recentAngles.includes(a));
  if (available.length === 0) return CONTENT_ANGLES[Math.floor(Math.random() * CONTENT_ANGLES.length)];
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Select 1-2 random services to highlight
 */
function selectServices() {
  const shuffled = [...SERVICES].sort(() => 0.5 - Math.random());
  const count = Math.random() > 0.5 ? 2 : 1;
  return shuffled.slice(0, count);
}

/**
 * Get recent hooks to avoid repetition
 */
async function getRecentHooks(pool) {
  const result = await pool.query(`
    SELECT hook FROM linkedin_posts
    WHERE deleted_at IS NULL AND hook IS NOT NULL
    ORDER BY created_at DESC LIMIT 10
  `);
  return result.rows.map(r => r.hook);
}

/**
 * Get the active editorial prompt
 */
async function getActivePrompt(pool) {
  const result = await pool.query(`
    SELECT system_prompt, user_prompt FROM linkedin_prompts
    WHERE is_active = true
    ORDER BY version DESC LIMIT 1
  `);
  if (result.rows.length === 0) {
    throw new Error('No active LinkedIn editorial prompt found');
  }
  return result.rows[0];
}

/**
 * Call OpenRouter API for content generation
 */
async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ainspiration.eu',
      'X-Title': 'AInspiration LinkedIn Generator'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');

  return JSON.parse(content);
}

/**
 * Check similarity with recent posts
 */
async function checkSimilarity(pool, newContent) {
  const result = await pool.query(`
    SELECT MAX(similarity(content, $1)) as max_sim
    FROM linkedin_posts
    WHERE deleted_at IS NULL
    AND created_at > NOW() - INTERVAL '90 days'
    AND content IS NOT NULL
  `, [newContent]);

  return result.rows[0]?.max_sim || 0;
}

/**
 * Generate a LinkedIn post
 */
async function generatePost(pool) {
  const angle = await selectAngle(pool);
  const services = selectServices();
  const recentHooks = await getRecentHooks(pool);
  const seasonContext = getSeasonContext();
  const prompt = await getActivePrompt(pool);

  // Build user prompt with variables
  const userPrompt = prompt.user_prompt
    .replace('{{angle}}', `${angle} — ${ANGLE_DESCRIPTIONS[angle] || angle}`)
    .replace('{{services}}', services.map(s => `${s.name}: ${s.desc}`).join('\n'))
    .replace('{{season_context}}', seasonContext)
    .replace('{{recent_hooks}}', recentHooks.length > 0 ? recentHooks.join('\n') : 'Aucun post récent');

  // Generate content via AI
  const generated = await callOpenRouter(prompt.system_prompt, userPrompt);

  // Format full post text
  const fullText = formatPostText(generated);

  // Check similarity
  const similarityScore = await checkSimilarity(pool, fullText);

  // Get editorial config for manual approval setting
  const configResult = await pool.query(`SELECT value FROM linkedin_settings WHERE key = 'linkedin_config'`);
  const linkedinConfig = configResult.rows[0]?.value || { manual_approval: true };
  const status = linkedinConfig.manual_approval ? 'review_pending' : 'generated';

  // Save to database
  const id = uuidv4();
  await pool.query(`
    INSERT INTO linkedin_posts (id, title, hook, content, cta, hashtags, service_tags, theme_tags, angle, status, similarity_score)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    id,
    generated.title || '',
    generated.hook || '',
    fullText,
    generated.cta || '',
    generated.hashtags || [],
    generated.service_tags || [],
    generated.theme_tags || [],
    angle,
    status,
    similarityScore
  ]);

  return {
    id,
    title: generated.title,
    hook: generated.hook,
    content: fullText,
    hashtags: generated.hashtags,
    angle,
    status,
    similarityScore
  };
}

/**
 * Format the full post text from generated components
 */
function formatPostText(generated) {
  const parts = [];

  if (generated.hook) parts.push(generated.hook);
  if (generated.body) parts.push(generated.body);
  if (generated.cta) parts.push(generated.cta);

  let text = parts.join('\n\n');

  if (generated.hashtags && generated.hashtags.length > 0) {
    const tags = generated.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');
    text += '\n\n' + tags;
  }

  return text;
}

module.exports = { generatePost, formatPostText };
