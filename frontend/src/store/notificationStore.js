import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your lecture hall booking for Data Structures has been approved',
      timestamp: '2 mins ago',
      read: false,
    },
    {
      id: 2,
      type: 'approval',
      title: 'Facility Request Approved',
      message: 'Lab request for Chemistry practicum has been approved',
      timestamp: '1 hour ago',
      read: true,
    },
  ],

  unreadCount: 1,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Date.now(),
          timestamp: 'Just now',
          read: false,
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
