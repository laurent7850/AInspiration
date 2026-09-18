'use strict';
/**
 * Les tâches que Laurent doit mener lui-même, déposées par les sessions.
 *
 * Avant le 18/09/2026, une action qui dépassait la session vivait dans un
 * handoff, une note de journal ou une page Notion. Rien ne l'attendait à un
 * endroit que Laurent ouvre de lui-même, et le module de tâches du CRM ne
 * servait pas. Ces routes le remplissent.
 *
 * ── Le piège central, à ne pas reproduire ───────────────────────────────────
 *
 * `requireAuthOrService` N'EST PAS utilisé ici, et ne doit pas l'être. Le
 * commentaire qui l'accompagne dans server.js est explicite : à n'appliquer
 * qu'à des routes qui ne filtrent PAS par propriétaire. Un appelant porteur
 * d'un secret n'a pas d'identité, `req.user` reste absent, et `ownerScope()`
 * rend alors un identifiant qui ne correspond à aucune ligne.
 *
 * Ces routes-ci filtrent par propriétaire. Elles l'ASSIGNENT donc
 * explicitement, à partir de TASK_OWNER_EMAIL résolu en base, et n'appellent
 * jamais `ownerScope()`.
 *
 * ── Ce que cette surface ne fait pas, et pourquoi ────────────────────────────
 *
 * Pas de suppression. Une session ne peut pas effacer une tâche de Laurent.
 * La clôture conserve la ligne : la trace de ce qui a été fait est la moitié
 * de l'intérêt d'un CRM, et une clôture abusive se rouvre d'un clic alors
 * qu'une ligne supprimée ne revient pas.
 *
 * La mise à jour de contenu n'écrit JAMAIS `status` ni `completed_at`. Si
 * Laurent a passé une tâche en « En cours » ou « Reportée », une session qui
 * rejoue son rituel de fin de session met à jour le titre, le détail,
 * l'échéance et la priorité — et laisse son tri intact.
 *
 * La clôture exige un motif écrit, et il n'y en a que deux : la PREUVE que
 * l'action est faite, ou l'ORDRE de Laurent. Le motif est inscrit dans la
 * tâche AVANT la fermeture. La route impose ainsi la traçabilité, pas la
 * véracité : elle ne peut pas vérifier qu'une session dit vrai, elle peut
 * garantir qu'aucune clôture n'est muette et que chacune porte sa raison.
 */
const nodeCrypto = require('crypto');

module.exports = function register(ctx) {
  const { app, apiLimiter, express, mapTask, pool, uuidv4 } = ctx;

  // Le statut d'ouverture. `not_started` et non `pending` : le frontend ne
  // connaît que not_started / in_progress / waiting / deferred / completed
  // (getTaskStatuses dans src/services/taskService.ts). Une tâche en
  // `pending` s'afficherait sans état lisible.
  const OPEN_STATUS = 'not_started';
  const CLOSED_STATUSES = ['completed', 'cancelled'];

  // ── Authentification ──────────────────────────────────────────────────────
  //
  // Secret DÉDIÉ, pas SERVICE_SECRET : celui-là ouvre les routes n8n
  // (publication de l'auto-blog, lecture des abonnés). Une fuite du secret des
  // tâches ne doit pas donner ça.
  //
  // Même forme qu'INGEST_SECRET et SERVICE_SECRET : en-tête dédié, comparaison
  // en temps constant, FERMÉ PAR DÉFAUT si la variable manque. Jamais ouvert
  // par omission de configuration.
  function taskSecretValid(req) {
    const expected = process.env.TASK_SECRET;
    if (!expected) return false;
    const given = req.get('x-task-secret') || '';
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return nodeCrypto.timingSafeEqual(a, b);
  }

  function requireTaskSecret(req, res, next) {
    if (taskSecretValid(req)) return next();
    if (!process.env.TASK_SECRET) {
      console.error('[TASKS] TASK_SECRET absent du backend — routes fermées.');
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Propriétaire ──────────────────────────────────────────────────────────
  //
  // Résolu à chaque appel plutôt que mis en cache : la résolution est un index
  // unique sur `users.email`, et un cache ferait survivre une adresse devenue
  // fausse jusqu'au prochain redémarrage.
  //
  // Variable absente, ou adresse qui ne correspond à personne : on REFUSE. Une
  // tâche sans propriétaire est une tâche que personne ne verra — et le
  // silence est précisément le mode de panne que ce chantier corrige.
  async function resolveOwner(res) {
    const email = process.env.TASK_OWNER_EMAIL;
    if (!email) {
      console.error('[TASKS] TASK_OWNER_EMAIL absent du backend — requête refusée.');
      res.status(500).json({ error: 'Task owner not configured' });
      return null;
    }
    const found = await pool.query('SELECT id FROM users WHERE lower(email) = lower($1)', [email]);
    if (found.rows.length === 0) {
      console.error(`[TASKS] TASK_OWNER_EMAIL (${email}) ne correspond à aucun utilisateur — requête refusée.`);
      res.status(500).json({ error: 'Task owner not found' });
      return null;
    }
    return found.rows[0].id;
  }

  // ── Description ───────────────────────────────────────────────────────────
  //
  // `detail`, `source` et `lien` sont rassemblés : une tâche doit dire d'où
  // elle vient, sinon Laurent la relit dans trois jours sans contexte et ne
  // sait plus quoi en faire.
  function composeDescription({ detail, source, lien }) {
    const parts = [];
    if (detail) parts.push(String(detail).trim());
    const meta = [];
    if (source) meta.push(`Source : ${String(source).trim()}`);
    if (lien) meta.push(`Lien : ${String(lien).trim()}`);
    if (meta.length) parts.push(meta.join(' · '));
    return parts.join('\n\n') || null;
  }

  const PRIORITIES = new Set(['low', 'medium', 'high']);

  // ── POST /api/service/tasks ───────────────────────────────────────────────
  //
  // Crée, ou met à jour la tâche OUVERTE portant le même `ref`.
  app.post('/api/service/tasks', apiLimiter, express.json(), requireTaskSecret, async (req, res) => {
    const body = req.body || {};
    const ref = typeof body.ref === 'string' ? body.ref.trim() : '';
    const titre = typeof body.titre === 'string' ? body.titre.trim() : '';

    if (!ref) return res.status(400).json({ error: 'ref requis' });
    if (!titre) return res.status(400).json({ error: 'titre requis' });

    const priorite = PRIORITIES.has(body.priorite) ? body.priorite : 'medium';
    const echeance = body.echeance || null;
    const description = composeDescription(body);

    try {
      const owner = await resolveOwner(res);
      if (!owner) return undefined;

      // La tâche OUVERTE portant ce ref, s'il y en a une. L'index unique
      // partiel garantit qu'il n'y en a jamais plus d'une.
      const existing = await pool.query(
        `SELECT * FROM tasks
          WHERE external_ref = $1 AND status <> ALL($2::text[])
          LIMIT 1`,
        [ref, CLOSED_STATUSES]
      );

      if (existing.rows.length > 0) {
        // Mise à jour de CONTENU uniquement. `status`, `completed_at` et
        // `assigned_to` ne sont pas touchés : le tri de Laurent lui appartient.
        const updated = await pool.query(
          `UPDATE tasks
              SET title = $2,
                  description = COALESCE($3, description),
                  due_date = COALESCE($4, due_date),
                  priority = $5,
                  updated_at = NOW()
            WHERE id = $1
        RETURNING *`,
          [existing.rows[0].id, titre, description, echeance, priorite]
        );
        return res.status(200).json({ created: false, task: mapTask(updated.rows[0]) });
      }

      const created = await pool.query(
        `INSERT INTO tasks (id, title, description, status, priority, due_date, assigned_to, external_ref)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
        [uuidv4(), titre, description, OPEN_STATUS, priorite, echeance, owner, ref]
      );
      return res.status(201).json({ created: true, task: mapTask(created.rows[0]) });
    } catch (error) {
      console.error('[TASKS] Échec de création/mise à jour:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ── POST /api/service/tasks/close ─────────────────────────────────────────
  //
  // Deux motifs, et deux seulement :
  //   preuve — ce qui permet de constater que l'action est faite
  //   ordre  — la consigne de Laurent
  //
  // Le motif est OBLIGATOIRE et il est écrit dans la tâche avant la fermeture.
  // Sans lui, une session pourrait refermer sur une croyance, et Laurent
  // perdrait l'information sans l'avoir vue passer.
  const MOTIFS = new Set(['preuve', 'ordre']);

  app.post('/api/service/tasks/close', apiLimiter, express.json(), requireTaskSecret, async (req, res) => {
    const body = req.body || {};
    const ref = typeof body.ref === 'string' ? body.ref.trim() : '';
    const motif = typeof body.motif === 'string' ? body.motif.trim() : '';
    const justification = typeof body.justification === 'string' ? body.justification.trim() : '';

    if (!ref) return res.status(400).json({ error: 'ref requis' });
    if (!MOTIFS.has(motif)) return res.status(400).json({ error: "motif requis : 'preuve' ou 'ordre'" });
    if (!justification) return res.status(400).json({ error: 'justification requise' });

    try {
      const owner = await resolveOwner(res);
      if (!owner) return undefined;

      const stamp = new Date().toISOString().slice(0, 10);
      const trace = motif === 'preuve'
        ? `\n\n— Clôturée le ${stamp}, sur preuve : ${justification}`
        : `\n\n— Clôturée le ${stamp}, sur ordre de Laurent : ${justification}`;

      // La justification est concaténée AVANT que le statut ne change, dans la
      // même requête : une clôture sans trace est impossible.
      const closed = await pool.query(
        `UPDATE tasks
            SET description = COALESCE(description, '') || $3,
                status = 'completed',
                completed_at = NOW(),
                updated_at = NOW()
          WHERE external_ref = $1
            AND assigned_to = $2
            AND status <> ALL($4::text[])
      RETURNING *`,
        [ref, owner, trace, CLOSED_STATUSES]
      );

      if (closed.rows.length === 0) {
        return res.status(404).json({ error: 'Aucune tâche ouverte pour ce ref' });
      }
      return res.json({ closed: true, task: mapTask(closed.rows[0]) });
    } catch (error) {
      console.error('[TASKS] Échec de clôture:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ── GET /api/service/tasks ────────────────────────────────────────────────
  //
  // Les tâches ouvertes du propriétaire configuré, pour le hook SessionStart.
  // Filtre EXPLICITE sur assigned_to, jamais ownerScope() — voir l'en-tête.
  app.get('/api/service/tasks', apiLimiter, requireTaskSecret, async (req, res) => {
    try {
      const owner = await resolveOwner(res);
      if (!owner) return undefined;

      const rows = await pool.query(
        `SELECT * FROM tasks
          WHERE assigned_to = $1 AND status <> ALL($2::text[])
       ORDER BY (due_date IS NULL), due_date ASC, created_at ASC`,
        [owner, CLOSED_STATUSES]
      );
      return res.json(rows.rows.map(mapTask));
    } catch (error) {
      console.error('[TASKS] Échec de lecture:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};
