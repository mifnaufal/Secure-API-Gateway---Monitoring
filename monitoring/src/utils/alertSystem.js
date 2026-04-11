const { query } = require('../db/pool');

// Alert type definitions
const ALERT_TYPES = {
  BRUTE_FORCE: 'brute_force_detected',
  REQUEST_SPIKE: 'request_spike',
  ERROR_SPIKE: 'error_spike',
  SERVICE_DOWN: 'service_down',
  UNUSUAL_IP: 'unusual_ip_activity',
  IP_FLOODING: 'ip_flooding',
  ENDPOINT_ABUSE: 'endpoint_abuse',
  OFF_HOURS_ACTIVITY: 'off_hours_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  DATABASE_ERROR: 'database_error',
  TOKEN_ABUSE: 'token_abuse',
};

// Severity levels
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// Create alert
const createAlert = async (type, severity, message, details = {}, ip = null, userId = null) => {
  try {
    const result = await query(
      `INSERT INTO alerts (type, severity, message, details, ip, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [type, severity, message, JSON.stringify(details), ip, userId]
    );

    const alertId = result.rows[0].id;

    // Trigger notifications for critical alerts
    if (severity === SEVERITY.CRITICAL) {
      await triggerNotifications(alertId, type, severity, message, details);
    }

    return alertId;
  } catch (error) {
    console.error('Error creating alert:', error.message);
    return null;
  }
};

// Trigger notifications for alerts
const triggerNotifications = async (alertId, type, severity, message, details) => {
  try {
    // Webhook notification
    if (process.env.WEBHOOK_URL) {
      await sendWebhookNotification(alertId, type, severity, message, details);
    }

    // Email notification (if configured)
    if (process.env.SMTP_HOST && process.env.ALERT_EMAIL) {
      await sendEmailNotification(alertId, type, severity, message, details);
    }

    // Log notification
    console.log(`[Alert Notification] ${severity.toUpperCase()} alert triggered: ${message}`);
  } catch (error) {
    console.error('Error triggering notifications:', error.message);
  }
};

// Send webhook notification
const sendWebhookNotification = async (alertId, type, severity, message, details) => {
  try {
    const payload = {
      alert_id: alertId,
      type,
      severity,
      message,
      details,
      timestamp: new Date().toISOString(),
      service: 'secure-api-gateway',
    };

    await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.WEBHOOK_SECRET ? `Bearer ${process.env.WEBHOOK_SECRET}` : '',
      },
      body: JSON.stringify(payload),
    });

    console.log(`[Webhook] Alert ${alertId} sent to ${process.env.WEBHOOK_URL}`);
  } catch (error) {
    console.error('Webhook notification error:', error.message);
  }
};

// Send email notification
const sendEmailNotification = async (alertId, type, severity, message, details) => {
  try {
    // Basic email using nodemailer (install if needed)
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'alerts@secure-gateway.com',
      to: process.env.ALERT_EMAIL,
      subject: `[${severity.toUpperCase()}] Security Alert: ${type}`,
      text: `
Alert ID: ${alertId}
Type: ${type}
Severity: ${severity}
Message: ${message}
Time: ${new Date().toISOString()}
Details: ${JSON.stringify(details, null, 2)}
      `,
      html: `
<h2>Security Alert</h2>
<table>
  <tr><td><strong>Alert ID:</strong></td><td>${alertId}</td></tr>
  <tr><td><strong>Type:</strong></td><td>${type}</td></tr>
  <tr><td><strong>Severity:</strong></td><td><span style="color: ${severity === 'critical' ? 'red' : 'orange'}">${severity}</span></td></tr>
  <tr><td><strong>Message:</strong></td><td>${message}</td></tr>
  <tr><td><strong>Time:</strong></td><td>${new Date().toISOString()}</td></tr>
  <tr><td><strong>Details:</strong></td><td><pre>${JSON.stringify(details, null, 2)}</pre></td></tr>
</table>
      `,
    });

    console.log(`[Email] Alert ${alertId} sent to ${process.env.ALERT_EMAIL}`);
  } catch (error) {
    console.error('Email notification error:', error.message);
  }
};

// Check and create alerts for various conditions
const checkAlertConditions = async () => {
  try {
    // 1. Check for service health
    const services = [
      { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
      { name: 'data', url: process.env.DATA_SERVICE_URL || 'http://localhost:3002' },
    ];

    for (const service of services) {
      try {
        const response = await fetch(`${service.url}/health`, { method: 'GET' });
        if (!response.ok) {
          await createAlert(
            ALERT_TYPES.SERVICE_DOWN,
            SEVERITY.CRITICAL,
            `Service ${service.name} is down`,
            { service: service.name, url: service.url },
          );
        }
      } catch (error) {
        await createAlert(
          ALERT_TYPES.SERVICE_DOWN,
          SEVERITY.CRITICAL,
          `Service ${service.name} is unreachable`,
          { service: service.name, error: error.message },
        );
      }
    }

    // 2. Check for database connectivity
    try {
      await query('SELECT 1');
    } catch (error) {
      await createAlert(
        ALERT_TYPES.DATABASE_ERROR,
        SEVERITY.CRITICAL,
        'Database connection failed',
        { error: error.message },
      );
    }

    // 3. Check for token abuse (multiple invalid token attempts)
    const tokenAbuse = await query(`
      SELECT ip, COUNT(*) as count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '10 minutes'
        AND status_code = 403
        AND (url LIKE '%/api/data%' OR url LIKE '%/api/auth%')
      GROUP BY ip
      HAVING COUNT(*) > 20
    `);

    if (tokenAbuse.rows.length > 0) {
      await createAlert(
        ALERT_TYPES.TOKEN_ABUSE,
        SEVERITY.WARNING,
        `Token abuse detected from ${tokenAbuse.rows.length} IP(s)`,
        { offendingIPs: tokenAbuse.rows.map(row => row.ip) },
      );
    }

    // 4. Check for rate limit violations
    const rateLimitViolations = await query(`
      SELECT ip, COUNT(*) as count
      FROM request_logs
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
        AND status_code = 429
      GROUP BY ip
      HAVING COUNT(*) > 5
    `);

    if (rateLimitViolations.rows.length > 0) {
      await createAlert(
        ALERT_TYPES.RATE_LIMIT_EXCEEDED,
        SEVERITY.WARNING,
        `Rate limit violations from ${rateLimitViolations.rows.length} IP(s)`,
        { violatingIPs: rateLimitViolations.rows.map(row => ({
          ip: row.ip,
          violations: parseInt(row.count),
        }))},
      );
    }

  } catch (error) {
    console.error('Error checking alert conditions:', error.message);
  }
};

// Start periodic alert checks
const ALERT_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let alertCheckInterval = null;

const startAlertChecker = () => {
  if (alertCheckInterval) {
    console.log('[Alert Checker] Already running');
    return;
  }

  console.log(`[Alert Checker] Starting (every ${ALERT_CHECK_INTERVAL / 60000} min)`);

  alertCheckInterval = setInterval(() => {
    checkAlertConditions().catch(err => {
      console.error('[Alert Checker] Error:', err.message);
    });
  }, ALERT_CHECK_INTERVAL);

  // Run immediately
  checkAlertConditions().catch(err => {
    console.error('[Alert Checker] Initial check error:', err.message);
  });
};

const stopAlertChecker = () => {
  if (alertCheckInterval) {
    clearInterval(alertCheckInterval);
    alertCheckInterval = null;
    console.log('[Alert Checker] Stopped');
  }
};

module.exports = {
  createAlert,
  triggerNotifications,
  checkAlertConditions,
  startAlertChecker,
  stopAlertChecker,
  ALERT_TYPES,
  SEVERITY,
};
