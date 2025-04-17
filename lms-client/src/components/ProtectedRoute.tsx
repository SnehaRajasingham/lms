import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { JSX } from 'react';

interface TokenPayload {
  exp: number;
  role: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: JSX.Element;
  allowedRoles?: string[];
}) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const userJSON = user ? JSON.parse(user) : null;

  if (!token) return <Navigate to="/auth" replace />;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem('token');
      return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && (!userJSON?.role || !allowedRoles.includes(userJSON?.role))) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (err) {
    localStorage.removeItem('token');
    console.error('Invalid token:', err);
    return <Navigate to="/auth" replace />;
  }
}
