'use strict';
/**
 * blog routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    BLOG_DEFAULT_AUTHOR,
    BLOG_LIST_SQL,
    app,
    blogCoverFor,
    estimateReadTime,
    optionalAuth,
    pool,
    publicBlogRow,
    requireAuth,
    resolveBlogCategory,
    schemas,
    updateSchemas,
    uuidv4,
    validateBody,
    validateUuidParam
  } = ctx;

// ==================== BLOG POSTS ====================

app.get('/api/blog-posts', optionalAuth, async (req, res) => {
  try {
    const { language, status, category_id, category, limit = 50, offset = 0 } = req.query;
    let query = BLOG_LIST_SQL + ' WHERE 1=1';
    const params = [];
    let pi = 1;
    if (language) { query += ` AND p.language = $${pi++}`; params.push(language); }
    // SECURITY: drafts and archived posts are only listable by a logged-in user.
    const effectiveStatus = req.user ? status : 'published';
    if (effectiveStatus) { query += ` AND p.status = $${pi++}`; params.push(effectiveStatus); }
    if (category_id) { query += ` AND p.category_id = $${pi++}`; params.push(category_id); }
    if (category) { query += ` AND c.slug = $${pi++}`; params.push(category); }
    query += ` ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(Math.min(parseInt(limit) || 50, 200), parseInt(offset) || 0);
    const result = await pool.query(query, params);
    res.json(result.rows.map(publicBlogRow));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-posts/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(BLOG_LIST_SQL + ' WHERE p.slug = $1', [req.params.slug]);
    const row = result.rows[0];
    if (!row || (!req.user && row.status !== 'published')) return res.status(404).json({ error: 'Post not found' });
    res.json(publicBlogRow(row));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-posts/:id', optionalAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query(BLOG_LIST_SQL + ' WHERE p.id = $1', [req.params.id]);
    const row = result.rows[0];
    if (!row || (!req.user && row.status !== 'published')) return res.status(404).json({ error: 'Post not found' });
    res.json(publicBlogRow(row));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registre des parutions : "ce sujet a-t-il deja ete traite ?"
// A interroger AVANT de generer un article (workflow n8n Auto Blog).
//
// GET /api/publications/check?subject=...&language=fr&channel=blog
//   -> { verdict: 'duplicate' | 'near' | 'free', matches: [...] }
//
// Authentifie comme l'ecriture : l'endpoint expose la ligne editoriale du site
// (sujets couverts, dates), ce qui n'a pas a etre public. n8n reutilise le meme
// jeton admin longue duree que POST /api/blog-posts.
app.get('/api/publications/check', requireAuth, async (req, res) => {
  try {
    const subject = String(req.query.subject || '').trim();
    if (!subject) {
      return res.status(400).json({ error: 'Query parameter "subject" is required' });
    }
    if (subject.length > 300) {
      return res.status(400).json({ error: 'Query parameter "subject" too long (max 300)' });
    }

    const language = String(req.query.language || 'fr').slice(0, 5);
    const channel = String(req.query.channel || 'blog').slice(0, 20);
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

    const result = await pool.query(
      `SELECT title, url, slug, published_at, jaccard, title_similarity, verdict
         FROM publication_find_similar($1, 'ainspiration', $2, $3, NULL, $4)`,
      [subject, language, channel, limit]
    );

    const matches = result.rows;
    // Verdict global = celui du plus proche ; la fonction trie deja par
    // ressemblance decroissante.
    const verdict = matches.length > 0 ? matches[0].verdict : 'free';

    res.json({ subject, language, channel, verdict, matches });
  } catch (error) {
    console.error('Error checking publications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blog-posts', requireAuth, validateBody(schemas.blogPost), async (req, res) => {
  try {
    const { title, slug, excerpt, content, status, language } = req.body;
    if (!slug) return res.status(400).json({ error: 'slug is required' });
    const author_name = req.body.author_name || req.body.author || BLOG_DEFAULT_AUTHOR;
    const category_id = (await resolveBlogCategory(req.body.category_id || req.body.category)) || null;
    const categorySlug = req.body.category && !/^[0-9a-f-]{36}$/i.test(req.body.category) ? String(req.body.category).toLowerCase() : null;
    // '/images/blog/ai-default.webp' was the workflow's placeholder; the file never existed.
    const sentImage = req.body.featured_image || req.body.image_url;
    const featured_image = sentImage && !/ai-default\.webp$/.test(sentImage) ? sentImage : blogCoverFor(categorySlug);
    const read_time = estimateReadTime(content);
    const newId = uuidv4();
    const finalStatus = status || 'draft';

    // Garde anti-redondance sur le chemin d'ecriture.
    //
    // Elle vit ici plutot que chez l'appelant pour une raison simple : tous les
    // producteurs passent par cette route (workflow n8n Auto Blog, AutoSEO,
    // saisie manuelle). Un controle place en amont, chez chacun, finit toujours
    // par etre oublie par le suivant.
    //
    // Le upsert par slug ci-dessous reste autorise : republier LE MEME article
    // le met a jour, ce n'est pas une redondance. Seul un slug NOUVEAU portant
    // un sujet deja couvert est refuse.
    //
    // `?allow_duplicate=true` laisse la main a un humain qui sait ce qu'il fait.
    // En query et non dans le corps : validateBody(zod) retire les cles inconnues,
    // un drapeau place dans le corps serait silencieusement ignore.
    const allowDuplicate = req.query.allow_duplicate === 'true';
    if (finalStatus === 'published' && !allowDuplicate) {
      const existing = await pool.query('SELECT 1 FROM blog_posts WHERE slug = $1', [slug]);
      if (existing.rowCount === 0) {
        const similar = await pool.query(
          `SELECT title, url, slug, published_at, jaccard, verdict
             FROM publication_find_similar($1, 'ainspiration', $2, 'blog', NULL, 1)`,
          [title, language || 'fr']
        );
        const match = similar.rows[0];
        if (match && match.verdict === 'duplicate') {
          console.warn(
            `[blog-posts] Refus 409 — sujet deja couvert : "${title}" recoupe ` +
            `"${match.title}" (${match.published_at}, jaccard ${match.jaccard})`
          );
          return res.status(409).json({
            error: 'Subject already covered',
            message:
              'Un article couvrant ce sujet existe deja. Renouveler la liste de ' +
              'sujets, ou forcer avec allow_duplicate=true si la republication est voulue.',
            conflicts_with: {
              title: match.title,
              url: match.url,
              slug: match.slug,
              published_at: match.published_at,
              jaccard: match.jaccard,
            },
          });
        }
      }
    }
    // Upsert by slug: republishing the same article (e.g. via webhook) updates the existing
    // row instead of crashing on the unique constraint. published_at is set to NOW() the first
    // time the row transitions to 'published' and preserved on subsequent updates.
    const result = await pool.query(
      `INSERT INTO blog_posts (id, title, slug, excerpt, content, featured_image, category_id, status, published_at, language, author_name, read_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, CASE WHEN $8 = 'published' THEN NOW() ELSE NULL END, $9, $10, $11)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         content = EXCLUDED.content,
         featured_image = EXCLUDED.featured_image,
         category_id = EXCLUDED.category_id,
         status = EXCLUDED.status,
         language = EXCLUDED.language,
         author_name = EXCLUDED.author_name,
         read_time = EXCLUDED.read_time,
         updated_at = NOW(),
         published_at = CASE
           WHEN blog_posts.published_at IS NULL AND EXCLUDED.status = 'published' THEN NOW()
           ELSE blog_posts.published_at
         END
       RETURNING *`,
      [newId, title, slug, excerpt, content, featured_image, category_id, finalStatus, language || 'fr', author_name, read_time]
    );
    const created = result.rows[0].id === newId;
    res.status(created ? 201 : 200).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating/updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/blog-posts/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.blogPost), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, featured_image, category_id, status, language, author_name } = req.body;
    const result = await pool.query(
      `UPDATE blog_posts SET title=$1, slug=$2, excerpt=$3, content=$4, featured_image=$5,
       category_id=$6, status=$7, language=$8, author_name=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [title, slug, excerpt, content, featured_image, category_id, status, language, author_name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/blog-posts/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

};
