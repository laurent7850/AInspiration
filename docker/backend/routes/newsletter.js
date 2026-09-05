'use strict';
/**
 * newsletter routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    N8N_BASE,
    app,
    formLimiter,
    langPrefix,
    pool,
    rejectHoneypot,
    requireAuth,
    schemas,
    updateSchemas,
    uuidv4,
    validateBody,
    validateUuidParam
  } = ctx;

// ==================== NEWSLETTER SUBSCRIBERS ====================

app.get('/api/newsletter-subscribers', requireAuth, async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM newsletter_subscribers';
    const params = [];
    if (status) {
      const dbStatus = status === 'active' ? 'subscribed' : status;
      query += ' WHERE status = $1';
      params.push(dbStatus);
    }
    query += ` ORDER BY subscribed_at DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(s => ({ ...s, status: s.status === 'subscribed' ? 'active' : s.status })));
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SECURITY: the former public GET /by-email endpoint was removed (2026-09-05).
// It returned the full subscriber row — unsubscribe_token included — for any
// email, enabling enumeration and third-party unsubscribes. Nothing in the
// frontend called it. Admin lookups go through the authenticated list endpoint.

// Public by design: the unsubscribe link carries the token. Only the fields the
// unsubscribe page displays are returned, never the whole row.
app.get('/api/newsletter-subscribers/by-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string' || token.length > 200) {
      return res.status(400).json({ error: 'Token is required' });
    }
    const result = await pool.query('SELECT email, status FROM newsletter_subscribers WHERE unsubscribe_token = $1', [token]);
    if (result.rows.length === 0) return res.json(null);
    const s = result.rows[0];
    res.json({ email: s.email, status: s.status === 'subscribed' ? 'active' : s.status });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Double opt-in (RGPD art. 7). A submitted address is stored as 'pending' with
// a one-time confirm_token; the n8n workflow "Newsletter double opt-in"
// (Mi8VlalnAIyx6bre) emails the confirmation link. Only the GET /confirm hit
// flips the row to 'subscribed'. Unconfirmed rows are purged after 30 days.
//
// SECURITY: the response is the same whatever the state of the address
// (new, pending, already subscribed) — no enumeration, no row returned.
const PENDING_TTL_DAYS = 30;

async function sendNewsletterConfirmation(token) {
  try {
    const r = await fetch(`${N8N_BASE}/ainspiration-newsletter-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!r.ok) console.error('[newsletter] confirmation webhook responded', r.status);
  } catch (e) {
    console.error('[newsletter] confirmation webhook failed:', e.message);
  }
}

app.post('/api/newsletter-subscribers', formLimiter, rejectHoneypot, validateBody(schemas.newsletterSubscriber), async (req, res) => {
  const generic = { success: true, pending: true };
  try {
    const { email, first_name, last_name, language, source } = req.body;
    const lang = ['fr', 'en', 'nl'].includes(language) ? language : 'fr';
    const existing = await pool.query('SELECT id, status FROM newsletter_subscribers WHERE email = $1', [email]);
    const token = uuidv4();

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO newsletter_subscribers (id, email, first_name, last_name, language, status, source, confirm_token, confirm_sent_at, consent_ip)
         VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,NOW(),$8)`,
        [uuidv4(), email, first_name || null, last_name || null, lang, source || 'website', token, req.ip || null]
      );
      sendNewsletterConfirmation(token);
    } else if (existing.rows[0].status === 'pending' || existing.rows[0].status === 'unsubscribed') {
      // Re-send a fresh link; a previous unsubscribe means consent must be re-given.
      await pool.query(
        `UPDATE newsletter_subscribers
         SET status='pending', confirm_token=$1, confirm_sent_at=NOW(), consent_ip=$2, language=$3, source=$4
         WHERE id=$5`,
        [token, req.ip || null, lang, source || 'website', existing.rows[0].id]
      );
      sendNewsletterConfirmation(token);
    }
    // 'subscribed' / 'bounced': nothing to do, same answer.
    res.status(201).json(generic);
  } catch (error) {
    console.error('Error creating subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Called by the n8n confirmation workflow. Public, but only a valid pending
// token gets an answer — it is the server that hands n8n the address to write
// to, never the other way round.
app.get('/api/newsletter-subscribers/pending', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string' || token.length > 100) return res.status(400).json({ error: 'Token required' });
    const r = await pool.query(
      `SELECT email, language, confirm_token FROM newsletter_subscribers
       WHERE confirm_token = $1 AND status = 'pending' AND confirm_sent_at > NOW() - INTERVAL '${PENDING_TTL_DAYS} days'`,
      [token]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (error) {
    console.error('Error reading pending subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// The link in the confirmation email. Redirects to the localized confirmation page.
app.get('/api/newsletter-subscribers/confirm', async (req, res) => {
  const { token } = req.query;
  let status = 'invalid';
  let lang = 'fr';
  try {
    if (token && typeof token === 'string' && token.length <= 100) {
      const r = await pool.query(
        `UPDATE newsletter_subscribers
         SET status='subscribed', subscribed_at=NOW(), confirmed_at=NOW(), confirm_token=NULL, unsubscribed_at=NULL
         WHERE confirm_token = $1 AND status = 'pending'
         RETURNING language`,
        [token]
      );
      if (r.rows.length > 0) {
        status = 'ok';
        if (['fr', 'en', 'nl'].includes(r.rows[0].language)) lang = r.rows[0].language;
      }
    }
  } catch (error) {
    console.error('Error confirming subscriber:', error);
    status = 'error';
  }
  res.redirect(302, `${langPrefix(lang)}/newsletter-confirmee?status=${status}`);
});

// Unconfirmed addresses are personal data kept without consent: purge them.
async function purgeStalePendingSubscribers() {
  try {
    const r = await pool.query(
      `DELETE FROM newsletter_subscribers WHERE status = 'pending' AND confirm_sent_at < NOW() - INTERVAL '${PENDING_TTL_DAYS} days'`
    );
    if (r.rowCount) console.log(`[newsletter] purged ${r.rowCount} unconfirmed subscriber(s)`);
  } catch (e) { /* table may predate migration 004 — logged on next run */ }
}
setTimeout(purgeStalePendingSubscribers, 60 * 1000);
setInterval(purgeStalePendingSubscribers, 24 * 60 * 60 * 1000);

app.post('/api/newsletter-subscribers/unsubscribe', validateBody(schemas.newsletterUnsubscribe), async (req, res) => {
  try {
    const { token } = req.body;
    const result = await pool.query(
      `UPDATE newsletter_subscribers SET status='unsubscribed', unsubscribed_at=NOW() WHERE unsubscribe_token = $1 RETURNING id`,
      [token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/newsletter-subscribers/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM newsletter_subscribers WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTERS ====================

app.get('/api/newsletters', requireAuth, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM newsletters';
    const params = [];
    if (status) { query += ' WHERE status = $1'; params.push(status); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/newsletters/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletters', requireAuth, validateBody(schemas.newsletter), async (req, res) => {
  try {
    const { subject, content, html_content, language, status, scheduled_at } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO newsletters (id, subject, content, html_content, language, status, scheduled_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, subject, content, html_content, language || 'fr', status || 'draft', scheduled_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/newsletters/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.newsletter), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, html_content, status, scheduled_at, sent_at, recipients_count } = req.body;
    const result = await pool.query(
      `UPDATE newsletters SET subject=COALESCE($1,subject), content=COALESCE($2,content), html_content=$3,
       status=COALESCE($4,status), scheduled_at=$5, sent_at=$6, recipients_count=COALESCE($7,recipients_count), updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [subject, content, html_content, status, scheduled_at, sent_at, recipients_count, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/newsletters/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM newsletters WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json({ message: 'Newsletter deleted' });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTER SEND LOGS ====================

app.get('/api/newsletter-send-logs', requireAuth, async (req, res) => {
  try {
    const { newsletter_id } = req.query;
    let query = 'SELECT l.*, s.email AS subscriber_email FROM newsletter_send_logs l LEFT JOIN newsletter_subscribers s ON l.subscriber_id = s.id';
    const params = [];
    if (newsletter_id) { query += ' WHERE l.newsletter_id = $1'; params.push(newsletter_id); }
    query += ' ORDER BY l.sent_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching send logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-send-logs', requireAuth, validateBody(schemas.newsletterSendLog), async (req, res) => {
  try {
    const { newsletter_id, subscriber_id, status, error_message } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO newsletter_send_logs (id, newsletter_id, subscriber_id, status, sent_at, error_message) VALUES ($1,$2,$3,$4,NOW(),$5) RETURNING *',
      [id, newsletter_id, subscriber_id, status || 'sent', error_message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating send log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/newsletter-send-logs', requireAuth, async (req, res) => {
  try {
    const { newsletter_id, subscriber_id, ...updates } = req.body;
    const sets = []; const params = []; let pi = 1;
    for (const [k, v] of Object.entries(updates)) {
      if (['status', 'opened_at', 'clicked_at', 'error_message'].includes(k)) { sets.push(`${k}=$${pi++}`); params.push(v); }
    }
    if (!sets.length) return res.status(400).json({ error: 'No valid fields' });
    params.push(newsletter_id, subscriber_id);
    const result = await pool.query(`UPDATE newsletter_send_logs SET ${sets.join(',')} WHERE newsletter_id=$${pi++} AND subscriber_id=$${pi} RETURNING *`, params);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error updating send log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTER STATS ====================

app.get('/api/newsletter-stats', requireAuth, async (req, res) => {
  try {
    const subs = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='subscribed') as active, COUNT(*) FILTER (WHERE status='unsubscribed') as unsubscribed FROM newsletter_subscribers`);
    const nl = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='sent') as sent FROM newsletters`);
    const s = subs.rows[0]; const n = nl.rows[0];
    res.json({
      totalSubscribers: parseInt(s.total), activeSubscribers: parseInt(s.active), unsubscribedCount: parseInt(s.unsubscribed),
      totalNewsletters: parseInt(n.total), sentNewsletters: parseInt(n.sent)
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

};
