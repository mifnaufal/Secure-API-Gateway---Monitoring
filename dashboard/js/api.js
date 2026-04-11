// API Helper Functions
const api = {
  async get(url, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(url, body = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async put(url, body = {}) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  // Dashboard
  async getDashboard() {
    return this.get(API.dashboard);
  },

  // Request Logs
  async getRequestLogs(params = {}) {
    return this.get(API.requests, params);
  },

  // Activity Logs
  async getActivityLogs(params = {}) {
    return this.get(API.activities, params);
  },

  // Alerts
  async getAlerts(params = {}) {
    return this.get(API.alerts, params);
  },

  async resolveAlert(alertId) {
    return this.put(resolveAlertUrl(alertId));
  },

  // IP Tracking
  async getIPTracking(params = {}) {
    return this.get(API.ipTracking, params);
  },

  async blockIP(ip, isBlocked = true, reason = '') {
    return this.put(resolveIPBlockUrl(ip), {
      is_blocked: isBlocked,
      reason: reason || (isBlocked ? 'Manually blocked' : 'Manually unblocked'),
    });
  },

  // Anomaly Detection
  async analyzeAnomalies() {
    return this.get(API.anomalyAnalyze);
  },

  async getTrafficStats() {
    return this.get(API.anomalyStats);
  },
};
