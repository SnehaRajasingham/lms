const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  await User.deleteMany({ username: 'securecheckuser' });
});

afterAll(async () => {
  await User.deleteMany({ username: 'securecheckuser' });
});

describe('🔐 Security Tests', () => {
  describe('Sensitive Data Exposure', () => {
    it('should not expose password in response after registration', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'securecheckuser',
        password: 'SuperSecret123',
        role: 'student',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('token');
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
    });

    it('should not expose password or token on login', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'securechecklogin',
        password: 'StrongLogin123',
        role: 'student',
      });

      const res = await request(app).post('/api/auth/login').send({
        username: 'securechecklogin',
        password: 'StrongLogin123',
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
    });
  });

  describe('HTTP Header Security', () => {
    it('should not include dangerous headers in any response', async () => {
      const res = await request(app).get('/api/books');

      const forbiddenHeaders = ['x-powered-by', 'server', 'x-auth-token'];
      forbiddenHeaders.forEach((header) => {
        expect(res.headers).not.toHaveProperty(header);
      });
    });

    it('should include optional security headers if Helmet is enabled', async () => {
      const res = await request(app).get('/api/books');

      const expectedSecurityHeaders = [
        'x-dns-prefetch-control',
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security',
      ];

      expectedSecurityHeaders.forEach((header) => {
        if (res.headers[header]) {
          expect(res.headers[header].length).toBeGreaterThan(0);
        }
      });
    });
  });
});
