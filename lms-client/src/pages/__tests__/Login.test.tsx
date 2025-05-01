import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock API
vi.mock('../../services/api');

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
  fire: vi.fn(),
}));

// Helper wrapper to support Router
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Login Component', () => {
  const mockSwitch = vi.fn();
  const mockToken = 'fake-jwt-token';
  const mockUser = { id: 1, username: 'testuser' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form correctly', () => {
    render(<Login onSwitch={mockSwitch} />, { wrapper: Wrapper });
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it('calls onSwitch when sign up button is clicked', () => {
    render(<Login onSwitch={mockSwitch} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockSwitch).toHaveBeenCalled();
  });

  it('updates form inputs on change', () => {
    render(<Login onSwitch={mockSwitch} />, { wrapper: Wrapper });
    const usernameInput = screen.getByLabelText(
      /username/i,
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i,
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: '1234' } });

    expect(usernameInput.value).toBe('admin');
    expect(passwordInput.value).toBe('1234');
  });

  it('handles successful login submission', async () => {
    (api.post as any).mockResolvedValue({
      data: { token: mockToken, user: mockUser },
    });

    render(<Login onSwitch={mockSwitch} />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'secret',
      });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login failure and shows alert', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<Login onSwitch={mockSwitch} />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials',
        'error',
      );
    });
  });
});

// Unit Tests: For individual UI elements and logic such as rendering, state updates.
// Integration Tests: For verifying behavior across multiple modules such as API + UI + navigation.
// Behavioral Tests: For simulating real user interactions and their impact on the application.
// Error Handling Tests: For ensuring the UI gracefully handles and reports failures.
