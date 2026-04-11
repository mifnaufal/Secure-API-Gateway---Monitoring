const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dataRoutes = require('./routes/data');
require('dotenv').config();

const app = express();
const PORT = process.env.DATA_SERVICE_PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/data', dataRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'data' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[Data Service Error] ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Data Service running on port ${PORT}`);
});

module.exports = app;
