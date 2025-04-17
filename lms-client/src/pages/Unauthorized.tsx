import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-red-100 to-red-200">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
        <p className="text-gray-700 text-lg mb-6">
          You do not have permission to view this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
