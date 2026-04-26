import { create } from 'zustand';
import { notificationService } from '../services/apiService';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pollInterval: null,
  lastUserId: null,

  // Fetch notifications from backend
  fetchNotifications: async (userId) => {
    if (!userId) return;
    
    try {
      set({ loading: true });
      const response = await notificationService.getUserNotifications(userId);
      const notifications = response.data || [];
      
      // Map backend notifications to frontend format
      const mappedNotifications = notifications.map(notif => ({
        id: notif.id,
        type: mapNotificationType(notif.type),
        title: notif.title,
        message: notif.message,
        timestamp: formatTime(notif.createdAt),
        read: notif.isRead,
        backendType: notif.type,
        createdAt: notif.createdAt,
        relatedResourceId: notif.relatedResourceId,
        relatedResourceType: notif.relatedResourceType,
      }));

      // Calculate unread count
      const unreadCount = mappedNotifications.filter(n => !n.read).length;

      set({
        notifications: mappedNotifications,
        unreadCount,
        loading: false,
        lastUserId: userId,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async (userId) => {
    if (!userId) return;
    
    try {
      const response = await notificationService.getUnreadCount(userId);
      set({ unreadCount: response.data?.unreadCount || 0 });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  // Add a single notification (for real-time updates)
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: notification.id || Date.now(),
          type: mapNotificationType(notification.type || notification.backendType),
          title: notification.title,
          message: notification.message,
          timestamp: 'Just now',
          read: notification.isRead || false,
          backendType: notification.type,
          createdAt: notification.createdAt,
          relatedResourceId: notification.relatedResourceId,
          relatedResourceType: notification.relatedResourceType,
        },
        ...state.notifications,
      ],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    })),

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      await notificationService.markAllAsRead(userId);
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  // Clear all notifications
  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  // Start polling notifications
  startPolling: (userId, intervalMs = 10000) => {
    const { fetchNotifications, pollInterval } = get();

    // Clear existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    // Fetch immediately
    fetchNotifications(userId);

    // Set up polling
    const newInterval = setInterval(() => {
      fetchNotifications(userId);
    }, intervalMs);

    set({ pollInterval: newInterval });
  },

  // Stop polling notifications
  stopPolling: () => {
    const { pollInterval } = get();
    if (pollInterval) {
      clearInterval(pollInterval);
      set({ pollInterval: null });
    }
  },

  // Remove a notification from list
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

// Helper function to map backend notification types to frontend display types
function mapNotificationType(backendType) {
  const typeMap = {
    'BOOKING_APPROVED': 'booking',
    'BOOKING_REJECTED': 'alert',
    'BOOKING_CANCELLED': 'alert',
    'TICKET_UPDATED': 'message',
    'COMMENT_ADDED': 'message',
    'FACILITY_AVAILABLE': 'booking',
    'FACILITY_MAINTENANCE': 'alert',
    'ROLE_ASSIGNED': 'approval',
    'GENERAL': 'message',
  };
  return typeMap[backendType] || 'message';
}

// Helper function to format time
function formatTime(dateString) {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}
