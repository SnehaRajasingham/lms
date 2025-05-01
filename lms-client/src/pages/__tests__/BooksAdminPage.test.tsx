import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BooksAdminPage from '../BooksAdminPage';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Mock API
vi.mock('../../services/api');

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true }))
  },
  fire: vi.fn(() => Promise.resolve({ isConfirmed: true }))
}));

const mockBooks = [
  {
    _id: '1',
    title: 'Test Book 1',
    author: 'Author 1',
    isbn: '111',
    copiesAvailable: 5
  },
  {
    _id: '2',
    title: 'Test Book 2',
    author: 'Author 2',
    isbn: '222',
    copiesAvailable: 3
  }
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('BooksAdminPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: mockBooks });
  });

  it('renders the list of books from API', async () => {
    render(<BooksAdminPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      expect(screen.getByText('Author 2')).toBeInTheDocument();
    });
  });

  it('filters books based on search input', async () => {
    render(<BooksAdminPage />, { wrapper: Wrapper });

    await waitFor(() => screen.getByText('Test Book 1'));

    fireEvent.change(screen.getByPlaceholderText(/search by title/i), {
      target: { value: 'Book 2' },
    });

    expect(screen.queryByText('Test Book 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
  });

  it('opens and closes add modal', async () => {
    render(<BooksAdminPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /add book/i }));
    expect(screen.getByRole('heading', { name: /add book/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('heading', { name: /add book/i })).not.toBeInTheDocument();
  });

  it('handles book deletion when confirmed', async () => {
    (api.delete as any).mockResolvedValue({});
    render(<BooksAdminPage />, { wrapper: Wrapper });

    await waitFor(() => screen.getByText('Test Book 1'));
    fireEvent.click(screen.getAllByText(/delete/i)[0]);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Are you sure?',
        text: 'This book will be permanently deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
      });
      expect(api.delete).toHaveBeenCalledWith('/books/1');
    });
  });
});

// Unit Tests: Verify the presence of UI elements such as the book table, buttons, and modals.
// Input State Tests: Ensure that the search input filters the displayed list of books correctly.
// Behavioral Tests: Simulate user actions such as opening/closing the modal, clicking delete, and typing in the search bar.
// Integration Tests: Confirm correct API interaction for fetching and deleting books, including mocking external API responses.
// Modal Interaction Tests: Validate the conditional rendering of modals and that canceling the form properly resets and closes it.
// Error Handling Tests: (Recommended for future addition) to check UI behavior when the API fails during fetch, add, edit, or delete operations.
