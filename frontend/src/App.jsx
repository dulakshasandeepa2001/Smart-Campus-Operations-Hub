import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import AdminDashboard from './components/AdminDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import StudentDashboard from './components/StudentDashboard';
import BookingsHistory from './components/BookingsHistory';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/lecturer"
          element={
            <PrivateRoute requiredRole="LECTURER">
              <LecturerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/lecturer/history"
          element={
            <PrivateRoute requiredRole="LECTURER">
              <BookingsHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/technician"
          element={
            <PrivateRoute requiredRole="TECHNICIAN">
              <TechnicianDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <PrivateRoute requiredRole="STUDENT">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
