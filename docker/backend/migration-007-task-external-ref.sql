-- =====================================================
-- Migration 007 — référence externe sur les tâches
-- 2026-09-18
-- =====================================================
--
-- Les actions que Laurent doit mener lui-même étaient dispersées entre un
-- handoff, une note de journal et Notion : rien ne l'attendait à un endroit
-- qu'il ouvre de lui-même. Les sessions les déposent désormais dans le module
-- de tâches du CRM, via POST /api/service/tasks.
--
-- `external_ref` est la clé de dédoublonnage : une même action apparaît dans
-- plusieurs notes, elle ne doit créer qu'une seule tâche.
--
-- Idempotente : re-exécutable sans effet de bord. Le service `migration` du
-- compose rejoue TOUTES les migrations à chaque démarrage — et il avale les
-- erreurs (`2>/dev/null`), donc un échec ici serait silencieux. Vérifier la
-- colonne ET l'index par une requête après déploiement, ne pas s'y fier.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_ref TEXT;

-- Un seul index, partiel, et le WHERE est délibéré.
--
-- Il ne couvre que les tâches OUVERTES : si Laurent clôture une tâche et que
-- l'action revient plus tard, le `ref` est de nouveau libre et une NOUVELLE
-- tâche peut naître. Un index total interdirait ce retour et rendrait la
-- deuxième occurrence invisible — le mode de panne à éviter ici est le
-- silence, pas le doublon.
--
-- Les statuts fermés sont 'completed' et 'cancelled' (voir la contrainte
-- tasks_status_check, élargie par migration-001).
CREATE UNIQUE INDEX IF NOT EXISTS tasks_external_ref_open
  ON tasks (external_ref)
  WHERE external_ref IS NOT NULL AND status NOT IN ('completed', 'cancelled');

-- Lecture des tâches ouvertes d'un propriétaire : c'est la requête du hook
-- SessionStart, jouée à chaque ouverture de session.
CREATE INDEX IF NOT EXISTS tasks_assigned_open
  ON tasks (assigned_to)
  WHERE status NOT IN ('completed', 'cancelled');
