const { query } = require('../db/pool');

const getItems = async (req, res, next) => {
  try {
    const { category, search, limit = 20, offset = 0, sort = 'created_at', order = 'DESC' } = req.query;

    let whereClause = 'WHERE is_active = true';
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const itemsQuery = `
      SELECT id, name, description, category, price, created_by, created_at, updated_at
      FROM items
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), parseInt(offset));

    const countQuery = `SELECT COUNT(*) FROM items ${whereClause}`;
    const countParams = params.slice(0, -2);

    const [itemsResult, countResult] = await Promise.all([
      query(itemsQuery, params),
      query(countQuery, countParams),
    ]);

    res.json({
      data: itemsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, description, category, price, created_by, created_at, updated_at FROM items WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { message: 'Item not found', code: 'ITEM_NOT_FOUND' },
      });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  const { name, description, category, price } = req.body;

  try {
    const result = await query(
      `INSERT INTO items (name, description, category, price, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, category, price, created_by, created_at, updated_at`,
      [name, description, category, price, req.user.id]
    );

    // Log activity
    await query(
      `INSERT INTO activities (user_id, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, 'create_item', 'item', $2, $3, $4)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ name, category }), req.ip]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, category, price } = req.body;

  try {
    // Get current values
    const currentResult = await query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        error: { message: 'Item not found', code: 'ITEM_NOT_FOUND' },
      });
    }

    const oldValues = currentResult.rows[0];

    const result = await query(
      `UPDATE items
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           price = COALESCE($4, price),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, description, category, price, created_by, created_at, updated_at`,
      [name, description, category, price, id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, 'update_item', 'item', $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        id,
        JSON.stringify({ name: oldValues.name, category: oldValues.category, price: oldValues.price }),
        JSON.stringify({ name, category, price }),
        req.ip,
        req.headers['user-agent'],
      ]
    );

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await query(
      'UPDATE items SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { message: 'Item not found', code: 'ITEM_NOT_FOUND' },
      });
    }

    // Log activity
    await query(
      `INSERT INTO activities (user_id, action, resource_type, resource_id, ip_address)
       VALUES ($1, 'delete_item', 'item', $2, $3)`,
      [req.user.id, id, req.ip]
    );

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getActivities = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT id, user_id, action, resource_type, resource_id, details, ip_address, created_at
       FROM activities
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getActivities,
};
