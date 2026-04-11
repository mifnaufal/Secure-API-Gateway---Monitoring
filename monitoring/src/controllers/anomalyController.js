const {
  analyzeTrafficPatterns: analyzeTraffic,
  storeAnomalies,
  getTrafficStats: getTrafficData,
} = require('../utils/anomalyDetection');

// Analyze traffic and return anomalies
const analyzeTrafficPatterns = async (req, res, next) => {
  try {
    const anomalies = await analyzeTraffic();

    // Store anomalies as alerts
    if (anomalies.length > 0) {
      await storeAnomalies(anomalies);
    }

    res.json({
      anomalies,
      count: anomalies.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Get traffic statistics
const getTrafficStats = async (req, res, next) => {
  try {
    const stats = await getTrafficData();

    if (!stats) {
      return res.status(500).json({
        error: { message: 'Failed to get traffic stats', code: 'STATS_ERROR' },
      });
    }

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeTrafficPatterns,
  storeAnomalies,
  getTrafficStats,
};
