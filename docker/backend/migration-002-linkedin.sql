-- =====================================================
-- Migration 002: LinkedIn Auto-Publishing
-- =====================================================

-- Enable pg_trgm for similarity checking
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- LinkedIn OAuth tokens (encrypted)
-- =====================================================
CREATE TABLE IF NOT EXISTS linkedin_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT DEFAULT 'linkedin',
    subject_id TEXT NOT NULL,
    encrypted_token TEXT NOT NULL,
    scope TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    profile_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, subject_id)
);

-- =====================================================
-- LinkedIn posts archive
-- =====================================================
CREATE TABLE IF NOT EXISTS linkedin_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    hook TEXT,
    content TEXT NOT NULL,
    cta TEXT,
    hashtags TEXT[],
    service_tags TEXT[],
    theme_tags TEXT[],
    angle TEXT,
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'review_pending', 'approved', 'published', 'failed', 'queued', 'draft')),
    linkedin_post_id TEXT,
    linkedin_post_url TEXT,
    published_at TIMESTAMPTZ,
    similarity_score REAL,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LinkedIn settings (key-value JSONB)
-- =====================================================
CREATE TABLE IF NOT EXISTS linkedin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LinkedIn editorial prompts
-- =====================================================
CREATE TABLE IF NOT EXISTS linkedin_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON linkedin_posts(status);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created ON linkedin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_published ON linkedin_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_tokens_provider ON linkedin_tokens(provider, subject_id);

-- =====================================================
-- Default settings
-- =====================================================
INSERT INTO linkedin_settings (key, value) VALUES
    ('editorial_config', '{"max_length": 3000, "min_length": 200, "max_hashtags": 7, "min_hashtags": 3}'::jsonb),
    ('linkedin_config', '{"publish_enabled": false, "auto_publish": false, "manual_approval": true}'::jsonb),
    ('scheduling_config', '{"cron_day": "thursday", "cron_hour": 10, "cron_minute": 0, "timezone": "Europe/Brussels"}'::jsonb),
    ('content_angles', '["service_highlight", "client_problem", "social_proof", "seasonality", "ai_trend", "tip_of_week", "behind_scenes", "case_study", "industry_news", "question_engage"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Default editorial prompt
-- =====================================================
INSERT INTO linkedin_prompts (name, system_prompt, user_prompt, is_active, version) VALUES
(
    'AInspiration LinkedIn Post',
    'Tu es un expert en marketing digital et intelligence artificielle pour PME européennes.
Tu rédiges des posts LinkedIn professionnels pour AInspiration (ainspiration.eu), une entreprise belge spécialisée dans l''intégration de l''IA pour les PME.

Règles strictes :
- Écris en français professionnel mais accessible
- Utilise des émojis avec parcimonie (max 5)
- Commence par un hook accrocheur (1-2 lignes)
- Structure le post avec des sauts de ligne pour la lisibilité
- Termine par un CTA clair vers ainspiration.eu
- Inclus 3 à 7 hashtags pertinents
- Le post doit faire entre 200 et 3000 caractères
- Ton : expert mais empathique, pas commercial agressif
- Cible : dirigeants de PME en Belgique et France',

    'Génère un post LinkedIn pour AInspiration.

Angle du post : {{angle}}
Services à mettre en avant : {{services}}
Contexte saisonnier : {{season_context}}
Hooks récents (à éviter) : {{recent_hooks}}

Catalogue de services AInspiration :
- Audit IA gratuit : diagnostic personnalisé de maturité digitale
- Chatbot IA : assistant conversationnel pour site web
- Automatisation : workflows intelligents (CRM, emails, reporting)
- Formation IA : ateliers pratiques pour équipes
- Stratégie digitale : plan de transformation IA sur mesure
- Newsletter IA : création de contenu automatisé
- Analyse de données : tableaux de bord et prédictions IA

Réponds en JSON avec cette structure exacte :
{
  "title": "Titre interne du post",
  "hook": "Première ligne accrocheuse",
  "body": "Corps du post (avec \\n pour les sauts de ligne)",
  "cta": "Appel à l''action",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "service_tags": ["service1", "service2"],
  "theme_tags": ["theme1"],
  "hook_variants": ["variante1", "variante2"]
}',
    true,
    1
)
ON CONFLICT DO NOTHING;
