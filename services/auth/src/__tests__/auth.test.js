const request = require('supertest');
const app = require('../src/index');

describe('Auth Service Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'auth');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Auth Endpoints', () => {
  it('should validate registration input', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'ab', // Too short
        email: 'invalid-email',
        password: 'weak', // Too weak
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should validate login input', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        username: '',
        password: '',
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        username: 'nonexistent',
        password: 'WrongPass1!',
      })
      .expect(401);

    expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });
});
