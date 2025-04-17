import { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
}

interface BorrowRecord {
  _id: string;
  book: Book;
  borrowedAt: string;
  returnedAt: string | null;
  fine?: number;
}

export default function MyBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBorrowedBooks = async () => {
    try {
      const res = await api.get('/borrow/my');
      setBorrowedBooks(res.data);
    } catch (err) {
      console.error('Failed to load borrowed books:', err);
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (bookId: string) => {
    try {
      const res = await api.post(`/borrow/return/${bookId}`);
      Swal.fire(
        'Success',
        res.data.message +
          (res.data.fine ? ` | Fine: £ ${res.data.fine}` : ''),
        'success',
      );
      fetchBorrowedBooks();
    } catch (err: any) {
      Swal.fire(
        'Error',
        err.response?.data?.message || 'Return failed.',
        'error',
      );
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const current = borrowedBooks.filter((record) => !record.returnedAt);
  const history = borrowedBooks.filter((record) => record.returnedAt);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📚 My Borrowed Books
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : current.length === 0 ? (
        <p className="text-gray-600">You have no currently borrowed books.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {current.map((record) => (
            <div key={record._id} className="bg-white shadow rounded p-4">
              <h3 className="text-xl font-semibold mb-1">
                {record.book.title}
              </h3>
              <p className="text-gray-700 mb-1">Author: {record.book.author}</p>
              <p className="text-sm text-gray-500">ISBN: {record.book.isbn}</p>
              <p className="text-sm text-gray-500 mb-3">
                Borrowed on: {new Date(record.borrowedAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => returnBook(record.book._id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              >
                Return Book
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📘 Borrowing History
      </h2>
      {history.length === 0 ? (
        <p className="text-gray-600">No past borrowed books found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((record) => (
            <div key={record._id} className="bg-white shadow rounded p-4">
              <h3 className="text-xl font-semibold mb-1">
                {record.book.title}
              </h3>
              <p className="text-gray-700 mb-1">Author: {record.book.author}</p>
              <p className="text-sm text-gray-500">ISBN: {record.book.isbn}</p>
              <p className="text-sm text-gray-500">
                Borrowed on: {new Date(record.borrowedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Returned on: {new Date(record.returnedAt!).toLocaleDateString()}
              </p>
              {record.fine && (
                <p className="text-sm text-red-600 font-semibold">
                  Fine: £{record.fine}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
