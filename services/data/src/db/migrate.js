const { pool } = require('./pool');

const createTables = async () => {
  const createItemsTable = `
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      price DECIMAL(10, 2),
      created_by UUID,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true
    );
  `;

  const createActivitiesTable = `
    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100),
      resource_id UUID,
      details JSONB,
      ip_address INET,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createAuditLogsTable = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id UUID,
      old_values JSONB,
      new_values JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createIndexQueries = [
    'CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);',
    'CREATE INDEX IF NOT EXISTS idx_items_created_by ON items(created_by);',
    'CREATE INDEX IF NOT EXISTS idx_items_is_active ON items(is_active);',
    'CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);',
    'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);',
  ];

  try {
    await pool.query(createItemsTable);
    await pool.query(createActivitiesTable);
    await pool.query(createAuditLogsTable);

    for (const indexQuery of createIndexQueries) {
      await pool.query(indexQuery);
    }

    console.log('Data service tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
};

if (require.main === module) {
  createTables().then(() => process.exit(0));
}

module.exports = { createTables };
