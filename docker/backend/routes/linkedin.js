'use strict';
/**
 * linkedin routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    app,
    contentGenerator,
    linkedin,
    pool,
    requireAuth,
    webhookLimiter
  } = ctx;

// ==================== LINKEDIN AUTO-PUBLISHING ====================

// (moved to core on 2026-09-05: shared by several route modules)
// (moved to core on 2026-09-05: shared by several route modules)

// LinkedIn OAuth — Connect
app.get('/api/linkedin/connect', requireAuth, (req, res) => {
  try {
    if (!process.env.LINKEDIN_CLIENT_ID) {
      return res.status(500).json({ error: 'LinkedIn not configured. Set LINKEDIN_CLIENT_ID.' });
    }
    const state = `ainspiration-${Date.now()}`;
    const url = linkedin.getAuthUrl(state);
    res.json({ url, state });
  } catch (error) {
    console.error('LinkedIn connect error:', error.message);
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn OAuth — Callback
app.get('/api/linkedin/callback', async (req, res) => {
  try {
    const { code, error: oauthError } = req.query;
    if (oauthError) {
      return res.redirect('/linkedin?linkedin_error=' + encodeURIComponent(oauthError));
    }
    if (!code) {
      return res.redirect('/linkedin?linkedin_error=no_code');
    }

    const tokenData = await linkedin.exchangeCode(code);
    const profile = await linkedin.getProfile(tokenData.access_token);
    await linkedin.storeToken(
      pool,
      tokenData.access_token,
      tokenData.expires_in,
      tokenData.scope || 'openid profile w_member_social',
      profile.sub,
      { name: profile.name, email: profile.email, picture: profile.picture }
    );

    console.log(`[LinkedIn] Connected: ${profile.name} (${profile.sub})`);
    res.redirect('/linkedin?linkedin_connected=true');
  } catch (error) {
    console.error('LinkedIn callback error:', error.message);
    res.redirect('/linkedin?linkedin_error=' + encodeURIComponent(error.message));
  }
});

// LinkedIn — Connection status
app.get('/api/linkedin/status', requireAuth, async (req, res) => {
  try {
    const status = await linkedin.getConnectionStatus(pool);
    res.json(status);
  } catch (error) {
    res.json({ connected: false, error: 'LinkedIn status unavailable' });
  }
});

// LinkedIn Posts — List
app.get('/api/linkedin/posts', requireAuth, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    let query = `SELECT * FROM linkedin_posts WHERE deleted_at IS NULL`;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    const countResult = await pool.query(`SELECT COUNT(*) FROM linkedin_posts WHERE deleted_at IS NULL`);
    res.json({ posts: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (error) {
    console.error('LinkedIn posts list error:', error.message);
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Posts — Generate manually
app.post('/api/linkedin/posts/generate', requireAuth, async (req, res) => {
  try {
    const post = await contentGenerator.generatePost(pool);
    console.log(`[LinkedIn] Post generated: ${post.title} (${post.status})`);
    res.json(post);
  } catch (error) {
    console.error('LinkedIn generate error:', error.message);
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Posts — Publish
app.post('/api/linkedin/posts/:id/publish', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const postResult = await pool.query(`SELECT * FROM linkedin_posts WHERE id = $1 AND deleted_at IS NULL`, [id]);
    if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = postResult.rows[0];
    if (post.status === 'published') return res.status(400).json({ error: 'Already published' });

    const result = await linkedin.publishPost(pool, post.content);

    await pool.query(`
      UPDATE linkedin_posts
      SET status = 'published', linkedin_post_id = $2, linkedin_post_url = $3, published_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id, result.postId, result.postUrl]);

    console.log(`[LinkedIn] Post published: ${id}`);
    res.json({ success: true, postId: result.postId, postUrl: result.postUrl });
  } catch (error) {
    console.error('LinkedIn publish error:', error.message);
    await pool.query(`UPDATE linkedin_posts SET status = 'failed', error_message = $2, updated_at = NOW() WHERE id = $1`, [req.params.id, error.message]).catch(() => {});
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Posts — Approve
app.post('/api/linkedin/posts/:id/approve', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`
      UPDATE linkedin_posts
      SET status = 'approved', approved_by = $2, approved_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `, [id, req.user?.email || 'admin']);
    res.json({ success: true });
  } catch (error) {
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Posts — Edit
app.put('/api/linkedin/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title, hook, cta, hashtags, status } = req.body;
    const fields = [];
    const values = [id];
    let idx = 2;

    if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (hook !== undefined) { fields.push(`hook = $${idx++}`); values.push(hook); }
    if (cta !== undefined) { fields.push(`cta = $${idx++}`); values.push(cta); }
    if (hashtags !== undefined) { fields.push(`hashtags = $${idx++}`); values.push(hashtags); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    fields.push('updated_at = NOW()');

    await pool.query(`UPDATE linkedin_posts SET ${fields.join(', ')} WHERE id = $1 AND deleted_at IS NULL`, values);
    const result = await pool.query(`SELECT * FROM linkedin_posts WHERE id = $1`, [id]);
    res.json(result.rows[0]);
  } catch (error) {
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Posts — Delete (soft)
app.delete('/api/linkedin/posts/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(`UPDATE linkedin_posts SET deleted_at = NOW() WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Settings — Get
app.get('/api/linkedin/settings', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT key, value FROM linkedin_settings`);
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (error) {
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Settings — Update
app.put('/api/linkedin/settings', requireAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
    await pool.query(`
      INSERT INTO linkedin_settings (key, value, updated_at) VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, JSON.stringify(value)]);
    res.json({ success: true });
  } catch (error) {
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn Webhook — n8n automated generate + publish
app.post('/api/webhook/linkedin-post', webhookLimiter, async (req, res) => {
  try {
    const webhookSecret = req.headers['x-webhook-secret'];
    if (!process.env.WEBHOOK_SECRET || !webhookSecret || webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    console.log('[LinkedIn Webhook] Generating weekly post...');
    const post = await contentGenerator.generatePost(pool);
    console.log(`[LinkedIn Webhook] Post generated: ${post.title} (status: ${post.status})`);

    // Check if auto-publish is enabled and post doesn't need review
    const configResult = await pool.query(`SELECT value FROM linkedin_settings WHERE key = 'linkedin_config'`);
    const config = configResult.rows[0]?.value || {};

    if (config.auto_publish && post.status !== 'review_pending') {
      try {
        const publishResult = await linkedin.publishPost(pool, post.content);
        await pool.query(`
          UPDATE linkedin_posts
          SET status = 'published', linkedin_post_id = $2, linkedin_post_url = $3, published_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [post.id, publishResult.postId, publishResult.postUrl]);
        console.log(`[LinkedIn Webhook] Auto-published: ${publishResult.postUrl}`);
        res.json({ success: true, postId: post.id, published: true, linkedinUrl: publishResult.postUrl });
      } catch (pubError) {
        console.error('[LinkedIn Webhook] Auto-publish failed:', pubError.message);
        await pool.query(`UPDATE linkedin_posts SET status = 'queued', error_message = $2 WHERE id = $1`, [post.id, pubError.message]);
        res.json({ success: true, postId: post.id, published: false, error: pubError.message });
      }
    } else {
      res.json({ success: true, postId: post.id, published: false, status: post.status });
    }
  } catch (error) {
    console.error('[LinkedIn Webhook] Error:', error.message);
    // SECURITY: internal error details stay in the server log, never in the response.
    res.status(500).json({ error: 'Internal server error' });
  }
});

};
