import { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  copiesAvailable: number;
}

export default function StudentBorrowPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error loading books', err);
    } finally {
      setLoading(false);
    }
  };

  const borrowBook = async (bookId: string) => {
    try {
      const res = await api.post(`/borrow/${bookId}`);
      Swal.fire('Success', res.data.message, 'success');
      fetchBooks();
    } catch (err: unknown) {
      let errorMessage = 'Borrow failed.';

      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
      ) {
        errorMessage = (err as { response: { data: { message: string } } })
          .response.data.message;
      }

      Swal.fire('Error', errorMessage, 'error');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📖 Available Books
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book._id} className="bg-white shadow-md rounded p-4">
              <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
              <p className="text-gray-700 mb-2">Author: {book.author}</p>
              <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
              <p className="text-sm text-gray-500 mb-3">
                Copies: {book.copiesAvailable}
              </p>
              <button
                onClick={() => borrowBook(book._id)}
                disabled={book.copiesAvailable === 0}
                className={`w-full py-2 rounded text-white ${
                  book.copiesAvailable === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {book.copiesAvailable === 0 ? 'Unavailable' : 'Borrow'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
