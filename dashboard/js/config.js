// API Configuration
const API_BASE = 'http://localhost:3003';

const API = {
  // Monitoring endpoints
  dashboard: `${API_BASE}/monitoring/dashboard`,
  requests: `${API_BASE}/monitoring/requests`,
  activities: `${API_BASE}/monitoring/activities`,
  alerts: `${API_BASE}/monitoring/alerts`,
  ipTracking: `${API_BASE}/monitoring/admin/ip-tracking`,
  anomalyAnalyze: `${API_BASE}/monitoring/anomaly/analyze`,
  anomalyStats: `${API_BASE}/monitoring/anomaly/stats`,
};

// Helper: resolve alert API endpoint
function resolveAlertUrl(alertId) {
  return `${API_BASE}/monitoring/alerts/${alertId}/resolve`;
}

// Helper: resolve IP block endpoint
function resolveIPBlockUrl(ip) {
  return `${API_BASE}/monitoring/admin/ip-tracking/${encodeURIComponent(ip)}/block`;
}
