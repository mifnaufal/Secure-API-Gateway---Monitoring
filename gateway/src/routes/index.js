const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { proxyToService } = require('../middleware/proxy');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { requireAdmin } = require('../middleware/rbac');
require('dotenv').config();

const router = express.Router();

// Public routes (no auth required)
router.post('/api/auth/login', authRateLimiter, proxyToService(process.env.AUTH_SERVICE_URL, '/auth/login'));
router.post('/api/auth/register', proxyToService(process.env.AUTH_SERVICE_URL, '/auth/register'));
router.post('/api/auth/refresh', proxyToService(process.env.AUTH_SERVICE_URL, '/auth/refresh'));
router.post('/api/auth/logout', authenticateToken, proxyToService(process.env.AUTH_SERVICE_URL, '/auth/logout'));

// Protected routes (auth required)
router.get('/api/auth/me', authenticateToken, proxyToService(process.env.AUTH_SERVICE_URL, '/auth/me'));
router.post('/api/auth/change-password', authenticateToken, proxyToService(process.env.AUTH_SERVICE_URL, '/auth/change-password'));

// Data service routes (auth required)
router.get('/api/data/*', authenticateToken, proxyToService(process.env.DATA_SERVICE_URL, '/data'));
router.post('/api/data/*', authenticateToken, proxyToService(process.env.DATA_SERVICE_URL, '/data'));
router.put('/api/data/*', authenticateToken, proxyToService(process.env.DATA_SERVICE_URL, '/data'));
router.delete('/api/data/*', authenticateToken, proxyToService(process.env.DATA_SERVICE_URL, '/data'));

// Monitoring service routes
router.get('/api/monitoring/*', proxyToService(process.env.MONITORING_SERVICE_URL, '/monitoring'));
router.post('/api/monitoring/*', proxyToService(process.env.MONITORING_SERVICE_URL, '/monitoring'));

// Admin routes (admin role required)
router.get('/api/admin/*', authenticateToken, requireAdmin, proxyToService(process.env.MONITORING_SERVICE_URL, '/monitoring/admin'));

module.exports = router;
