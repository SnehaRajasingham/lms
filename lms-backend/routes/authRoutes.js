const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');


const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests
    message: { message: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;
