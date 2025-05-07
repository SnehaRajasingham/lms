const request = require('supertest');
const app = require('../server');

describe('Rate Limiting / Brute Force Protection', () => {
  it('should block excessive login attempts from same IP', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send({
        username: 'doesnotexist',
        password: 'wrongpass',
      });
    }

    const res = await request(app).post('/api/auth/login').send({
      username: 'doesnotexist',
      password: 'wrongpass',
    });

    expect(res.statusCode).toBe(429);
    expect(res.body.message).toMatch(/too many/i);
  });
});
