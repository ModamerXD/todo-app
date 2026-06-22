const db = require('../config/database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const UserModel = {
  async create({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email.toLowerCase(), passwordHash]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  async emailExists(email) {
    const result = await db.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rowCount > 0;
  },

  async usernameExists(username) {
    const result = await db.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );
    return result.rowCount > 0;
  }
};

module.exports = UserModel;
