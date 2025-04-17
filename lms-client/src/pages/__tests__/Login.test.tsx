import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { BrowserRouter } from 'react-router-dom';
import api from '../../services/api';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login onSwitch={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Enter your username')).not.toBeNull();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('submits login form and navigates on success', async () => {
    const mockUser = { username: 'admin', role: 'student' };
    const mockToken = 'mocked-token';

    (api.post as any).mockResolvedValue({
      data: { token: mockToken, user: mockUser },
    });

    render(
      <BrowserRouter>
        <Login onSwitch={vi.fn()} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'sneha' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'Sneha2025' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('logs error on login failure', async () => {
    const errorMessage = 'Something went wrong.';

    (api.post as any).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Login onSwitch={vi.fn()} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'wronguser' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login Failed', errorMessage);
    });

    consoleSpy.mockRestore();
  });
});
