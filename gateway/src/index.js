const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');
const routes = require('./routes');
const { rateLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Redis client for caching and rate limiting
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Initialize Redis connection
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('Redis not available, running without cache:', err.message);
  }
})();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = uuidv4();
  req.redisClient = redisClient;
  next();
});

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'gateway' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[Gateway Error] ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      requestId: req.requestId,
    },
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = { app, redisClient };
