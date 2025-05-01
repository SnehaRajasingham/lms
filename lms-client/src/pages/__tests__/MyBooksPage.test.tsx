/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyBooksPage from '../MyBooksPage';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Mock API
vi.mock('../../services/api');

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
  fire: vi.fn(),
}));

const mockRecords = [
  {
    _id: '1',
    book: {
      _id: 'book1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
    },
    borrowedAt: new Date().toISOString(),
    returnedAt: null,
  },
  {
    _id: '2',
    book: {
      _id: 'book2',
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      isbn: '9780201616224',
    },
    borrowedAt: new Date().toISOString(),
    returnedAt: new Date().toISOString(),
    fine: 5,
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('MyBooksPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: mockRecords });
  });

  it('renders current and history sections correctly', async () => {
    render(<MyBooksPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      expect(screen.getAllByText(/borrowed on/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/returned on/i)).toBeInTheDocument();
      expect(screen.getByText(/fine/i)).toBeInTheDocument();
    });
  });

  it('handles successful book return', async () => {
    (api.post as any).mockResolvedValue({
      data: { message: 'Returned successfully', fine: 0 },
    });

    render(<MyBooksPage />, { wrapper: Wrapper });

    await waitFor(() => screen.getByText('Clean Code'));
    fireEvent.click(screen.getByRole('button', { name: /return book/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/borrow/return/book1');
      expect(Swal.fire).toHaveBeenCalledWith(
        'Success',
        'Returned successfully',
        'success',
      );
    });
  });

  it('shows error alert on return failure', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { message: 'Already returned' } },
    });

    render(<MyBooksPage />, { wrapper: Wrapper });
    await waitFor(() => screen.getByText('Clean Code'));

    fireEvent.click(screen.getByRole('button', { name: /return book/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'Already returned',
        'error',
      );
    });
  });
});

// Unit Tests: Validate the rendering of borrowed book details, returned book history, and conditional content based on the dataset.
// Integration Tests: Confirm the return book logic performs an API call, updates the data, and shows appropriate SweetAlert messages.
// Behavioral Tests: Simulate user interactions like clicking the “Return Book” button to test behavior under both success and failure conditions.
// Error Handling Tests: Ensure meaningful feedback is presented when return operations fail due to server-side conditions.
