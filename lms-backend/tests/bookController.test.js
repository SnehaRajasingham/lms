const httpMocks = require('node-mocks-http');
const bookController = require('../controllers/bookController');
const Book = require('../models/Book');

jest.mock('../models/Book');

describe('Book Controller Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a book and return 201', async () => {
    const req = httpMocks.createRequest({
      body: {
        title: 'Mock Book',
        author: 'Author A',
        isbn: '0001112223',
        copiesAvailable: 3,
      },
    });
    const res = httpMocks.createResponse();

    Book.create.mockResolvedValue(req.body);

    await bookController.addBook(req, res);

    expect(Book.create).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().title).toBe('Mock Book');
  });

  it('should return all books', async () => {
    const mockBooks = [
      { title: 'Book1', author: 'A' },
      { title: 'Book2', author: 'B' },
    ];
    Book.find.mockResolvedValue(mockBooks);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await bookController.getAllBooks(req, res);

    expect(Book.find).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().length).toBe(2);
  });

  it('should return a book by ID', async () => {
    const mockBook = { _id: 'abc123', title: 'Book1' };
    Book.findById.mockResolvedValue(mockBook);

    const req = httpMocks.createRequest({ params: { id: 'abc123' } });
    const res = httpMocks.createResponse();

    await bookController.getBookById(req, res);

    expect(Book.findById).toHaveBeenCalledWith('abc123');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().title).toBe('Book1');
  });

  it('should return 404 for missing book by ID', async () => {
    Book.findById.mockResolvedValue(null);

    const req = httpMocks.createRequest({ params: { id: 'notfound' } });
    const res = httpMocks.createResponse();

    await bookController.getBookById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/not found/i);
  });

  it('should update a book by ID', async () => {
    const updatedBook = { title: 'Updated Book' };

    Book.findByIdAndUpdate.mockResolvedValue(updatedBook);

    const req = httpMocks.createRequest({
      params: { id: 'bookId123' },
      body: updatedBook,
    });
    const res = httpMocks.createResponse();

    await bookController.updateBook(req, res);

    expect(Book.findByIdAndUpdate).toHaveBeenCalledWith('bookId123', updatedBook, {
      new: true,
      runValidators: true,
    });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().title).toBe('Updated Book');
  });

  it('should delete a book by ID', async () => {
    const book = { _id: 'bookDel123', title: 'To Delete' };

    Book.findByIdAndDelete.mockResolvedValue(book);

    const req = httpMocks.createRequest({ params: { id: 'bookDel123' } });
    const res = httpMocks.createResponse();

    await bookController.deleteBook(req, res);

    expect(Book.findByIdAndDelete).toHaveBeenCalledWith('bookDel123');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toBe('Book deleted');
  });

  it('should return 404 if delete target not found', async () => {
    Book.findByIdAndDelete.mockResolvedValue(null);

    const req = httpMocks.createRequest({ params: { id: 'missing' } });
    const res = httpMocks.createResponse();

    await bookController.deleteBook(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/not found/i);
  });
});
