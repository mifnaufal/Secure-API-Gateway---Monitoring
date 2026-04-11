const { query } = require('../db/pool');

const blacklistToken = async (token) => {
  // In production, use Redis for token blacklist with TTL
  // For now, store in a simple table
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        token TEXT PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    if (decoded && decoded.exp) {
      await query(
        'INSERT INTO token_blacklist (token, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT (token) DO NOTHING',
        [token, decoded.exp]
      );
    }
  } catch (error) {
    console.error('Error blacklisting token:', error.message);
  }
};

const isTokenBlacklisted = async (token) => {
  try {
    const result = await query(
      'SELECT id FROM token_blacklist WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
};

module.exports = { blacklistToken, isTokenBlacklisted };
