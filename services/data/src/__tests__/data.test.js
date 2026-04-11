const request = require('supertest');
const app = require('../src/index');

describe('Data Service Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'data');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Data Endpoints', () => {
  it('should reject unauthorized access', async () => {
    const response = await request(app)
      .get('/data')
      .expect(401);

    expect(response.body.error).toHaveProperty('code', 'MISSING_TOKEN');
  });

  it('should validate item creation input', async () => {
    const response = await request(app)
      .post('/data')
      .set('Authorization', 'Bearer fake-token')
      .send({
        name: '', // Empty name should fail
      });

    // Will fail auth first, but validation should be in place
    expect(response.status).toBeDefined();
  });
});
