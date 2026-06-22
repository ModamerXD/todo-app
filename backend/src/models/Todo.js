const db = require('../config/database');

const TodoModel = {
  async create({ userId, title, description, priority, dueDate }) {
    const result = await db.query(
      `INSERT INTO todos (user_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, description || null, priority || 'medium', dueDate || null]
    );
    return result.rows[0];
  },

  async findAllByUser(userId, { completed, priority } = {}) {
    let queryText = `
      SELECT * FROM todos
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramCount = 2;

    if (completed !== undefined) {
      queryText += ` AND completed = $${paramCount}`;
      params.push(completed === 'true' || completed === true);
      paramCount++;
    }
    if (priority) {
      queryText += ` AND priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await db.query(queryText, params);
    return result.rows;
  },

  async findById(id, userId) {
    const result = await db.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async update(id, userId, { title, description, completed, priority, dueDate }) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      fields.push(`title = $${paramCount}`); params.push(title); paramCount++;
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount}`); params.push(description); paramCount++;
    }
    if (completed !== undefined) {
      fields.push(`completed = $${paramCount}`); params.push(completed); paramCount++;
    }
    if (priority !== undefined) {
      fields.push(`priority = $${paramCount}`); params.push(priority); paramCount++;
    }
    if (dueDate !== undefined) {
      fields.push(`due_date = $${paramCount}`); params.push(dueDate); paramCount++;
    }

    if (fields.length === 0) return null;

    params.push(id, userId);
    const result = await db.query(
      `UPDATE todos SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async delete(id, userId) {
    const result = await db.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rowCount > 0;
  },

  async getStats(userId) {
    const result = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE TRUE) AS total,
         COUNT(*) FILTER (WHERE completed = TRUE) AS completed,
         COUNT(*) FILTER (WHERE completed = FALSE) AS pending,
         COUNT(*) FILTER (WHERE priority = 'high' AND completed = FALSE) AS high_priority_pending
       FROM todos WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }
};

module.exports = TodoModel;
