const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');
// Port is set at the bottom of the file
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// PostgreSQL connection — supports DATABASE_URL or individual vars
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST || 'postgres',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ainspiration',
      user: process.env.DB_USER || 'ainspiration',
      password: process.env.DB_PASSWORD || 'ainspiration_secret'
    });

// Middleware
app.use(cors());
app.use(express.json());

// Health check (before any auth middleware)
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/status', (req, res) => res.json({ status: 'running' }));

// ==================== AUTH MIDDLEWARE ====================

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch (e) { /* invalid token — continue without auth */ }
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.use(optionalAuth);

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
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
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await pool.query(
      `INSERT INTO activities (id, user_id, type, description, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), user.id, 'user_registered', `Nouvel utilisateur: ${user.email}`, 'user', user.id]
    ).catch(() => {});

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not configured for password login' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...userData } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ==================== HELPERS ====================

function mapOpportunity(row) {
  return {
    ...row,
    stage: row.status,
    estimated_value: row.value != null ? parseFloat(row.value) : null,
    close_date: row.expected_close_date,
    user_id: row.owner_id,
  };
}

function mapProduct(row) {
  return {
    ...row,
    is_active: row.status === 'active',
    price: row.price != null ? parseFloat(row.price) : null,
  };
}

function mapTask(row) {
  const t = {
    ...row,
    user_id: row.assigned_to,
    completed: row.status === 'completed',
  };
  if (row.opportunity_id) {
    t.related_to_type = 'opportunity';
    t.related_to = row.opportunity_id;
  } else if (row.contact_id) {
    t.related_to_type = 'contact';
    t.related_to = row.contact_id;
  } else if (row.company_id) {
    t.related_to_type = 'company';
    t.related_to = row.company_id;
  }
  return t;
}

// ==================== BLOG POSTS ====================

app.get('/api/blog-posts', async (req, res) => {
  try {
    const { language, status, category_id, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM blog_posts WHERE 1=1';
    const params = [];
    let pi = 1;
    if (language) { query += ` AND language = $${pi++}`; params.push(language); }
    if (status) { query += ` AND status = $${pi++}`; params.push(status); }
    if (category_id) { query += ` AND category_id = $${pi++}`; params.push(category_id); }
    query += ` ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-posts/slug/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-posts/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blog-posts', async (req, res) => {
  try {
    const { title, slug, excerpt, content, featured_image, category_id, status, language, author_name } = req.body;
    const id = uuidv4();
    const published_at = status === 'published' ? new Date() : null;
    const result = await pool.query(
      `INSERT INTO blog_posts (id, title, slug, excerpt, content, featured_image, category_id, status, published_at, language, author_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, title, slug, excerpt, content, featured_image, category_id, status || 'draft', published_at, language || 'en', author_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/blog-posts/:id', async (req, res) => {
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

app.delete('/api/blog-posts/:id', async (req, res) => {
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

// ==================== COMPANIES ====================

app.get('/api/companies', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await pool.query(
      'SELECT * FROM companies ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    const result = await pool.query(
      'SELECT * FROM companies WHERE name ILIKE $1 OR website ILIKE $1 ORDER BY name LIMIT 50',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM companies');
    const active = await pool.query("SELECT COUNT(*) FROM companies WHERE status = 'active'");
    const recent = await pool.query('SELECT * FROM companies ORDER BY created_at DESC LIMIT 5');
    res.json({
      totalCount: parseInt(total.rows[0].count),
      activeCount: parseInt(active.rows[0].count),
      recentAdditions: recent.rows
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, industry, website, address, city, country, phone, email, notes, status } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO companies (id, name, industry, website, address, city, country, phone, email, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, name, industry, website, address, city, country, phone, email, notes, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, website, address, city, country, phone, email, notes, status } = req.body;
    const result = await pool.query(
      `UPDATE companies SET name=$1, industry=$2, website=$3, address=$4, city=$5,
       country=$6, phone=$7, email=$8, notes=$9, status=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, industry, website, address, city, country, phone, email, notes, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM companies WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACTS (with company JOIN) ====================

app.get('/api/contacts', async (req, res) => {
  try {
    const { company_id, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT c.*, co.name AS company_name FROM contacts c LEFT JOIN companies co ON c.company_id = co.id';
    const params = [];
    let pi = 1;
    if (company_id) { query += ` WHERE c.company_id = $${pi++}`; params.push(company_id); }
    query += ` ORDER BY c.created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, co.name AS company_name FROM contacts c LEFT JOIN companies co ON c.company_id = co.id WHERE c.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, job_title, company_id, notes, status } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO contacts (id, first_name, last_name, email, phone, job_title, company_id, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, first_name, last_name, email, phone, job_title, company_id, notes, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, job_title, company_id, notes, status } = req.body;
    const result = await pool.query(
      `UPDATE contacts SET first_name=$1, last_name=$2, email=$3, phone=$4, job_title=$5,
       company_id=$6, notes=$7, status=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
      [first_name, last_name, email, phone, job_title, company_id, notes, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contacts WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCTS (with is_active mapping) ====================

app.get('/api/products', async (req, res) => {
  try {
    const { active_only, category, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let pi = 1;
    if (active_only === 'true') { query += ` AND status = 'active'`; }
    if (category) { query += ` AND category = $${pi++}`; params.push(category); }
    query += ` ORDER BY name LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/stats', async (req, res) => {
  try {
    const active = await pool.query("SELECT COUNT(*) FROM products WHERE status = 'active'");
    const total = await pool.query('SELECT COUNT(*) FROM products');
    const byCategory = await pool.query(
      `SELECT COALESCE(category, 'Uncategorized') as category, COUNT(*) as count, COALESCE(SUM(price), 0) as total_value
       FROM products GROUP BY category`
    );
    const categoryCounts = {};
    byCategory.rows.forEach(r => { categoryCounts[r.category] = { count: parseInt(r.count), totalValue: parseFloat(r.total_value) }; });
    res.json({ activeCount: parseInt(active.rows[0].count), totalCount: parseInt(total.rows[0].count), byCategory: categoryCounts });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, category, price, currency, is_active, status: rawStatus } = req.body;
    const id = uuidv4();
    const status = rawStatus || (is_active === false ? 'inactive' : 'active');
    const result = await pool.query(
      `INSERT INTO products (id, name, description, category, price, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, name, description, category, price, currency || 'EUR', status]
    );
    res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, currency, is_active, status: rawStatus } = req.body;
    const status = rawStatus || (is_active === false ? 'inactive' : is_active === true ? 'active' : undefined);
    const result = await pool.query(
      `UPDATE products SET name=COALESCE($1,name), description=COALESCE($2,description),
       category=COALESCE($3,category), price=COALESCE($4,price), currency=COALESCE($5,currency),
       status=COALESCE($6,status), updated_at=NOW() WHERE id=$7 RETURNING *`,
      [name, description, category, price, currency, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== OPPORTUNITIES (with JOINs + field mapping) ====================

const OPP_JOIN_QUERY = `
  SELECT o.*,
    co.name AS company_name,
    TRIM(CONCAT(ct.first_name, ' ', ct.last_name)) AS contact_name,
    p.name AS product_name
  FROM opportunities o
  LEFT JOIN companies co ON o.company_id = co.id
  LEFT JOIN contacts ct ON o.contact_id = ct.id
  LEFT JOIN products p ON o.product_id = p.id
`;

app.get('/api/opportunities', async (req, res) => {
  try {
    const { company_id, status, limit = 100, offset = 0 } = req.query;
    let query = OPP_JOIN_QUERY + ' WHERE 1=1';
    const params = [];
    let pi = 1;
    if (company_id) { query += ` AND o.company_id = $${pi++}`; params.push(company_id); }
    if (status) { query += ` AND o.status = $${pi++}`; params.push(status); }
    query += ` ORDER BY o.created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(mapOpportunity));
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const result = await pool.query(OPP_JOIN_QUERY + ' WHERE o.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/opportunities', async (req, res) => {
  try {
    const {
      name, company_id, contact_id, product_id,
      stage, status, estimated_value, value, close_date, expected_close_date,
      currency, probability, notes, user_id, owner_id
    } = req.body;
    const id = uuidv4();
    const dbStatus = stage || status || 'new';
    const dbValue = estimated_value ?? value ?? null;
    const dbCloseDate = close_date || expected_close_date || null;
    const dbOwnerId = user_id || owner_id || (req.user ? req.user.id : null);

    const result = await pool.query(
      `INSERT INTO opportunities (id, name, company_id, contact_id, product_id, value, currency, status, probability, expected_close_date, notes, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, name, company_id, contact_id, product_id, dbValue, currency || 'EUR', dbStatus, probability || 0, dbCloseDate, notes, dbOwnerId]
    );
    res.status(201).json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, company_id, contact_id, product_id,
      stage, status, estimated_value, value, close_date, expected_close_date,
      currency, probability, notes
    } = req.body;
    const dbStatus = stage || status;
    const dbValue = estimated_value ?? value;
    const dbCloseDate = close_date || expected_close_date;

    const result = await pool.query(
      `UPDATE opportunities SET
        name=COALESCE($1,name), company_id=$2, contact_id=$3, product_id=$4,
        value=COALESCE($5,value), currency=COALESCE($6,currency),
        status=COALESCE($7,status), probability=COALESCE($8,probability),
        expected_close_date=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, company_id, contact_id, product_id, dbValue, currency, dbStatus, probability, dbCloseDate, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/opportunities/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM opportunities WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TASKS (with JOINs + field mapping) ====================

const TASK_JOIN_QUERY = `
  SELECT t.*,
    opp.name AS opportunity_name,
    TRIM(CONCAT(ct.first_name, ' ', ct.last_name)) AS contact_name,
    co.name AS company_name
  FROM tasks t
  LEFT JOIN opportunities opp ON t.opportunity_id = opp.id
  LEFT JOIN contacts ct ON t.contact_id = ct.id
  LEFT JOIN companies co ON t.company_id = co.id
`;

function enrichTask(row) {
  const t = mapTask(row);
  if (t.related_to_type === 'opportunity') t.related_to_name = row.opportunity_name;
  else if (t.related_to_type === 'contact') t.related_to_name = row.contact_name;
  else if (t.related_to_type === 'company') t.related_to_name = row.company_name;
  return t;
}

app.get('/api/tasks', async (req, res) => {
  try {
    const { status, priority, opportunity_id, contact_id, company_id, limit = 100, offset = 0 } = req.query;
    let query = TASK_JOIN_QUERY + ' WHERE 1=1';
    const params = [];
    let pi = 1;
    if (status) { query += ` AND t.status = $${pi++}`; params.push(status); }
    if (priority) { query += ` AND t.priority = $${pi++}`; params.push(priority); }
    if (opportunity_id) { query += ` AND t.opportunity_id = $${pi++}`; params.push(opportunity_id); }
    if (contact_id) { query += ` AND t.contact_id = $${pi++}`; params.push(contact_id); }
    if (company_id) { query += ` AND t.company_id = $${pi++}`; params.push(company_id); }
    query += ` ORDER BY t.due_date ASC NULLS LAST, t.priority DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(enrichTask));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query(TASK_JOIN_QUERY + ' WHERE t.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(enrichTask(result.rows[0]));
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, company_id, contact_id, opportunity_id, user_id, assigned_to } = req.body;
    const id = uuidv4();
    const dbAssignedTo = assigned_to || user_id || (req.user ? req.user.id : null);
    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, company_id, contact_id, opportunity_id, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, title, description, status || 'not_started', priority || 'medium', due_date, company_id, contact_id, opportunity_id, dbAssignedTo]
    );
    res.status(201).json(mapTask(result.rows[0]));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, completed_at, completed, company_id, contact_id, opportunity_id } = req.body;
    let finalStatus = status;
    let finalCompletedAt = completed_at;
    if (completed === true && finalStatus !== 'completed') { finalStatus = 'completed'; finalCompletedAt = finalCompletedAt || new Date().toISOString(); }
    else if (completed === false && status === 'completed') { finalStatus = 'not_started'; finalCompletedAt = null; }
    const result = await pool.query(
      `UPDATE tasks SET title=COALESCE($1,title), description=$2, status=COALESCE($3,status),
       priority=COALESCE($4,priority), due_date=$5, completed_at=$6,
       company_id=$7, contact_id=$8, opportunity_id=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [title, description, finalStatus, priority, due_date, finalCompletedAt, company_id, contact_id, opportunity_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(mapTask(result.rows[0]));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACT MESSAGES ====================

app.get('/api/contact-messages', async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    let pi = 1;
    if (status) { query += ` AND status = $${pi++}`; params.push(status); }
    if (search) {
      query += ` AND (name ILIKE $${pi} OR email ILIKE $${pi} OR company ILIKE $${pi} OR subject ILIKE $${pi} OR message ILIKE $${pi})`;
      params.push(`%${search}%`); pi++;
    }
    query += ` ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contact-messages/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT status, COUNT(*) as count FROM contact_messages GROUP BY status');
    const stats = { total: 0, new: 0, read: 0, replied: 0, archived: 0 };
    result.rows.forEach(r => { stats[r.status] = parseInt(r.count); stats.total += parseInt(r.count); });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching contact message stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contact-messages/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contact-messages', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, source } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO contact_messages (id, name, email, phone, company, subject, message, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, name, email, phone, company, subject, message, source || 'website']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contact-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await pool.query(
      'UPDATE contact_messages SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contact-messages/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contact_messages WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ACCESS LOGS ====================

app.get('/api/access-logs', async (req, res) => {
  try {
    const { user_id, action, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM access_logs WHERE 1=1';
    const params = [];
    let pi = 1;
    if (user_id) { query += ` AND user_id = $${pi++}`; params.push(user_id); }
    if (action) { query += ` AND action = $${pi++}`; params.push(action); }
    query += ` ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/access-logs/stats', async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? 'WHERE user_id = $1' : '';
    const p = user_id ? [user_id] : [];
    const total = await pool.query(`SELECT COUNT(*) FROM access_logs ${where}`, p);
    const byAction = await pool.query(`SELECT action, COUNT(*) as count FROM access_logs ${where} GROUP BY action ORDER BY count DESC`, p);
    const recent = await pool.query(`SELECT * FROM access_logs ${where} ORDER BY created_at DESC LIMIT 10`, p);
    res.json({ totalLogs: parseInt(total.rows[0].count), byAction: byAction.rows, recentLogs: recent.rows });
  } catch (error) {
    console.error('Error fetching access log stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/access-logs', async (req, res) => {
  try {
    const { action, ip_address, user_agent } = req.body;
    const id = uuidv4();
    const user_id = req.user ? req.user.id : null;
    const result = await pool.query(
      'INSERT INTO access_logs (id, user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, user_id, action, ip_address || req.ip, user_agent || req.headers['user-agent']]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating access log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ACTIVITIES ====================

app.get('/api/activities', async (req, res) => {
  try {
    const { entity_type, entity_id, enriched, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];
    let pi = 1;
    if (entity_type) { query += ` AND entity_type = $${pi++}`; params.push(entity_type); }
    if (entity_id) { query += ` AND entity_id = $${pi++}`; params.push(entity_id); }
    query += ` ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    let activities = result.rows;

    if (enriched === 'true' && activities.length > 0) {
      const cache = {};
      for (const act of activities) {
        if (!act.entity_type || !act.entity_id) continue;
        const key = `${act.entity_type}:${act.entity_id}`;
        if (cache[key] !== undefined) continue;
        try {
          let name = null;
          if (act.entity_type === 'opportunity') { const r = await pool.query('SELECT name FROM opportunities WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'contact') { const r = await pool.query("SELECT TRIM(CONCAT(first_name,' ',last_name)) AS name FROM contacts WHERE id=$1", [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'company') { const r = await pool.query('SELECT name FROM companies WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'product') { const r = await pool.query('SELECT name FROM products WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'task') { const r = await pool.query('SELECT title AS name FROM tasks WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          cache[key] = name;
        } catch { cache[key] = null; }
      }
      activities = activities.map(a => ({ ...a, activity_type: a.type, related_to_type: a.entity_type, related_to: a.entity_id, entity_name: cache[`${a.entity_type}:${a.entity_id}`] || null }));
    } else {
      activities = activities.map(a => ({ ...a, activity_type: a.type, related_to_type: a.entity_type, related_to: a.entity_id }));
    }

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const { type, activity_type, description, entity_type, related_to_type, entity_id, related_to, metadata, user_id } = req.body;
    const id = uuidv4();
    const dbType = type || activity_type;
    const dbEntityType = entity_type || related_to_type;
    const dbEntityId = entity_id || related_to;
    const dbUserId = user_id || (req.user ? req.user.id : null);
    const result = await pool.query(
      'INSERT INTO activities (id, user_id, type, description, entity_type, entity_id, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, dbUserId, dbType, description, dbEntityType, dbEntityId, metadata ? JSON.stringify(metadata) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTER SUBSCRIBERS ====================

app.get('/api/newsletter-subscribers', async (req, res) => {
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

app.get('/api/newsletter-subscribers/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const result = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.json(null);
    const s = result.rows[0];
    res.json({ ...s, status: s.status === 'subscribed' ? 'active' : s.status });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/newsletter-subscribers/by-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    const result = await pool.query('SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = $1', [token]);
    if (result.rows.length === 0) return res.json(null);
    const s = result.rows[0];
    res.json({ ...s, status: s.status === 'subscribed' ? 'active' : s.status });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-subscribers', async (req, res) => {
  try {
    const { email, first_name, last_name, language, source } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].status === 'unsubscribed') {
        const result = await pool.query(
          `UPDATE newsletter_subscribers SET status='subscribed', subscribed_at=NOW(), unsubscribed_at=NULL, source=$1 WHERE email=$2 RETURNING *`,
          [source || 'website', normalizedEmail]
        );
        return res.json({ ...result.rows[0], status: 'active' });
      }
      const s = existing.rows[0];
      return res.json({ ...s, status: s.status === 'subscribed' ? 'active' : s.status });
    }
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (id, email, first_name, last_name, language, status, source, subscribed_at)
       VALUES ($1,$2,$3,$4,$5,'subscribed',$6,NOW()) RETURNING *`,
      [id, normalizedEmail, first_name, last_name, language || 'fr', source || 'website']
    );
    res.status(201).json({ ...result.rows[0], status: 'active' });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-subscribers/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;
    let query = `UPDATE newsletter_subscribers SET status='unsubscribed', unsubscribed_at=NOW() WHERE `;
    const params = [];
    if (token) { query += 'unsubscribe_token = $1'; params.push(token); }
    else if (email) { query += 'email = $1'; params.push(email.toLowerCase()); }
    else { return res.status(400).json({ error: 'Email or token required' }); }
    query += ' RETURNING *';
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/newsletter-subscribers/:id', async (req, res) => {
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

app.get('/api/newsletters', async (req, res) => {
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

app.get('/api/newsletters/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletters', async (req, res) => {
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

app.put('/api/newsletters/:id', async (req, res) => {
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

app.delete('/api/newsletters/:id', async (req, res) => {
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

app.get('/api/newsletter-send-logs', async (req, res) => {
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

app.post('/api/newsletter-send-logs', async (req, res) => {
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

app.put('/api/newsletter-send-logs', async (req, res) => {
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

app.get('/api/newsletter-stats', async (req, res) => {
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

// ==================== WEBHOOK PASSTHROUGH (n8n) ====================

app.post('/api/webhook/newsletter-send', async (req, res) => {
  res.json({ success: true, message: 'Newsletter send queued' });
});

app.post('/api/webhook/newsletter-generate', async (req, res) => {
  res.json({ subject: 'Newsletter AInspiration', content: '' });
});

// ==================== STATIC FILES + SPA FALLBACK ====================

const path = require('path');
const distPath = path.join(__dirname, 'dist');

// Serve static frontend files (if dist/ exists alongside server.js)
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|avif|ico|gif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.xml') || filePath.endsWith('.txt')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// 404 for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback: any non-API route serves index.html
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(distPath, 'index.html'));
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Secure server on ${PORT}`);
});
