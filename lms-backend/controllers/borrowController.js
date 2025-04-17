const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { calculateFine } = require('../utils/fineCalculator');

// Borrow a book
exports.borrowBook = async (req, res) => {
  const userId = req.user.id;
  const bookId = req.params.bookId;

  try {
    const book = await Book.findById(bookId);
    if (!book || book.copiesAvailable < 1) {
      return res.status(400).json({ message: 'Book unavailable' });
    }

    const existingBorrow = await Borrow.findOne({ user: userId, book: bookId, returnedAt: null });
    if (existingBorrow) {
      return res.status(400).json({ message: 'You already borrowed this book' });
    }

    const borrow = await Borrow.create({ user: userId, book: bookId });

    book.copiesAvailable -= 1;
    await book.save();

    res.status(201).json({ message: 'Book borrowed successfully', borrow });
  } catch (err) {
    res.status(500).json({ message: 'Error borrowing book', error: err.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  const userId = req.user.id;
  const bookId = req.params.bookId;

  try {
    const borrow = await Borrow.findOne({ user: userId, book: bookId, returnedAt: null });
    if (!borrow) return res.status(404).json({ message: 'No active borrow found' });

    borrow.returnedAt = new Date();
    borrow.fine = calculateFine(borrow.borrowedAt, borrow.returnedAt);

    await borrow.save();

    const book = await Book.findById(bookId);
    book.copiesAvailable += 1;
    await book.save();

    res.json({ message: 'Book returned', fine: borrow.fine });
  } catch (err) {
    res.status(500).json({ message: 'Error returning book', error: err.message });
  }
};

// Admin: View borrow logs
exports.getBorrowLogs = async (req, res) => {
  try {
    const logs = await Borrow.find()
      .populate('user', 'username role')
      .populate('book', 'title author isbn');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};

exports.getMyBorrowedBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await Borrow.find({ user: userId })
      .populate('book', 'title author isbn')
      .sort({ borrowedAt: -1 });

    res.json(records);
  } catch (err) {
    console.error('Failed to fetch user borrow records:', err);
    res.status(500).json({ message: 'Failed to fetch your borrow records.' });
  }
};
