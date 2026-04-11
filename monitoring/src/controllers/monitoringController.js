const { query } = require('../db/pool');

// Store request log
const storeRequestLog = async (req, res, next) => {
  try {
    const logData = req.body;

    await query(
      `INSERT INTO request_logs 
       (request_id, timestamp, method, url, status_code, duration, ip, user_agent, user_id, service)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        logData.requestId,
        logData.timestamp,
        logData.method,
        logData.url,
        logData.statusCode,
        logData.duration,
        logData.ip,
        logData.userAgent,
        logData.userId,
        logData.service,
      ]
    );

    // Update IP tracking
    await query(
      `INSERT INTO ip_tracking (ip, last_seen, request_count)
       VALUES ($1, NOW(), 1)
       ON CONFLICT (ip) DO UPDATE SET
         last_seen = NOW(),
         request_count = ip_tracking.request_count + 1`,
      [logData.ip]
    );

    res.status(201).json({ message: 'Log stored' });
  } catch (error) {
    console.error('Error storing request log:', error.message);
    res.status(500).json({ error: { message: 'Failed to store log', code: 'LOG_STORE_ERROR' } });
  }
};

// Store activity log
const storeActivityLog = async (req, res, next) => {
  try {
    const activityData = req.body;

    await query(
      `INSERT INTO activity_logs 
       (timestamp, action, user_id, ip, user_agent, success, service)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        activityData.timestamp,
        activityData.action,
        activityData.userId,
        activityData.ip,
        activityData.userAgent,
        activityData.success,
        activityData.service,
      ]
    );

    // Track failed logins for brute force detection
    if (activityData.action === 'login' && !activityData.success) {
      await query(
        `INSERT INTO ip_tracking (ip, last_seen, failed_login_count)
         VALUES ($1, NOW(), 1)
         ON CONFLICT (ip) DO UPDATE SET
           last_seen = NOW(),
           failed_login_count = ip_tracking.failed_login_count + 1`,
        [activityData.ip]
      );

      // Check if IP should be blocked (more than 10 failed attempts)
      const result = await query(
        'SELECT failed_login_count FROM ip_tracking WHERE ip = $1',
        [activityData.ip]
      );

      if (result.rows[0]?.failed_login_count >= 10) {
        await query(
          `UPDATE ip_tracking 
           SET is_blocked = true, 
               block_reason = 'Multiple failed login attempts',
               blocked_at = NOW()
           WHERE ip = $1`,
          [activityData.ip]
        );

        // Create alert
        await query(
          `INSERT INTO alerts (type, severity, message, details, ip, user_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'brute_force_detected',
            'critical',
            `IP ${activityData.ip} blocked due to multiple failed login attempts`,
            JSON.stringify({ failedAttempts: result.rows[0].failed_login_count }),
            activityData.ip,
            activityData.userId,
          ]
        );
      }
    }

    res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    console.error('Error storing activity log:', error.message);
    res.status(500).json({ error: { message: 'Failed to store activity', code: 'ACTIVITY_STORE_ERROR' } });
  }
};

// Get request logs
const getRequestLogs = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, status_code, service, user_id, start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status_code) {
      whereClause += ` AND status_code = $${paramIndex}`;
      params.push(parseInt(status_code));
      paramIndex++;
    }

    if (service) {
      whereClause += ` AND service = $${paramIndex}`;
      params.push(service);
      paramIndex++;
    }

    if (user_id) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (start_date) {
      whereClause += ` AND timestamp >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      whereClause += ` AND timestamp <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM request_logs 
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get activity logs
const getActivityLogs = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, action, user_id, success, start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (action) {
      whereClause += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (user_id) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (success !== undefined) {
      whereClause += ` AND success = $${paramIndex}`;
      params.push(success === 'true');
      paramIndex++;
    }

    if (start_date) {
      whereClause += ` AND timestamp >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      whereClause += ` AND timestamp <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM activity_logs 
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get alerts
const getAlerts = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, severity, type, is_resolved } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (severity) {
      whereClause += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (is_resolved !== undefined) {
      whereClause += ` AND is_resolved = $${paramIndex}`;
      params.push(is_resolved === 'true');
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM alerts 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Resolve alert
const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      `UPDATE alerts SET is_resolved = true, resolved_at = NOW() WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Alert resolved' });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalRequests,
      totalActivities,
      totalAlerts,
      activeAlerts,
      blockedIPs,
      requestsByStatus,
      requestsByService,
      recentActivities,
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM request_logs'),
      query('SELECT COUNT(*) FROM activity_logs'),
      query('SELECT COUNT(*) FROM alerts'),
      query('SELECT COUNT(*) FROM alerts WHERE is_resolved = false'),
      query('SELECT COUNT(*) FROM ip_tracking WHERE is_blocked = true'),
      query(`
        SELECT status_code, COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY status_code
        ORDER BY count DESC
      `),
      query(`
        SELECT service, COUNT(*) as count
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY service
        ORDER BY count DESC
      `),
      query(`
        SELECT action, COUNT(*) as count
        FROM activity_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    res.json({
      data: {
        totalRequests: parseInt(totalRequests.rows[0].count),
        totalActivities: parseInt(totalActivities.rows[0].count),
        totalAlerts: parseInt(totalAlerts.rows[0].count),
        activeAlerts: parseInt(activeAlerts.rows[0].count),
        blockedIPs: parseInt(blockedIPs.rows[0].count),
        requestsByStatus: requestsByStatus.rows,
        requestsByService: requestsByService.rows,
        recentActivities: recentActivities.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get IP tracking
const getIPTracking = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, is_blocked } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (is_blocked !== undefined) {
      whereClause += ` AND is_blocked = $${paramIndex}`;
      params.push(is_blocked === 'true');
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM ip_tracking 
       ${whereClause}
       ORDER BY last_seen DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Block/unblock IP
const toggleIPBlock = async (req, res, next) => {
  try {
    const { ip } = req.params;
    const { is_blocked, reason } = req.body;

    if (is_blocked) {
      await query(
        `UPDATE ip_tracking SET is_blocked = true, block_reason = $2, blocked_at = NOW() WHERE ip = $1`,
        [ip, reason || 'Manually blocked']
      );
    } else {
      await query(
        `UPDATE ip_tracking SET is_blocked = false, block_reason = NULL, blocked_at = NULL WHERE ip = $1`,
        [ip]
      );
    }

    res.json({ message: `IP ${is_blocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  storeRequestLog,
  storeActivityLog,
  getRequestLogs,
  getActivityLogs,
  getAlerts,
  resolveAlert,
  getDashboardStats,
  getIPTracking,
  toggleIPBlock,
};
