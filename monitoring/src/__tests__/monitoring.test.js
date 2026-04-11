const request = require('supertest');
const app = require('../src/index');

describe('Monitoring Service Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'monitoring');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Monitoring Endpoints', () => {
  it('should store request logs', async () => {
    const response = await request(app)
      .post('/monitoring/log')
      .send({
        requestId: 'test-request-123',
        timestamp: new Date().toISOString(),
        method: 'GET',
        url: '/test',
        statusCode: 200,
        duration: '50ms',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        userId: null,
        service: 'gateway',
      })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Log stored');
  });

  it('should store activity logs', async () => {
    const response = await request(app)
      .post('/monitoring/activity')
      .send({
        timestamp: new Date().toISOString(),
        action: 'login',
        userId: 'test-user',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        success: true,
        service: 'auth',
      })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Activity logged');
  });

  it('should get dashboard statistics', async () => {
    const response = await request(app)
      .get('/monitoring/dashboard')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('totalRequests');
    expect(response.body.data).toHaveProperty('totalActivities');
    expect(response.body.data).toHaveProperty('totalAlerts');
  });

  it('should get request logs', async () => {
    const response = await request(app)
      .get('/monitoring/requests')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get activity logs', async () => {
    const response = await request(app)
      .get('/monitoring/activities')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get alerts', async () => {
    const response = await request(app)
      .get('/monitoring/alerts')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
