'use strict';
/**
 * auth routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    JWT_SECRET,
    app,
    authLimiter,
    bcrypt,
    clearAuthCookie,
    jwt,
    optionalAuth,
    pool,
    recordAccessLog,
    requireAuth,
    schemas,
    setAuthCookie,
    uuidv4,
    validateBody,
    z
  } = ctx;

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', authLimiter, validateBody(schemas.authRegister), async (req, res) => {
  try {
    // Registration is disabled by default — set ALLOW_REGISTRATION=true to enable
    if (process.env.ALLOW_REGISTRATION !== 'true') {
      return res.status(403).json({ error: 'Registration is currently disabled. Contact admin.' });
    }

    const { email, password, name, company } = req.body;

    // Additional password complexity (not just length)
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase and a number' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, created_at`,
      [id, email.toLowerCase(), password_hash, name || null, 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    await pool.query(
      `INSERT INTO activities (id, user_id, type, description, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), user.id, 'user_registered', `Nouvel utilisateur: ${user.email}`, 'user', user.id]
    ).catch(() => {});

    setAuthCookie(res, token);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', authLimiter, validateBody(schemas.authLogin), async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      recordAccessLog(req, null, 'login_failed');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      recordAccessLog(req, user.id, 'login_failed');
      return res.status(401).json({ error: 'Account not configured for password login' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      recordAccessLog(req, user.id, 'login_failed');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...userData } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    recordAccessLog(req, user.id, 'login_success');
    setAuthCookie(res, token);
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', optionalAuth, (req, res) => {
  if (req.user) recordAccessLog(req, req.user.id, 'logout');
  clearAuthCookie(res);
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

};
