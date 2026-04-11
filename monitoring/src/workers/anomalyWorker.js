const { analyzeTrafficPatterns, storeAnomalies } = require('../utils/anomalyDetection');

// Run anomaly detection every 5 minutes
const ANOMALY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let anomalyInterval = null;

const startAnomalyDetection = () => {
  if (anomalyInterval) {
    console.log('[Anomaly Detection] Already running');
    return;
  }

  console.log(`[Anomaly Detection] Starting periodic check (every ${ANOMALY_CHECK_INTERVAL / 60000} min)`);

  anomalyInterval = setInterval(async () => {
    try {
      const anomalies = await analyzeTrafficPatterns();

      if (anomalies.length > 0) {
        await storeAnomalies(anomalies);
        console.log(`[Anomaly Detection] Found ${anomalies.length} anomalies`);

        // Log critical anomalies
        const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
        if (criticalAnomalies.length > 0) {
          console.warn(`[CRITICAL] ${criticalAnomalies.length} critical anomalies detected!`);
        }
      }
    } catch (error) {
      console.error('[Anomaly Detection] Error:', error.message);
    }
  }, ANOMALY_CHECK_INTERVAL);

  // Run immediately on start
  analyzeTrafficPatterns()
    .then(anomalies => {
      if (anomalies.length > 0) {
        storeAnomalies(anomalies);
      }
    })
    .catch(err => console.error('[Anomaly Detection] Initial check error:', err.message));
};

const stopAnomalyDetection = () => {
  if (anomalyInterval) {
    clearInterval(anomalyInterval);
    anomalyInterval = null;
    console.log('[Anomaly Detection] Stopped');
  }
};

module.exports = {
  startAnomalyDetection,
  stopAnomalyDetection,
};
