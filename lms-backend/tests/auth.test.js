/* eslint-env jest */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

const User = require('../models/User');

const testUser = {
  username: 'testuser',
  password: 'test1234',
  role: 'student',
};

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL);
});

afterAll(async () => {
  await User.deleteOne({ username: testUser.username });
  await User.deleteMany({ username: /secureuser_/ });
  await mongoose.connection.close();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request('http://localhost:5000').post('/api/auth/register').send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(testUser.username);
  });

  it('should not allow duplicate registration', async () => {
    const res = await request('http://localhost:5000').post('/api/auth/register').send(testUser);

    expect(res.statusCode).toBe(400);
  });

  it('should login successfully', async () => {
    const res = await request('http://localhost:5000').post('/api/auth/login').send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(testUser.username);
    expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
  });

  it('should reject invalid credentials', async () => {
    const res = await request('http://localhost:5000').post('/api/auth/login').send({
      username: 'fakeuser',
      password: 'wrongpass',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should not expose server-identifying headers', async () => {
    const res = await request(app).get('/api/books');
  
    const forbiddenHeaders = ['x-powered-by', 'server', 'x-auth-token'];
  
    forbiddenHeaders.forEach((header) => {
      expect(res.headers).not.toHaveProperty(header);
    });
  });
  
});

describe('Auth API - Edge & Negative Cases', () => {
  it('should fail to register with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'incomplete' });

    expect(res.statusCode).toBe(400);
  });

  it('should fail to register with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'edgeuser', password: '123', role: 'student' });

    // If your controller or mongoose throws error
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should fail to login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'existingUser', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject login with missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should not include password in API response', async () => {
    const uniqueUser = `secureuser_${Date.now()}`;
    const res = await request(app).post('/api/auth/register').send({
      username: uniqueUser,
      password: 'strongpassword123',
      role: 'student',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).not.toHaveProperty('password');
  });
});
