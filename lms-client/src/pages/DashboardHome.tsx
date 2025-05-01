import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

interface TokenPayload {
  role: 'admin' | 'student';
  username: string;
}

export default function DashboardHome() {
  const [user, setUser] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token: ', err);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome {user?.username} 👋
        </h1>
        <p className="text-gray-600">
          You are logged in as <span className="font-medium">{user?.role}</span>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-gray-700 font-semibold text-lg mb-1">
            Books Borrowed
          </h2>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-gray-700 font-semibold text-lg mb-1">
            Books Returned
          </h2>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-gray-700 font-semibold text-lg mb-1">
            Available Books
          </h2>
          <p className="text-3xl font-bold text-purple-600">120</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-gray-700 font-semibold text-lg mb-1">
            Fines Due
          </h2>
          <p className="text-3xl font-bold text-red-500">£ 150</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          📌 Recent Activity
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li>
            • You borrowed{' '}
            <span className="font-medium">“Algorithms Unlocked”</span>
          </li>
          <li>
            • You returned{' '}
            <span className="font-medium">“Database Systems”</span>
          </li>
          <li>• Fine of £50 added for late return</li>
          <li>
            • Reserved <span className="font-medium">“Clean Code”</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
