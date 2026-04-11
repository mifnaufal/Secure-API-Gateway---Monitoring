const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createTables } = require('./db/migrate');
const { startAnomalyDetection } = require('./workers/anomalyWorker');
const { startAlertChecker } = require('./utils/alertSystem');
const monitoringRoutes = require('./routes/monitoring');
require('dotenv').config();

const app = express();
const PORT = process.env.MONITORING_SERVICE_PORT || 3003;

// Initialize database tables
createTables().catch(console.error);

// Start anomaly detection worker
startAnomalyDetection();

// Start alert checker
startAlertChecker();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/monitoring', monitoringRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'monitoring' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[Monitoring Service Error] ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Monitoring Service running on port ${PORT}`);
});

module.exports = app;
