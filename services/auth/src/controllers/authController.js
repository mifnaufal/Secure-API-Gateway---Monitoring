const jwt = require('jsonwebtoken');
const { query, transaction } = require('../db/pool');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { generateTokens, verifyRefreshToken } = require('../utils/tokens');
const { blacklistToken } = require('../utils/tokenBlacklist');

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const existing = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: { message: 'Username or email already exists', code: 'DUPLICATE_USER' },
      });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Store refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, refreshToken]
    );

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const result = await query(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: { message: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' },
      });
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      // Track failed login attempt
      await query(
        `INSERT INTO login_attempts (username, ip_address, success, attempted_at) 
         VALUES ($1, $2, false, NOW())`,
        [username, req.ip]
      );

      return res.status(401).json({
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      });
    }

    // Track successful login
    await query(
      `INSERT INTO login_attempts (username, ip_address, success, user_id, attempted_at) 
       VALUES ($1, $2, true, $3, NOW())`,
      [username, req.ip, user.id]
    );

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Store refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, refreshToken]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      error: { message: 'Refresh token required', code: 'MISSING_TOKEN' },
    });
  }

  try {
    const payload = verifyRefreshToken(token);

    // Check if token exists in DB and not revoked
    const result = await query(
      'SELECT id, user_id, expires_at, is_revoked FROM refresh_tokens WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0 || result.rows[0].is_revoked) {
      return res.status(401).json({
        error: { message: 'Invalid or revoked refresh token', code: 'INVALID_TOKEN' },
      });
    }

    // Get user
    const userResult = await query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [result.rows[0].user_id]
    );

    const user = userResult.rows[0];

    // Revoke old token
    await query('UPDATE refresh_tokens SET is_revoked = true WHERE id = $1', [result.rows[0].id]);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Store new refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, newRefreshToken]
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { message: 'Refresh token expired', code: 'TOKEN_EXPIRED' },
      });
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (token) {
      await blacklistToken(token);
    }

    // Revoke all refresh tokens for user
    await query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1 AND is_revoked = false',
      [req.user.id]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const isValid = await comparePassword(currentPassword, result.rows[0].password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: { message: 'Current password is incorrect', code: 'INVALID_PASSWORD' },
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getProfile, changePassword };
