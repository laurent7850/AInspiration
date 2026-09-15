-- =====================================================
-- Migration 006 : provenance des contacts
-- =====================================================
-- Les fiches créées par l'ingestion (formulaires n8n, audit gratuit,
-- confirmation newsletter) portaient leur provenance uniquement dans la
-- description de l'activité : traçable à l'unité, incomptable en masse.
-- « D'où viennent mes prospects ? » est précisément la question que
-- l'ingestion doit rendre possible — il lui faut donc une colonne.
--
-- Nullable à dessein : les contacts saisis à la main dans le CRM n'ont pas
-- de provenance, et les fiches antérieures à cette migration n'en auront
-- jamais. NULL veut dire « inconnue », pas « aucune ».
--
-- Idempotente : rejouable sans risque.
-- =====================================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source TEXT;

-- Les rapports filtrent et regroupent par provenance.
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- =====================================================
-- Vérification après exécution : la colonne existe et reste nullable.
--
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'contacts' AND column_name = 'source';
--
-- Répartition des provenances une fois l'ingestion branchée :
--   SELECT COALESCE(source, '(saisie manuelle)') AS provenance, COUNT(*)
--     FROM contacts GROUP BY 1 ORDER BY 2 DESC;
-- =====================================================
