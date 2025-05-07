require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
}));

describe('Database Connection (db.js)', () => {
  it('should call mongoose.connect and print success log', async () => {
    const logSpy = jest.spyOn(console, 'log');
    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.DB_URL);
    expect(logSpy).toHaveBeenCalledWith('MongoDB connected successfully');
    logSpy.mockRestore();
  });
});
