const express = require('express');
const {
  storeRequestLog,
  storeActivityLog,
  getRequestLogs,
  getActivityLogs,
  getAlerts,
  resolveAlert,
  getDashboardStats,
  getIPTracking,
  toggleIPBlock,
} = require('../controllers/monitoringController');

const router = express.Router();

// Public endpoints (called by gateway/services)
router.post('/log', storeRequestLog);
router.post('/activity', storeActivityLog);

// Dashboard endpoints
router.get('/dashboard', getDashboardStats);
router.get('/requests', getRequestLogs);
router.get('/activities', getActivityLogs);
router.get('/alerts', getAlerts);
router.put('/alerts/:id/resolve', resolveAlert);

// Admin endpoints
router.get('/admin/ip-tracking', getIPTracking);
router.put('/admin/ip-tracking/:ip/block', toggleIPBlock);

module.exports = router;
