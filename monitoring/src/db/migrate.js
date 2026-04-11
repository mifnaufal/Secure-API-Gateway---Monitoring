const { pool } = require('./pool');

const createTables = async () => {
  const createRequestLogsTable = `
    CREATE TABLE IF NOT EXISTS request_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id VARCHAR(100),
      timestamp TIMESTAMP NOT NULL,
      method VARCHAR(10) NOT NULL,
      url TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      duration VARCHAR(50),
      ip INET,
      user_agent TEXT,
      user_id UUID,
      service VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createActivityLogsTable = `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      timestamp TIMESTAMP NOT NULL,
      action VARCHAR(100) NOT NULL,
      user_id VARCHAR(100),
      ip INET,
      user_agent TEXT,
      success BOOLEAN,
      service VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createAlertsTable = `
    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(100) NOT NULL,
      severity VARCHAR(20) NOT NULL DEFAULT 'warning',
      message TEXT NOT NULL,
      details JSONB,
      ip INET,
      user_id VARCHAR(100),
      is_resolved BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      resolved_at TIMESTAMP
    );
  `;

  const createIpTrackingTable = `
    CREATE TABLE IF NOT EXISTS ip_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ip INET UNIQUE NOT NULL,
      first_seen TIMESTAMP DEFAULT NOW(),
      last_seen TIMESTAMP DEFAULT NOW(),
      request_count INTEGER DEFAULT 1,
      failed_login_count INTEGER DEFAULT 0,
      is_blocked BOOLEAN DEFAULT false,
      block_reason TEXT,
      blocked_at TIMESTAMP
    );
  `;

  const createIndexQueries = [
    'CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);',
    'CREATE INDEX IF NOT EXISTS idx_request_logs_status_code ON request_logs(status_code);',
    'CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON request_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_request_logs_service ON request_logs(service);',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);',
    'CREATE INDEX IF NOT EXISTS idx_ip_tracking_ip ON ip_tracking(ip);',
    'CREATE INDEX IF NOT EXISTS idx_ip_tracking_is_blocked ON ip_tracking(is_blocked);',
  ];

  try {
    await pool.query(createRequestLogsTable);
    await pool.query(createActivityLogsTable);
    await pool.query(createAlertsTable);
    await pool.query(createIpTrackingTable);

    for (const indexQuery of createIndexQueries) {
      await pool.query(indexQuery);
    }

    console.log('Monitoring service tables created successfully');
  } catch (error) {
    console.error('Error creating monitoring tables:', error.message);
  }
};

if (require.main === module) {
  createTables().then(() => process.exit(0));
}

module.exports = { createTables };
