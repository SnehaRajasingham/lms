import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register';
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

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Register Component', () => {
  const mockSwitch = vi.fn();
  const mockToken = 'test-token';
  const mockUser = { id: 2, username: 'newuser' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders all form inputs and the submit button', () => {
    render(<Register onSwitch={mockSwitch} />, { wrapper: Wrapper });
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it('calls onSwitch when "Sign in" is clicked', () => {
    render(<Register onSwitch={mockSwitch} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockSwitch).toHaveBeenCalled();
  });

  it('prevents submission if validation fails (short username)', () => {
    render(<Register onSwitch={mockSwitch} />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'ab' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(Swal.fire).toHaveBeenCalledWith(
      'Validation Error',
      'Username must be at least 3 characters.',
      'warning',
    );
  });

  it('submits successfully with valid data', async () => {
    (api.post as any).mockResolvedValue({
      data: { token: mockToken, user: mockUser },
    });

    render(<Register onSwitch={mockSwitch} />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'validuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check the API call and localStorage updates
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'validuser',
        email: 'valid@example.com',
        password: '123456',
        role: 'student',
      });

      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    // Check the SweetAlert success message
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Success',
        'Registration successful!',
        'success',
      );
    });

    // Check that navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows API error message on registration failure', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { message: 'Email already exists' } },
    });

    render(<Register onSwitch={mockSwitch} />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'exists@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Registration Failed',
        'Email already exists',
        'error',
      );
    });
  });
});

// Unit Tests: Verify that all form fields (username, email, password) and the submit button are correctly rendered.
// Input State Tests: Confirm that controlled inputs update their values on user interaction.
// Behavioral Tests: Simulate clicking the "Sign in" button to ensure the onSwitch() prop is triggered.
// Validation Tests: Check that client-side validation blocks form submission when rules are violated (e.g., short username).
// Integration Tests: Simulate a full registration flow, including API call, localStorage update, success alert, and navigation.
// Error Handling Tests: Simulate a failed registration API response and verify that a user-friendly error message is shown via SweetAlert.
// Mocking: Use mocking libraries to simulate API responses and localStorage interactions, ensuring that the tests are isolated and do not depend on actual backend services or browser APIs.
// Cleanup: Clear mocks and localStorage before each test to ensure a clean state.
// Test Coverage: Ensure that all branches of the code are covered, including both success and failure paths for API calls, as well as all validation scenarios.
