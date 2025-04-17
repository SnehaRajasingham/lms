import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface Props {
  onSwitch: () => void;
}

export default function Register({ onSwitch }: Props) {
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    role: 'student',
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { username, email, password } = formData;
    if (username.trim().length < 3) {
      Swal.fire(
        'Validation Error',
        'Username must be at least 3 characters.',
        'warning',
      );
      return false;
    }
    if (!email.includes('@')) {
      Swal.fire('Validation Error', 'Please enter a valid email.', 'warning');
      return false;
    }
    if (password.length < 6) {
      Swal.fire(
        'Validation Error',
        'Password must be at least 6 characters.',
        'warning',
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      Swal.fire('Success', 'Registration successful!', 'success').then(() => {
        navigate('/dashboard');
      });
    } catch (err: unknown) {
      let errorMessage = 'Something went wrong.';

      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        errorMessage = (err as { response: { data: { message: string } } })
          .response.data.message;
      }

      Swal.fire('Registration Failed', errorMessage, 'error');
    }
  };

  return (
    <div className="p-8 w-full h-full flex flex-col justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Register
        </h2>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <input type="hidden" name="role" value="student" />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <button
          onClick={onSwitch}
          className="text-green-600 hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
