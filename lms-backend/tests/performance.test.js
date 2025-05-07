const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  await User.deleteMany({ username: 'peruser' });
});

afterAll(async () => {
  await User.deleteMany({ username: 'peruser' });
});

describe('Performance Tests', () => {
  it('GET /api/books should respond within 1000ms', async () => {
    const start = Date.now();
    const res = await request(app).get('/api/books');
    const duration = Date.now() - start;

    expect(res.statusCode).toBe(200);
    expect(duration).toBeLessThan(1500);
  });

  it('POST /api/auth/login should respond within 500ms', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'peruser',
      password: 'perpass',
      role: 'student',
    });

    const start = Date.now();

    const res = await request(app).post('/api/auth/login').send({
      username: 'peruser',
      password: 'perpass',
    });

    const duration = Date.now() - start;

    expect(res.statusCode).toBe(200);
    expect(duration).toBeLessThan(500);
  });
});
