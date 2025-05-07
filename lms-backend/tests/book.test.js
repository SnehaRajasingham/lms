require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Book = require('../models/Book');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let adminToken = '';
let testBookId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL);

  // Create a test admin user and generate token
  const adminUser = await User.create({
    username: 'adminuser',
    password: 'adminpass',
    role: 'admin',
  });

  adminToken = jwt.sign(
    { id: adminUser._id, username: adminUser.username, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await Book.deleteMany({ title: /Test Book/i });
  await User.deleteOne({ username: 'adminuser' });
  await mongoose.connection.close();
});

describe('Book API Integration Tests', () => {
  it('should add a new book [POST /api/books]', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        copiesAvailable: 5,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Test Book');

    testBookId = res.body._id;
  });

  it('should retrieve all books [GET /api/books]', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should retrieve a single book [GET /api/books/:id]', async () => {
    const res = await request(app).get(`/api/books/${testBookId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Book');
  });

  it('should update the book [PUT /api/books/:id]', async () => {
    const res = await request(app)
      .put(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Book Updated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Book Updated');
  });

  it('should delete the book [DELETE /api/books/:id]', async () => {
    const res = await request(app)
      .delete(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Book deleted');
  });

  describe('Book API - Edge & Negative Cases', () => {
    it('should fail to add a book with missing fields', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Only Title',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail to delete non-existent book', async () => {
      const fakeId = '609e1267b77e3a001f2c1234';
      const res = await request(app)
        .delete(`/api/books/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should fail to fetch book with malformed ID', async () => {
      const res = await request(app).get('/api/books/123');
      expect(res.statusCode).toBe(500);
    });
  });
});
