const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, getBorrowLogs, getMyBorrowedBooks } = require('../controllers/borrowController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/:bookId', protect, restrictTo('student'), borrowBook);
router.post('/return/:bookId', protect, restrictTo('student'), returnBook);
router.get('/logs', protect, restrictTo('admin'), getBorrowLogs);
router.get('/my', protect, getMyBorrowedBooks);

module.exports = router;
