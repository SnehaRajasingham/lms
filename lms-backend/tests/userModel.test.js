require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

describe('User model password methods', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should hash the password and compare correctly', async () => {
    const rawPassword = 'securePass123';
    const user = new User({
      username: 'unituser',
      password: rawPassword,
      role: 'student',
    });

    await user.save();

    const isMatch = await user.comparePassword(rawPassword);
    expect(isMatch).toBe(true);

    const isMismatch = await user.comparePassword('wrongPassword');
    expect(isMismatch).toBe(false);

    await User.deleteOne({ username: 'unituser' });
  });
});
