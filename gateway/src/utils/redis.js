const { createClient } = require('redis');

// Redis client for rate limiting and session management
let redisClient = null;

const initRedis = async () => {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => console.error('Redis Error:', err.message));
  redisClient.on('connect', () => console.log('Redis Connected'));

  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('Redis not available, using memory store:', err.message);
    redisClient = null;
  }

  return redisClient;
};

// Rate limit storage using Redis
const checkRateLimit = async (key, windowMs, maxRequests) => {
  if (!redisClient) {
    return { allowed: true, remaining: maxRequests };
  }

  try {
    const redisKey = `ratelimit:${key}`;
    const current = await redisClient.incr(redisKey);

    if (current === 1) {
      await redisClient.expire(redisKey, Math.floor(windowMs / 1000));
    }

    const remaining = Math.max(0, maxRequests - current);
    const allowed = current <= maxRequests;

    return { allowed, remaining, current };
  } catch (error) {
    console.error('Rate limit check error:', error.message);
    return { allowed: true, remaining: maxRequests };
  }
};

// Session storage
const setSession = async (sessionId, data, ttl = 3600) => {
  if (!redisClient) return false;

  try {
    await redisClient.setEx(`session:${sessionId}`, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Session set error:', error.message);
    return false;
  }
};

const getSession = async (sessionId) => {
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Session get error:', error.message);
    return null;
  }
};

const deleteSession = async (sessionId) => {
  if (!redisClient) return false;

  try {
    await redisClient.del(`session:${sessionId}`);
    return true;
  } catch (error) {
    console.error('Session delete error:', error.message);
    return false;
  }
};

module.exports = {
  initRedis,
  getRedisClient: () => redisClient,
  checkRateLimit,
  setSession,
  getSession,
  deleteSession,
};
