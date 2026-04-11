const { createClient } = require('redis');

// Redis client for caching
let redisClient = null;

const initCache = async () => {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => console.error('Redis Cache Error:', err.message));
  redisClient.on('connect', () => console.log('Redis Cache Connected'));

  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('Cache unavailable, running without cache:', err.message);
    redisClient = null;
  }

  return redisClient;
};

// Cache middleware for GET requests
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if no Redis client
    if (!redisClient) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`[Cache Hit] ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`[Cache Miss] ${key}`);

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200) {
          redisClient.setEx(key, duration, JSON.stringify(body)).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error.message);
      next();
    }
  };
};

// Invalidate cache by pattern
const invalidateCache = async (pattern) => {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(`cache:${pattern}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Cache Invalidated] ${keys.length} keys removed for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
};

// Clear all cache
const clearCache = async () => {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys('cache:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Cache Cleared] ${keys.length} keys removed`);
    }
  } catch (error) {
    console.error('Cache clear error:', error.message);
  }
};

// Initialize cache on module load
initCache();

module.exports = {
  cache,
  invalidateCache,
  clearCache,
  initCache,
  getRedisClient: () => redisClient,
};
