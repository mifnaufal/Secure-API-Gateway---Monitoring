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
const {
  analyzeTrafficPatterns,
  storeAnomalies,
  getTrafficStats,
} = require('../controllers/anomalyController');

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

// Anomaly detection endpoints
router.get('/anomaly/analyze', analyzeTrafficPatterns);
router.get('/anomaly/stats', getTrafficStats);

// Admin endpoints
router.get('/admin/ip-tracking', getIPTracking);
router.put('/admin/ip-tracking/:ip/block', toggleIPBlock);

module.exports = router;
