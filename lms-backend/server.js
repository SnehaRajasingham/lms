require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');

// Route files
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  const start = process.hrtime();

  res.once('finish', () => {
    const elapsed = process.hrtime(start);
    const ms = (elapsed[0] * 1e3 + elapsed[1] / 1e6).toFixed(2);

    if (!res.headersSent) {
      try {
        res.append('X-Response-Time', `${ms}ms`);
      } catch (err) {
        console.warn('Could not append X-Response-Time:', err.message);
      }
    }
  });

  next();
});

// Connect MongoDB
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// Start server
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
