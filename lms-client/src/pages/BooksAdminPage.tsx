import { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { bookSchema } from '../schemas/bookSchema';
import { AxiosError } from 'axios';

interface Book {
  _id?: string;
  title: string;
  author: string;
  isbn: string;
  copiesAvailable: number;
}

export default function BooksAdminPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Book>({
    resolver: yupResolver(bookSchema),
  });

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books', err);
    }
  };

  const onSubmit = async (data: Book) => {
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, data);
        Swal.fire('Updated!', 'Book updated successfully.', 'success');
      } else {
        await api.post('/books', data);
        Swal.fire('Added!', 'Book added successfully.', 'success');
      }

      fetchBooks();
      setShowModal(false);
      setEditingBook(null);
      reset();
    } catch (err: unknown) {
      let errorMessage = 'Something went wrong.';

      if (
        isAxiosError(err) &&
        typeof (err.response?.data as { message?: string })?.message === 'string'
      ) {
        if (err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
          errorMessage = (err.response.data as { message: string }).message;
        }
      }

      console.error('Error saving book', err);
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }

  const handleDelete = async (id: string) => {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'This book will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmed.isConfirmed) {
      try {
        await api.delete(`/books/${id}`);
        Swal.fire('Deleted!', 'Book has been removed.', 'success');
        fetchBooks();
      } catch (err) {
        console.error('Error deleting book', err);
        Swal.fire('Error', 'Could not delete book.', 'error');
      }
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    reset({ title: '', author: '', isbn: '', copiesAvailable: 1 });
    setShowModal(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    reset(book);
    setShowModal(true);
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📚 Manage Books</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Book
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by title or author..."
        className="mb-4 px-3 py-2 border rounded w-full sm:w-1/2"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left text-sm text-gray-700 uppercase">
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">ISBN</th>
              <th className="p-3">Available</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id} className="border-t">
                <td className="p-3">{book.title}</td>
                <td className="p-3">{book.author}</td>
                <td className="p-3">{book.isbn}</td>
                <td className="p-3">{book.copiesAvailable}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => openEditModal(book)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id!)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingBook ? 'Edit Book' : 'Add Book'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Title"
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-sm text-red-500">{errors.title?.message}</p>
              </div>

              <div>
                <input
                  {...register('author')}
                  type="text"
                  placeholder="Author"
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-sm text-red-500">{errors.author?.message}</p>
              </div>

              <div>
                <input
                  {...register('isbn')}
                  type="text"
                  placeholder="ISBN"
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-sm text-red-500">{errors.isbn?.message}</p>
              </div>

              <div>
                <input
                  {...register('copiesAvailable')}
                  type="number"
                  placeholder="Copies Available"
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-sm text-red-500">
                  {errors.copiesAvailable?.message}
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingBook ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBook(null);
                    reset();
                  }}
                  className="text-red-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
