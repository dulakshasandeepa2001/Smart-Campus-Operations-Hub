import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import '../styles/notification.css';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling,
  } = useNotificationStore();

  // Initialize polling when component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      startPolling(user.id, 8000); // Poll every 8 seconds
      
      return () => {
        stopPolling();
      };
    }
  }, [user?.id, startPolling, stopPolling]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await markAllAsRead(user.id);
    }
  };

  const handleMarkAsRead = async (notificationId, isRead) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-bell-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="notification-bell-container">
      <button className="notification-bell" onClick={toggleDropdown} title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications {loading && <span className="spinner">●</span>}</h3>
            {notifications.length > 0 && (
              <button
                className="clear-btn"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div className="loading-state">
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleMarkAsRead(notification.id, notification.read)}
                >
                  <div className="notification-icon">
                    {notification.type === 'booking' && '📅'}
                    {notification.type === 'approval' && '✅'}
                    {notification.type === 'alert' && '⚠️'}
                    {notification.type === 'message' && '💬'}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.timestamp}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
