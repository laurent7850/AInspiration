'use strict';
/**
 * webhooks routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    N8N_BASE,
    app,
    chatLimiter,
    formLimiter,
    pool,
    rejectHoneypot,
    requireAuth,
    requireConsent,
    uuidv4,
    webhookLimiter
  } = ctx;

  const nodeCrypto = require('crypto');

// ==================== WEBHOOK PASSTHROUGH (n8n) ====================

// (moved to core on 2026-09-05: shared by several route modules)

app.post('/api/webhook/chat', webhookLimiter, chatLimiter, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/ainspiration`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to n8n chat:', error.message);
    res.status(502).json({ message: 'Le chatbot est temporairement indisponible. Veuillez réessayer.' });
  }
});

app.post('/api/webhook/audit', webhookLimiter, formLimiter, rejectHoneypot, requireConsent, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/audit-ia`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    // n8n answers 400 with a validation payload; forward it so the form can
    // tell a rejected submission apart from an outage.
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding to n8n audit:', error.message);
    res.status(502).json({ success: false, error: "Le formulaire d'audit est temporairement indisponible. Veuillez réessayer." });
  }
});

app.post('/api/webhook/contact', webhookLimiter, formLimiter, rejectHoneypot, requireConsent, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/Aimaginationcontact`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding to n8n contact:', error.message);
    res.status(502).json({ success: false, message: 'Le formulaire de contact est temporairement indisponible. Veuillez réessayer.' });
  }
});

// ==================== INGEST CRM (n8n → CRM) ====================
//
// Point d'entrée unique des prospects. Les formulaires de contact, le pipeline
// d'audit gratuit et la newsletter écrivaient jusqu'ici dans Gmail : le prospect
// n'existait nulle part et rien ne pouvait être relancé ni compté.
//
// Authentification par secret partagé (en-tête x-ingest-secret), pas par JWT :
// l'appelant est un workflow n8n, pas un humain. Le secret vient de
// INGEST_SECRET côté backend ; s'il n'est pas défini, l'endpoint refuse tout
// (fermé par défaut — jamais ouvert par omission de configuration).
//
// Les fiches créées appartiennent TOUJOURS à l'administrateur, jamais au compte
// démo : c'est ce qui les rend invisibles depuis la démo publique.

function ingestAuthorized(req) {
  const expected = process.env.INGEST_SECRET;
  if (!expected) return false;
  const given = req.get('x-ingest-secret') || '';
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return nodeCrypto.timingSafeEqual(a, b);
}

app.post('/api/ingest/contact', webhookLimiter, async (req, res) => {
  if (!ingestAuthorized(req)) {
    if (!process.env.INGEST_SECRET) {
      console.error('[INGEST] INGEST_SECRET absent du backend — endpoint fermé.');
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    first_name, last_name, email, phone,
    job_title, company_name, source, notes
  } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'email requis' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const adminRes = await client.query(
      `SELECT id FROM users WHERE email = 'admin@ainspiration.eu'
       UNION ALL SELECT id FROM users WHERE role = 'admin' ORDER BY 1 LIMIT 1`
    );
    const adminId = adminRes.rows[0]?.id;
    if (!adminId) {
      await client.query('ROLLBACK');
      console.error('[INGEST] Aucun utilisateur administrateur — fiche non créée.');
      return res.status(500).json({ error: 'No owner available' });
    }

    // Société : réutilisée si elle existe déjà chez le même propriétaire.
    let companyId = null;
    if (company_name && String(company_name).trim()) {
      const name = String(company_name).trim();
      const found = await client.query(
        'SELECT id FROM companies WHERE LOWER(name) = LOWER($1) AND owner_id = $2 LIMIT 1',
        [name, adminId]
      );
      if (found.rows.length) {
        companyId = found.rows[0].id;
      } else {
        companyId = uuidv4();
        await client.query(
          `INSERT INTO companies (id, name, status, owner_id) VALUES ($1,$2,'active',$3)`,
          [companyId, name, adminId]
        );
      }
    }

    // Contact : idempotent sur l'email. Un même prospect qui remplit deux
    // formulaires met sa fiche à jour, il n'en crée pas une deuxième.
    const existing = await client.query(
      'SELECT id FROM contacts WHERE LOWER(email) = LOWER($1) AND owner_id = $2 LIMIT 1',
      [email, adminId]
    );

    let contactId;
    let created;
    if (existing.rows.length) {
      contactId = existing.rows[0].id;
      created = false;
      await client.query(
        `UPDATE contacts SET
           first_name = COALESCE(NULLIF($1,''), first_name),
           last_name  = COALESCE(NULLIF($2,''), last_name),
           phone      = COALESCE(NULLIF($3,''), phone),
           job_title  = COALESCE(NULLIF($4,''), job_title),
           company_id = COALESCE($5, company_id),
           notes      = CONCAT_WS(E'\\n', notes, NULLIF($6,'')),
           updated_at = NOW()
         WHERE id = $7`,
        [first_name || '', last_name || '', phone || '', job_title || '', companyId, notes || '', contactId]
      );
    } else {
      contactId = uuidv4();
      created = true;
      await client.query(
        `INSERT INTO contacts (id, first_name, last_name, email, phone, job_title, company_id, notes, status, owner_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9)`,
        [contactId, first_name || null, last_name || null, email, phone || null,
         job_title || null, companyId, notes || null, adminId]
      );
    }

    await client.query(
      `INSERT INTO activities (id, user_id, type, description, entity_type, entity_id)
       VALUES ($1,$2,$3,$4,'contact',$5)`,
      [uuidv4(), adminId, created ? 'contact_created' : 'contact_updated',
       `${created ? 'Nouveau contact' : 'Contact mis à jour'} via ${source || 'ingest'} : ${email}`,
       contactId]
    );

    await client.query('COMMIT');
    res.status(created ? 201 : 200).json({ created, contact_id: contactId, company_id: companyId });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[INGEST] Échec de création du contact:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.post('/api/webhook/newsletter-send', webhookLimiter, requireAuth, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/newsletter-send`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to n8n newsletter-send:', error.message);
    res.status(502).json({ success: false, message: 'Erreur de connexion au service d\'envoi' });
  }
});

app.post('/api/webhook/newsletter-generate', webhookLimiter, requireAuth, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/newsletter-generate`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to n8n newsletter-generate:', error.message);
    res.status(502).json({ subject: '', content: '', error: 'Erreur de connexion au service de génération' });
  }
});

};
