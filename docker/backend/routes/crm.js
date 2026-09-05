'use strict';
/**
 * crm routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    app,
    formLimiter,
    mapOpportunity,
    mapProduct,
    mapTask,
    ownerScope,
    pool,
    recordAccessLog,
    rejectHoneypot,
    requireAuth,
    schemas,
    updateSchemas,
    uuidv4,
    validateBody,
    validateUuidParam
  } = ctx;

// ==================== COMPANIES ====================

app.get('/api/companies', requireAuth, async (req, res) => {
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

app.get('/api/companies/search', requireAuth, async (req, res) => {
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

app.get('/api/companies/stats', requireAuth, async (req, res) => {
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

app.get('/api/companies/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/companies', requireAuth, validateBody(schemas.company), async (req, res) => {
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

app.put('/api/companies/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.company), async (req, res) => {
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

app.delete('/api/companies/:id', requireAuth, validateUuidParam(), async (req, res) => {
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

app.get('/api/contacts', requireAuth, async (req, res) => {
  try {
    const { company_id, limit = 100, offset = 0 } = req.query;
    const owner = ownerScope(req);
    let baseWhere = ' FROM contacts c WHERE ($1::uuid IS NULL OR c.owner_id = $1)';
    const params = [owner];
    let pi = 2;
    if (company_id) { baseWhere += ` AND c.company_id = $${pi++}`; params.push(company_id); }

    // Total count for pagination
    const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseWhere}`, params);
    res.set('X-Total-Count', String(countResult.rows[0].total));
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');

    const dataParams = [...params, parseInt(limit), parseInt(offset)];
    const dataQuery = `SELECT c.*, co.name AS company_name${baseWhere.replace(' FROM contacts c', ' FROM contacts c LEFT JOIN companies co ON c.company_id = co.id')} ORDER BY c.created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    const result = await pool.query(dataQuery, dataParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contacts/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const owner = ownerScope(req);
    const result = await pool.query(
      'SELECT c.*, co.name AS company_name FROM contacts c LEFT JOIN companies co ON c.company_id = co.id WHERE c.id = $1 AND ($2::uuid IS NULL OR c.owner_id = $2)',
      [req.params.id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contacts', requireAuth, validateBody(schemas.contact), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, job_title, company_id, notes, status } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO contacts (id, first_name, last_name, email, phone, job_title, company_id, notes, status, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, first_name, last_name, email, phone, job_title, company_id, notes, status || 'active', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contacts/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.contact), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, job_title, company_id, notes, status } = req.body;
    const owner = ownerScope(req);
    const result = await pool.query(
      `UPDATE contacts SET first_name=$1, last_name=$2, email=$3, phone=$4, job_title=$5,
       company_id=$6, notes=$7, status=$8, updated_at=NOW()
       WHERE id=$9 AND ($10::uuid IS NULL OR owner_id = $10) RETURNING *`,
      [first_name, last_name, email, phone, job_title, company_id, notes, status, id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contacts/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const owner = ownerScope(req);
    const result = await pool.query(
      'DELETE FROM contacts WHERE id=$1 AND ($2::uuid IS NULL OR owner_id = $2) RETURNING *',
      [req.params.id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCTS (with is_active mapping) ====================

app.get('/api/products', requireAuth, async (req, res) => {
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

app.get('/api/products/stats', requireAuth, async (req, res) => {
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

app.get('/api/products/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', requireAuth, validateBody(schemas.product), async (req, res) => {
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

app.put('/api/products/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.product), async (req, res) => {
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

app.delete('/api/products/:id', requireAuth, validateUuidParam(), async (req, res) => {
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

app.get('/api/opportunities', requireAuth, async (req, res) => {
  try {
    const { company_id, status, limit = 100, offset = 0 } = req.query;
    const owner = ownerScope(req);
    let query = OPP_JOIN_QUERY + ' WHERE ($1::uuid IS NULL OR o.owner_id = $1)';
    const params = [owner];
    let pi = 2;
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

app.get('/api/opportunities/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const owner = ownerScope(req);
    const result = await pool.query(
      OPP_JOIN_QUERY + ' WHERE o.id = $1 AND ($2::uuid IS NULL OR o.owner_id = $2)',
      [req.params.id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/opportunities', requireAuth, validateBody(schemas.opportunity), async (req, res) => {
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
    // Only admin can assign ownership to another user; non-admin always owns their inserts.
    const dbOwnerId = (req.user.role === 'admin' && (user_id || owner_id)) ? (user_id || owner_id) : req.user.id;

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

app.put('/api/opportunities/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.opportunity), async (req, res) => {
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
    const owner = ownerScope(req);

    const result = await pool.query(
      `UPDATE opportunities SET
        name=COALESCE($1,name), company_id=$2, contact_id=$3, product_id=$4,
        value=COALESCE($5,value), currency=COALESCE($6,currency),
        status=COALESCE($7,status), probability=COALESCE($8,probability),
        expected_close_date=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 AND ($12::uuid IS NULL OR owner_id = $12) RETURNING *`,
      [name, company_id, contact_id, product_id, dbValue, currency, dbStatus, probability, dbCloseDate, notes, id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/opportunities/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const owner = ownerScope(req);
    const result = await pool.query(
      'DELETE FROM opportunities WHERE id=$1 AND ($2::uuid IS NULL OR owner_id = $2) RETURNING *',
      [req.params.id, owner]
    );
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

app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { status, priority, opportunity_id, contact_id, company_id, limit = 100, offset = 0 } = req.query;
    const owner = ownerScope(req);
    let query = TASK_JOIN_QUERY + ' WHERE ($1::uuid IS NULL OR t.assigned_to = $1)';
    const params = [owner];
    let pi = 2;
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

app.get('/api/tasks/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const owner = ownerScope(req);
    const result = await pool.query(
      TASK_JOIN_QUERY + ' WHERE t.id = $1 AND ($2::uuid IS NULL OR t.assigned_to = $2)',
      [req.params.id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(enrichTask(result.rows[0]));
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', requireAuth, validateBody(schemas.task), async (req, res) => {
  try {
    const { title, description, status, priority, due_date, company_id, contact_id, opportunity_id, user_id, assigned_to } = req.body;
    const id = uuidv4();
    // Only admin can assign tasks to another user; non-admin always assigns to self.
    const dbAssignedTo = (req.user.role === 'admin' && (assigned_to || user_id)) ? (assigned_to || user_id) : req.user.id;
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

app.put('/api/tasks/:id', requireAuth, validateUuidParam(), validateBody(updateSchemas.task), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, completed_at, completed, company_id, contact_id, opportunity_id } = req.body;
    let finalStatus = status;
    let finalCompletedAt = completed_at;
    if (completed === true && finalStatus !== 'completed') { finalStatus = 'completed'; finalCompletedAt = finalCompletedAt || new Date().toISOString(); }
    else if (completed === false && status === 'completed') { finalStatus = 'not_started'; finalCompletedAt = null; }
    const owner = ownerScope(req);
    const result = await pool.query(
      `UPDATE tasks SET title=COALESCE($1,title), description=$2, status=COALESCE($3,status),
       priority=COALESCE($4,priority), due_date=$5, completed_at=$6,
       company_id=$7, contact_id=$8, opportunity_id=$9, updated_at=NOW()
       WHERE id=$10 AND ($11::uuid IS NULL OR assigned_to = $11) RETURNING *`,
      [title, description, finalStatus, priority, due_date, finalCompletedAt, company_id, contact_id, opportunity_id, id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(mapTask(result.rows[0]));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const owner = ownerScope(req);
    const result = await pool.query(
      'DELETE FROM tasks WHERE id=$1 AND ($2::uuid IS NULL OR assigned_to = $2) RETURNING *',
      [req.params.id, owner]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACT MESSAGES ====================

app.get('/api/contact-messages', requireAuth, async (req, res) => {
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

app.get('/api/contact-messages/stats', requireAuth, async (req, res) => {
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

app.get('/api/contact-messages/:id', requireAuth, validateUuidParam(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contact-messages', formLimiter, rejectHoneypot, validateBody(schemas.contactMessage), async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, source } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO contact_messages (id, name, email, phone, company, subject, message, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, name, email, phone || null, company || null, subject || null, message, source || 'website']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contact-messages/:id', requireAuth, validateUuidParam(), validateBody(schemas.contactMessageUpdate), async (req, res) => {
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

app.delete('/api/contact-messages/:id', requireAuth, validateUuidParam(), async (req, res) => {
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

app.get('/api/access-logs', requireAuth, async (req, res) => {
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

app.get('/api/access-logs/stats', requireAuth, async (req, res) => {
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

// SECURITY: authenticated only. Login/logout events are recorded server-side by
// recordAccessLog(); this endpoint remains for in-app events of a logged-in user.
// The client-supplied ip_address/user_agent are ignored on purpose.
app.post('/api/access-logs', requireAuth, validateBody(schemas.accessLog), async (req, res) => {
  try {
    const { action } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO access_logs (id, user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, req.user.id, action, req.ip || null, (req.headers['user-agent'] || '').slice(0, 500)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating access log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ACTIVITIES ====================

app.get('/api/activities', requireAuth, async (req, res) => {
  try {
    const { entity_type, entity_id, enriched, limit = 50, offset = 0 } = req.query;
    const owner = ownerScope(req);
    let query = 'SELECT * FROM activities WHERE ($1::uuid IS NULL OR user_id = $1)';
    const params = [owner];
    let pi = 2;
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

app.post('/api/activities', requireAuth, validateBody(schemas.activity), async (req, res) => {
  try {
    const { type, activity_type, description, entity_type, related_to_type, entity_id, related_to, metadata, user_id } = req.body;
    const id = uuidv4();
    const dbType = type || activity_type;
    const dbEntityType = entity_type || related_to_type;
    const dbEntityId = entity_id || related_to;
    // Only admin can attribute activities to another user; non-admin always attributes to self.
    const dbUserId = (req.user.role === 'admin' && user_id) ? user_id : req.user.id;
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

};
