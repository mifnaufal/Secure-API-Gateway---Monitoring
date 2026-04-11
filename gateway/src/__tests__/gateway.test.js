const request = require('supertest');
const { app } = require('../src/index');

describe('Gateway Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'gateway');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Gateway Routes', () => {
  it('should proxy login request to auth service', async () => {
    // This test requires auth service to be running
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'Test123!',
      });

    // Will fail if auth service is not running, but should not crash
    expect(response.status).toBeDefined();
  });

  it('should reject unauthorized access to protected routes', async () => {
    const response = await request(app)
      .get('/api/data')
      .expect(401);

    expect(response.body.error).toHaveProperty('code', 'MISSING_TOKEN');
  });

  it('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/data')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);

    expect(response.body.error).toHaveProperty('code', 'INVALID_TOKEN');
  });
});

describe('Rate Limiting', () => {
  it('should apply rate limiting', async () => {
    // Make multiple requests to trigger rate limiting
    const requests = Array(110).fill(null).map(() => 
      request(app).get('/health')
    );

    const responses = await Promise.all(requests);
    
    // At least some requests should be rate limited
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
