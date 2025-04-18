import './index.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './pages/AuthLayout';
import NotFound from './pages/NotFound';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import BooksAdminPage from './pages/BooksAdminPage';
import Unauthorized from './pages/Unauthorized';
import StudentBorrowPage from './pages/StudentBorrowPage';
import MyBooksPage from './pages/MyBooksPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          <Route
            path="admin-books"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BooksAdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="borrow" element={<StudentBorrowPage />} />

          <Route
            path="my-books"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyBooksPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/auth" element={<AuthLayout />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
