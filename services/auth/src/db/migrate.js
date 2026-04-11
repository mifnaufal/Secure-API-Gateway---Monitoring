const { pool } = require('./pool');

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(30) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      last_login TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createRefreshTokensTable = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_revoked BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createLoginAttemptsTable = `
    CREATE TABLE IF NOT EXISTS login_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255),
      user_id UUID REFERENCES users(id),
      ip_address INET,
      success BOOLEAN,
      attempted_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createIndexQueries = [
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
    'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);',
    'CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);',
    'CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);',
  ];

  try {
    await pool.query(createUsersTable);
    await pool.query(createRefreshTokensTable);
    await pool.query(createLoginAttemptsTable);

    for (const indexQuery of createIndexQueries) {
      await pool.query(indexQuery);
    }

    console.log('Database tables created successfully');

    // Create default admin user if not exists
    const bcrypt = require('bcryptjs');
    const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role) 
         VALUES ($1, $2, $3, 'admin')`,
        ['admin', 'admin@example.com', hashedPassword]
      );
      console.log('Default admin user created (username: admin, password: Admin123!)');
    }
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
};

module.exports = { createTables };
