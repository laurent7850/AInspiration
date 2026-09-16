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
    ingestLimiter,
    pool,
    rejectHoneypot,
    requireAuth,
    requireConsent,
    webhookLimiter
  } = ctx;

  const nodeCrypto = require('crypto');
  const { ingestContact, IngestError } = require('../ingest');

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
// Point d'entrée des prospects venus des formulaires. Les formulaires de
// contact et le pipeline d'audit gratuit écrivaient jusqu'ici dans Gmail : le
// prospect n'existait nulle part et rien ne pouvait être relancé ni compté.
//
// Authentification par secret partagé (en-tête x-ingest-secret), pas par JWT :
// l'appelant est un workflow n8n, pas un humain. Le secret vient de
// INGEST_SECRET côté backend ; s'il n'est pas défini, l'endpoint refuse tout
// (fermé par défaut — jamais ouvert par omission de configuration).
//
// La création elle-même vit dans ingest.js, partagée avec la confirmation du
// double opt-in newsletter. Les fiches appartiennent TOUJOURS à
// l'administrateur, jamais au compte démo.

function ingestAuthorized(req) {
  const expected = process.env.INGEST_SECRET;
  if (!expected) return false;
  const given = req.get('x-ingest-secret') || '';
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return nodeCrypto.timingSafeEqual(a, b);
}

app.post('/api/ingest/contact', ingestLimiter, async (req, res) => {
  if (!ingestAuthorized(req)) {
    if (!process.env.INGEST_SECRET) {
      console.error('[INGEST] INGEST_SECRET absent du backend — endpoint fermé.');
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { created, contactId, companyId } = await ingestContact(pool, req.body || {});
    res.status(created ? 201 : 200).json({ created, contact_id: contactId, company_id: companyId });
  } catch (error) {
    if (error instanceof IngestError) {
      if (error.code === 'invalid_email') return res.status(400).json({ error: 'email requis' });
      console.error('[INGEST] Aucun utilisateur administrateur — fiche non créée.');
      return res.status(500).json({ error: 'No owner available' });
    }
    console.error('[INGEST] Échec de création du contact:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Relecture de la fiche de sonde, pour le workflow de surveillance.
//
// La surveillance doit prouver que l'ingestion a REELLEMENT persiste : un 201
// ne dit rien de ce qui est en base. Elle le faisait par GET /api/contacts/:id
// avec le jeton admin de n8n — exiger un acces CRM complet pour lire une date.
// Cette route rend les deux seuls champs utiles, sur une adresse figee dans le
// code, sous le secret d'ingestion que la sonde porte deja. Aucune donnee
// personnelle : la fiche lue est celle du moniteur lui-meme.
const PROBE_EMAIL = 'sonde-parcours@surveillance.ainspiration.eu';

app.get('/api/ingest/probe', ingestLimiter, async (req, res) => {
  if (!ingestAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query(
      'SELECT updated_at FROM contacts WHERE LOWER(email) = LOWER($1) ORDER BY updated_at DESC LIMIT 1',
      [PROBE_EMAIL]
    );
    if (!result.rows.length) return res.json({ exists: false, updated_at: null });
    res.json({ exists: true, updated_at: result.rows[0].updated_at });
  } catch (error) {
    console.error('[INGEST] Relecture de la fiche de sonde impossible:', error.message);
    res.status(500).json({ error: 'Internal server error' });
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
