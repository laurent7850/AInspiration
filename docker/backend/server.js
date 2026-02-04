const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ainspiration',
  user: process.env.DB_USER || 'ainspiration',
  password: process.env.DB_PASSWORD || 'ainspiration_secret'
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ==================== BLOG POSTS ====================

// Get all blog posts (with optional filters)
app.get('/api/blog-posts', async (req, res) => {
  try {
    const { language, status, category_id, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM blog_posts WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (language) {
      query += ` AND language = $${paramIndex++}`;
      params.push(language);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (category_id) {
      query += ` AND category_id = $${paramIndex++}`;
      params.push(category_id);
    }

    query += ` ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single blog post by slug
app.get('/api/blog-posts/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single blog post by ID
app.get('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create blog post
app.post('/api/blog-posts', async (req, res) => {
  try {
    const { title, slug, excerpt, content, featured_image, category_id, status, language, author_name } = req.body;
    const id = uuidv4();
    const published_at = status === 'published' ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO blog_posts (id, title, slug, excerpt, content, featured_image, category_id, status, published_at, language, author_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, title, slug, excerpt, content, featured_image, category_id, status || 'draft', published_at, language || 'en', author_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update blog post
app.put('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, featured_image, category_id, status, language, author_name } = req.body;

    const result = await pool.query(
      `UPDATE blog_posts SET title = $1, slug = $2, excerpt = $3, content = $4, featured_image = $5,
       category_id = $6, status = $7, language = $8, author_name = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, slug, excerpt, content, featured_image, category_id, status, language, author_name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete blog post
app.delete('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BLOG CATEGORIES ====================

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

app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
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
      `UPDATE companies SET name = $1, industry = $2, website = $3, address = $4, city = $5,
       country = $6, phone = $7, email = $8, notes = $9, status = $10, updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [name, industry, website, address, city, country, phone, email, notes, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACTS ====================

app.get('/api/contacts', async (req, res) => {
  try {
    const { company_id, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM contacts';
    const params = [];

    if (company_id) {
      query += ' WHERE company_id = $1';
      params.push(company_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
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
      `UPDATE contacts SET first_name = $1, last_name = $2, email = $3, phone = $4, job_title = $5,
       company_id = $6, notes = $7, status = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [first_name, last_name, email, phone, job_title, company_id, notes, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCTS ====================

app.get('/api/products', async (req, res) => {
  try {
    const { category, status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, category, price, currency, status } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO products (id, name, description, category, price, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, name, description, category, price, currency || 'EUR', status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, currency, status } = req.body;

    const result = await pool.query(
      `UPDATE products SET name = $1, description = $2, category = $3, price = $4, currency = $5,
       status = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
      [name, description, category, price, currency, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== OPPORTUNITIES ====================

app.get('/api/opportunities', async (req, res) => {
  try {
    const { company_id, status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (company_id) {
      query += ` AND company_id = $${paramIndex++}`;
      params.push(company_id);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/opportunities', async (req, res) => {
  try {
    const { name, company_id, contact_id, value, currency, status, probability, expected_close_date, notes } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO opportunities (id, name, company_id, contact_id, value, currency, status, probability, expected_close_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, name, company_id, contact_id, value, currency || 'EUR', status || 'new', probability || 0, expected_close_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TASKS ====================

app.get('/api/tasks', async (req, res) => {
  try {
    const { status, priority, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }

    query += ` ORDER BY due_date ASC NULLS LAST, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, company_id, contact_id, opportunity_id, assigned_to } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, company_id, contact_id, opportunity_id, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, title, description, status || 'pending', priority || 'medium', due_date, company_id, contact_id, opportunity_id, assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, completed_at } = req.body;

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, due_date = $5,
       completed_at = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date, completed_at, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACT MESSAGES ====================

app.get('/api/contact-messages', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contact-messages', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, source } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO contact_messages (id, name, email, phone, company, subject, message, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
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
      `UPDATE contact_messages SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact message:', error);
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
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ` ORDER BY subscribed_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-subscribers', async (req, res) => {
  try {
    const { email, first_name, last_name, language, source } = req.body;
    const id = uuidv4();

    // Check if already subscribed
    const existing = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].status === 'unsubscribed') {
        // Re-subscribe
        const result = await pool.query(
          `UPDATE newsletter_subscribers SET status = 'subscribed', subscribed_at = NOW() WHERE email = $1 RETURNING *`,
          [email]
        );
        return res.json(result.rows[0]);
      }
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (id, email, first_name, last_name, language, source)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, email, first_name, last_name, language || 'en', source || 'website']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsubscribe
app.post('/api/newsletter-subscribers/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;

    const result = await pool.query(
      `UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW()
       WHERE email = $1 OR unsubscribe_token = $2 RETURNING *`,
      [email, token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTERS ====================

app.get('/api/newsletters', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM newsletters';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletters', async (req, res) => {
  try {
    const { subject, content, language } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO newsletters (id, subject, content, language)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, subject, content, language || 'en']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ACTIVITIES ====================

app.get('/api/activities', async (req, res) => {
  try {
    const { entity_type, entity_id, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (entity_type) {
      query += ` AND entity_type = $${paramIndex++}`;
      params.push(entity_type);
    }
    if (entity_id) {
      query += ` AND entity_id = $${paramIndex++}`;
      params.push(entity_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const { type, description, entity_type, entity_id, metadata } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO activities (id, type, description, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, type, description, entity_type, entity_id, metadata ? JSON.stringify(metadata) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== START SERVER ====================

app.listen(port, () => {
  console.log(`AInspiration API running on port ${port}`);
});
