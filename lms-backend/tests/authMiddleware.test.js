require('dotenv').config();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

describe('Middleware: protect', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockNext = jest.fn();

  it('should return 401 if no token provided', () => {
    const req = { headers: {} };
    const res = mockRes();

    protect(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() if token is valid', () => {
    const user = { id: '123', username: 'test', role: 'student' };
    const token = jwt.sign(user, process.env.JWT_SECRET);

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    protect(req, res, mockNext);

    expect(req.user).toMatchObject(user);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = mockRes();

    protect(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Invalid token') })
    );
  });
});

describe('Middleware: restrictTo', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  const mockNext = jest.fn();

  it('should allow access for authorized roles', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();

    const middleware = restrictTo('admin', 'manager');
    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should deny access for unauthorized roles', () => {
    const req = { user: { role: 'student' } };
    const res = mockRes();
    const next = jest.fn();

    const middleware = restrictTo('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });
});
