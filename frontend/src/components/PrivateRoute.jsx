import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Add listener for logout events
    const handleLogout = () => {
      // The component will re-render when store updates via the hook
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
