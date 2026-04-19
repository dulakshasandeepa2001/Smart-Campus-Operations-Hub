import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminDashboard from '../components/AdminDashboard';
import LecturerDashboard from '../components/LecturerDashboard';
import TechnicianDashboard from '../components/TechnicianDashboard';
import StudentDashboard from '../components/StudentDashboard';
import NotificationBell from '../components/NotificationBell';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'LECTURER':
        return <LecturerDashboard />;
      case 'TECHNICIAN':
        return <TechnicianDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>Smart Campus Operations Hub</h2>
        </div>
        <div className="navbar-user">
          <NotificationBell />
          <span className="user-role">{user.role}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-main">
        {renderDashboard()}
      </div>
    </div>
  );
}
