require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const jwt = require('jsonwebtoken');

let studentToken = '';
let adminToken = '';
let bookId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL);

  const student = await User.create({
    username: 'borrowStudent',
    password: 'test123',
    role: 'student',
  });
  const admin = await User.create({ username: 'borrowAdmin', password: 'test123', role: 'admin' });

  studentToken = jwt.sign(
    { id: student._id, username: student.username, role: student.role },
    process.env.JWT_SECRET
  );
  adminToken = jwt.sign(
    { id: admin._id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET
  );

  const book = await Book.create({
    title: 'Borrowable Book',
    author: 'Author X',
    isbn: '1111222233',
    copiesAvailable: 2,
  });

  bookId = book._id;
});

afterAll(async () => {
  await Borrow.deleteMany({});
  await Book.deleteMany({ title: 'Borrowable Book' });
  await User.deleteMany({ username: /borrow/i });
  await mongoose.connection.close();
});

describe('Borrow API Integration Tests', () => {
  it('should allow a student to borrow a book', async () => {
    const res = await request(app)
      .post(`/api/borrow/${bookId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Book borrowed successfully');
    expect(res.body.borrow).toHaveProperty('user');
  });

  it('should prevent borrowing the same book twice', async () => {
    const res = await request(app)
      .post(`/api/borrow/${bookId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already borrowed/i);
  });

  it('should return the book and calculate fine if late', async () => {
    // Manually backdate borrow record
    const borrow = await Borrow.findOne({ book: bookId });
    borrow.borrowedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await borrow.save();

    const res = await request(app)
      .post(`/api/borrow/return/${bookId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book returned');
    expect(res.body.fine).toBeGreaterThan(0);
  });

  it('should fetch all borrow logs for admin', async () => {
    const res = await request(app)
      .get('/api/borrow/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  describe('Borrow API - Edge & Negative Cases', () => {
    it('should fail to borrow a non-existent book', async () => {
      const res = await request(app)
        .post('/api/borrow/609e1267b77e3a001f2c9999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/unavailable/i);
    });

    it('should fail to return a book not borrowed', async () => {
      const res = await request(app)
        .post('/api/borrow/return/609e1267b77e3a001f2c9999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should fail to borrow with bad/missing token', async () => {
      const res = await request(app).post(`/api/borrow/${bookId}`);
      expect(res.statusCode).toBe(401);
    });
  });
});
