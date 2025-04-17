import { render, screen } from '@testing-library/react';
import BooksAdminPage from '../BooksAdminPage';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('BooksAdminPage', () => {
  it('renders the page title', async () => {
    render(<BooksAdminPage />);
    expect(await screen.findByText(/Manage Books/i)).toBeInTheDocument();
  });
});
