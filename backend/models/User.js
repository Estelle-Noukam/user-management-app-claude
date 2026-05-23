const pool = require('../config/db');
const bcrypt = require('bcrypt');
const ROUNDS = 12;

const User = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, bio, created_at, updated_at FROM users ORDER BY id'
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, bio, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async create({ username, email, password, role = 'user', first_name = '', last_name = '', bio = '' }) {
    const password_hash = await bcrypt.hash(password, ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, bio)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, username, email, role, first_name, last_name, bio, created_at, updated_at`,
      [username, email, password_hash, role, first_name, last_name, bio]
    );
    return rows[0];
  },

  async update(id, { username, email, role, first_name, last_name, bio }) {
    const { rows } = await pool.query(
      `UPDATE users SET username=$1, email=$2, role=$3, first_name=$4, last_name=$5, bio=$6
       WHERE id=$7
       RETURNING id, username, email, role, first_name, last_name, bio, created_at, updated_at`,
      [username, email, role, first_name, last_name, bio, id]
    );
    return rows[0] || null;
  },

  async updateProfile(id, { first_name, last_name, bio, email }) {
    const { rows } = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, bio=$3, email=$4
       WHERE id=$5
       RETURNING id, username, email, role, first_name, last_name, bio, created_at, updated_at`,
      [first_name, last_name, bio, email, id]
    );
    return rows[0] || null;
  },

  async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, ROUNDS);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password_hash, id]);
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [id]);
    return rowCount > 0;
  },

  async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },

  async emailExists(email, excludeId = null) {
    const q = excludeId
      ? 'SELECT 1 FROM users WHERE email=$1 AND id != $2'
      : 'SELECT 1 FROM users WHERE email=$1';
    const params = excludeId ? [email, excludeId] : [email];
    const { rowCount } = await pool.query(q, params);
    return rowCount > 0;
  },

  async usernameExists(username, excludeId = null) {
    const q = excludeId
      ? 'SELECT 1 FROM users WHERE username=$1 AND id != $2'
      : 'SELECT 1 FROM users WHERE username=$1';
    const params = excludeId ? [username, excludeId] : [username];
    const { rowCount } = await pool.query(q, params);
    return rowCount > 0;
  },
};

module.exports = User;
