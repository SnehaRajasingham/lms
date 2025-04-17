const express = require('express');
const router = express.Router();
const {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getBookById,
} = require('../controllers/bookController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Admin-only
router.post('/', protect, restrictTo('admin'), addBook);
router.put('/:id', protect, restrictTo('admin'), updateBook);
router.delete('/:id', protect, restrictTo('admin'), deleteBook);

module.exports = router;
