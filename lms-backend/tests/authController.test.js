/* eslint-env jest */
require('dotenv').config();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('authController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'unitRegister',
          password: '123456',
          role: 'student',
        },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockResolvedValue(null); // no existing user
      User.create.mockResolvedValue({
        _id: '123',
        username: 'unitRegister',
        role: 'student',
      });
      jwt.sign.mockReturnValue('mockedToken');

      await register(req, res);

      expect(res.statusCode).toBe(201);
      const data = res._getJSONData();
      expect(data).toHaveProperty('token', 'mockedToken');
      expect(data.user.username).toBe('unitRegister');
    });

    it('should block duplicate user', async () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'existingUser',
          password: 'abc',
          role: 'admin',
        },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockResolvedValue({ username: 'existingUser' });

      await register(req, res);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data.message).toMatch(/already exists/i);
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'testlogin',
          password: 'correctpass',
        },
      });
      const res = httpMocks.createResponse();

      const mockUser = {
        _id: 'u001',
        username: 'testlogin',
        role: 'student',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('loginToken');

      await login(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockUser.comparePassword).toHaveBeenCalledWith('correctpass');
      const data = res._getJSONData();
      expect(data).toHaveProperty('token', 'loginToken');
    });

    it('should reject invalid credentials', async () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'unknown',
          password: 'wrong',
        },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.statusCode).toBe(401);
      const data = res._getJSONData();
      expect(data.message).toMatch(/invalid credentials/i);
    });
  });
});
