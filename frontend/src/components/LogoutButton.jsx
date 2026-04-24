import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';

export default function LogoutButton({ className = '', style = {} }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      // Call logout endpoint on backend
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if backend call fails
    }

    // Clear frontend auth state
    logout();

    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className={`logout-button ${className}`}
      style={style}
      title="Click to logout from all tabs"
    >
      Logout
    </button>
  );
}
