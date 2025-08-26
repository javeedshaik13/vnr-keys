import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6203/api';

// Configure axios for notifications to use cookies like the auth store
axios.defaults.withCredentials = true;

const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      lastFetch: null,

      // Actions
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ 
          notifications, 
          unreadCount,
          lastFetch: new Date().toISOString()
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Fetch notifications from API
      fetchNotifications: async () => {
        const { setLoading, setError, setNotifications } = get();

        try {
          setLoading(true);
          setError(null);

          console.log('Fetching notifications from:', `${API_BASE_URL}/notifications`);

          const response = await axios.get(`${API_BASE_URL}/notifications`);

          console.log('Response status:', response.status);
          console.log('Notifications data:', response.data);

          // Handle different response structures
          const notifications = response.data.data?.notifications || response.data.notifications || [];
          setNotifications(notifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          if (error.response?.status === 401) {
            setError('Please login to view notifications');
          } else {
            setError(error.response?.data?.message || error.message);
          }
        } finally {
          setLoading(false);
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId) => {
        const { notifications, setNotifications } = get();
        
        try {
          await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);

          // Update local state
          const updatedNotifications = notifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          );
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      },

      // Mark notification as unread
      markAsUnread: async (notificationId) => {
        const { notifications, setNotifications } = get();
        
        try {
          await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/unread`);

          // Update local state
          const updatedNotifications = notifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: false, readAt: null }
              : notification
          );
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error marking notification as unread:', error);
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        const { notifications, setNotifications } = get();
        
        try {
          await axios.patch(`${API_BASE_URL}/notifications/mark-all-read`);

          // Update local state
          const updatedNotifications = notifications.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date().toISOString()
          }));
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      },

      // Delete notification
      deleteNotification: async (notificationId) => {
        const { notifications, setNotifications } = get();
        
        try {
          await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);

          // Update local state
          const updatedNotifications = notifications.filter(
            notification => notification._id !== notificationId
          );
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error deleting notification:', error);
        }
      },

      // Add new notification (for real-time updates)
      addNotification: (notification) => {
        const { notifications, setNotifications } = get();
        const updatedNotifications = [notification, ...notifications];
        setNotifications(updatedNotifications);
      },

      // Update notification (for real-time updates)
      updateNotification: (notificationId, updates) => {
        const { notifications, setNotifications } = get();
        const updatedNotifications = notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, ...updates }
            : notification
        );
        setNotifications(updatedNotifications);
      },

      // Clear all notifications
      clearNotifications: () => {
        set({ 
          notifications: [], 
          unreadCount: 0, 
          error: null,
          lastFetch: null 
        });
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.type === type);
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(notification => !notification.isRead);
      },

      // Get notifications by priority
      getNotificationsByPriority: (priority) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.priority === priority);
      },
    }),
    {
      name: 'notification-store',
    }
  )
);

export { useNotificationStore };
