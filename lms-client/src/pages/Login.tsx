/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent, FormEvent } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface LoginForm {
  username: string;
  password: string;
}

interface Props {
  onSwitch: () => void;
}

export default function Login({ onSwitch }: Props) {
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data?.user));
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message || 'Something went wrong.';

      Swal.fire('Login Failed', errorMessage, 'error');
      console.error('Login Failed', errorMessage);
    }
  };

  return (
    <div className="p-8 w-full h-full flex flex-col justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>

        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="username"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitch}
          className="text-blue-600 hover:underline font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
