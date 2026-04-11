const { query } = require('../db/pool');

// Configuration thresholds
const THRESHOLDS = {
  REQUEST_SPIKE: 100,        // requests per minute
  ERROR_SPIKE: 50,           // errors per minute
  UNIQUE_IPS_SPIKE: 50,     // unique IPs per minute
  FAILED_LOGIN_SPIKE: 20,   // failed logins per minute
  UNUSUAL_HOUR_RATIO: 2.5,  // multiplier for off-hours detection
};

// Analyze traffic patterns and detect anomalies
const analyzeTrafficPatterns = async () => {
  try {
    const anomalies = [];

    // 1. Detect request spike (last 5 minutes vs average)
    const recentRequests = await query(`
      SELECT COUNT(*) as count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
    `);

    const avgRequests = await query(`
      SELECT AVG(count) as avg_count
      FROM (
        SELECT COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        GROUP BY EXTRACT(MINUTE FROM timestamp)
      ) subquery
    `);

    const recentCount = parseInt(recentRequests.rows[0].count);
    const avgCount = parseFloat(avgRequests.rows[0].avg_count) || 0;

    if (avgCount > 0 && recentCount > avgCount * THRESHOLDS.UNUSUAL_HOUR_RATIO) {
      anomalies.push({
        type: 'request_spike',
        severity: 'warning',
        message: `Traffic spike detected: ${recentCount} requests in last 5 min (avg: ${Math.round(avgCount)})`,
        details: {
          recentCount,
          avgCount: Math.round(avgCount),
          ratio: (recentCount / avgCount).toFixed(2),
        },
      });
    }

    // 2. Detect error spike
    const recentErrors = await query(`
      SELECT COUNT(*) as count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
        AND status_code >= 400
    `);

    const avgErrors = await query(`
      SELECT AVG(count) as avg_count
      FROM (
        SELECT COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
          AND status_code >= 400
        GROUP BY EXTRACT(MINUTE FROM timestamp)
      ) subquery
    `);

    const errorCount = parseInt(recentErrors.rows[0].count);
    const avgErrorCount = parseFloat(avgErrors.rows[0].avg_count) || 0;

    if (avgErrorCount > 0 && errorCount > avgErrorCount * THRESHOLDS.UNUSUAL_HOUR_RATIO) {
      anomalies.push({
        type: 'error_spike',
        severity: 'critical',
        message: `Error spike detected: ${errorCount} errors in last 5 min (avg: ${Math.round(avgErrorCount)})`,
        details: {
          errorCount,
          avgErrorCount: Math.round(avgErrorCount),
          ratio: (errorCount / avgErrorCount).toFixed(2),
        },
      });
    }

    // 3. Detect unusual number of unique IPs (potential DDoS)
    const uniqueIPs = await query(`
      SELECT COUNT(DISTINCT ip) as count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
    `);

    const uniqueIPCount = parseInt(uniqueIPs.rows[0].count);

    if (uniqueIPCount > THRESHOLDS.UNIQUE_IPS_SPIKE) {
      anomalies.push({
        type: 'unusual_ip_count',
        severity: 'warning',
        message: `Unusual number of unique IPs: ${uniqueIPCount} in last 5 min`,
        details: {
          uniqueIPCount,
          threshold: THRESHOLDS.UNIQUE_IPS_SPIKE,
        },
      });
    }

    // 4. Detect single IP flooding
    const ipFlooding = await query(`
      SELECT ip, COUNT(*) as request_count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '1 minute'
      GROUP BY ip
      HAVING COUNT(*) > 50
      ORDER BY request_count DESC
      LIMIT 10
    `);

    if (ipFlooding.rows.length > 0) {
      anomalies.push({
        type: 'ip_flooding',
        severity: 'critical',
        message: `IP flooding detected: ${ipFlooding.rows.length} IPs with excessive requests`,
        details: {
          offendingIPs: ipFlooding.rows.map(row => ({
            ip: row.ip,
            requests: parseInt(row.request_count),
          })),
        },
      });
    }

    // 5. Detect unusual endpoint access patterns
    const endpointAbuse = await query(`
      SELECT url, COUNT(*) as access_count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
      GROUP BY url
      HAVING COUNT(*) > 100
      ORDER BY access_count DESC
      LIMIT 5
    `);

    if (endpointAbuse.rows.length > 0) {
      anomalies.push({
        type: 'endpoint_abuse',
        severity: 'warning',
        message: `Endpoint abuse detected: ${endpointAbuse.rows.length} endpoints accessed excessively`,
        details: {
          abusedEndpoints: endpointAbuse.rows.map(row => ({
            url: row.url,
            accessCount: parseInt(row.access_count),
          })),
        },
      });
    }

    // 6. Detect off-hours unusual activity
    const currentHour = new Date().getHours();
    const isOffHours = currentHour < 6 || currentHour > 22;

    if (isOffHours) {
      const offHoursActivity = await query(`
        SELECT COUNT(*) as count,
               COUNT(DISTINCT user_id) as unique_users
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '10 minutes'
          AND user_id IS NOT NULL
      `);

      const offHoursCount = parseInt(offHoursActivity.rows[0].count);
      const offHoursUsers = parseInt(offHoursActivity.rows[0].unique_users);

      if (offHoursCount > 50 || offHoursUsers > 5) {
        anomalies.push({
          type: 'off_hours_activity',
          severity: 'info',
          message: `Unusual off-hours activity detected: ${offHoursCount} requests from ${offHoursUsers} users`,
          details: {
            offHoursCount,
            offHoursUsers,
            currentHour,
          },
        });
      }
    }

    return anomalies;
  } catch (error) {
    console.error('Traffic analysis error:', error.message);
    return [];
  }
};

// Store anomalies as alerts
const storeAnomalies = async (anomalies) => {
  try {
    for (const anomaly of anomalies) {
      await query(
        `INSERT INTO alerts (type, severity, message, details)
         VALUES ($1, $2, $3, $4)`,
        [
          anomaly.type,
          anomaly.severity,
          anomaly.message,
          JSON.stringify(anomaly.details),
        ]
      );
    }

    console.log(`[Anomaly Detection] Stored ${anomalies.length} anomalies`);
  } catch (error) {
    console.error('Error storing anomalies:', error.message);
  }
};

// Get traffic statistics
const getTrafficStats = async () => {
  try {
    const [
      requestsLast5Min,
      requestsLastHour,
      requestsLast24Hours,
      avgResponseTime,
      topEndpoints,
      topIPs,
      errorRate,
    ] = await Promise.all([
      query(`
        SELECT COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '5 minutes'
      `),
      query(`
        SELECT COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
      `),
      query(`
        SELECT COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `),
      query(`
        SELECT AVG(EXTRACT(EPOCH FROM 
          (SELECT NOW() - timestamp FROM request_logs ORDER BY timestamp DESC LIMIT 1)
        )) as avg_ms
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
      `),
      query(`
        SELECT url, COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        GROUP BY url
        ORDER BY count DESC
        LIMIT 10
      `),
      query(`
        SELECT ip, COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        GROUP BY ip
        ORDER BY count DESC
        LIMIT 10
      `),
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '1 hour'
      `),
    ]);

    const totalRequests = parseInt(requestsLast24Hours.rows[0].count);
    const totalErrors = parseInt(errorRate.rows[0].errors);
    const errorRatePercent = totalRequests > 0 ? (totalErrors / totalRequests * 100).toFixed(2) : 0;

    return {
      requests: {
        last5Min: parseInt(requestsLast5Min.rows[0].count),
        lastHour: parseInt(requestsLastHour.rows[0].count),
        last24Hours: totalRequests,
      },
      errorRate: `${errorRatePercent}%`,
      topEndpoints: topEndpoints.rows,
      topIPs: topIPs.rows,
    };
  } catch (error) {
    console.error('Error getting traffic stats:', error.message);
    return null;
  }
};

module.exports = {
  analyzeTrafficPatterns,
  storeAnomalies,
  getTrafficStats,
  THRESHOLDS,
};
