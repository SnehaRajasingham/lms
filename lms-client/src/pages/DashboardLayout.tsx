import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

interface TokenPayload {
  role: 'admin' | 'student';
  username: string;
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setUser(decoded);
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-800 text-white p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">📚 LMS Dashboard</h1>
        {user && (
          <p className="text-2xl text-gray-300 mb-4">Hi, {user.username}</p>
        )}

        <nav className="space-y-2">
          {user?.role === 'admin' ? (
            <>
              <NavLink
                to="/dashboard/admin-books"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Books
              </NavLink>

              <NavLink
                to="/dashboard/users"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Manage Users
              </NavLink>
              <NavLink
                to="/dashboard/reports"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Reports
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard/borrow"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Borrow Books
              </NavLink>
              <NavLink
                to="/dashboard/my-books"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                My Books
              </NavLink>
            </>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full bg-red-500 hover:bg-red-600 py-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
