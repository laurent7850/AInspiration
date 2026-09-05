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
    rejectHoneypot,
    requireAuth,
    requireConsent,
    webhookLimiter
  } = ctx;

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
