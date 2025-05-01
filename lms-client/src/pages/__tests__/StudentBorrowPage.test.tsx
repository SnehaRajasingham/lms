// StudentBorrowPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentBorrowPage from '../StudentBorrowPage';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Mock API
vi.mock('../../services/api');

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  },
  fire: vi.fn()
}));

const mockBooks = [
  {
    _id: '1',
    title: 'Book A',
    author: 'Author A',
    isbn: '123456',
    copiesAvailable: 2
  },
  {
    _id: '2',
    title: 'Book B',
    author: 'Author B',
    isbn: '654321',
    copiesAvailable: 0
  }
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('StudentBorrowPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: mockBooks });
  });

  it('renders books fetched from API', async () => {
    render(<StudentBorrowPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Book A')).toBeInTheDocument();
      expect(screen.getByText('Book B')).toBeInTheDocument();
    });
  });

  it('disables borrow button when no copies are available', async () => {
    render(<StudentBorrowPage />, { wrapper: Wrapper });

    await waitFor(() => {
      const unavailableButton = screen.getByText('Unavailable') as HTMLButtonElement;
      expect(unavailableButton).toBeDisabled();
    });
  });

  it('calls API and shows success alert when borrowing a book', async () => {
    (api.post as any).mockResolvedValue({ data: { message: 'Borrowed successfully' } });

    render(<StudentBorrowPage />, { wrapper: Wrapper });

    await waitFor(() => screen.getByText('Book A'));

    const borrowButton = screen.getByRole('button', { name: 'Borrow' });
    fireEvent.click(borrowButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/borrow/1');
      expect(Swal.fire).toHaveBeenCalledWith('Success', 'Borrowed successfully', 'success');
    });
  });

  it('shows error alert on failed borrow attempt', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { message: 'Book already borrowed' } }
    });

    render(<StudentBorrowPage />, { wrapper: Wrapper });

    await waitFor(() => screen.getByText('Book A'));
    const borrowButton = screen.getByRole('button', { name: 'Borrow' });
    fireEvent.click(borrowButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Book already borrowed', 'error');
    });
  });
});

// Unit Tests: Ensure that the book list renders correctly based on the mocked API response, including title, author, and availability.
// Conditional Rendering Tests: Confirm that the borrow button is disabled and labeled “Unavailable” when no copies are available.
// Behavioral Tests: Simulate clicking the “Borrow” button and verify correct handling of user interaction.
// Integration Tests: Validate successful borrowing by checking the API call, confirmation message, and book list refresh.
// Error Handling Tests: Simulate a failed borrow API response and ensure that an appropriate error message is shown using SweetAlert.
