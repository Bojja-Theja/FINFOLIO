import { useState, useCallback, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'security' | 'system' | 'insight';
  action?: {
    label: string;
    handler: () => void;
  };
  metadata?: Record<string, any>;
}

interface UseNotificationReturn {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  getNotificationsByPriority: (priority: Notification['priority']) => Notification[];
}

export const useNotification = (): UseNotificationReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate unique ID
  const generateId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Remove specific notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove non-critical notifications after 24 hours
    if (notification.priority !== 'critical') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }

    return newNotification.id;
  }, [removeNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);


  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(notification => notification.category === category);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(notification => notification.priority === priority);
  }, [notifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Cleanup old notifications on mount
  useEffect(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setNotifications(prev =>
      prev.filter(notification =>
        notification.priority === 'critical' || notification.timestamp > oneWeekAgo
      )
    );
  }, []);

  // Auto-refresh notifications from API (mock implementation)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock API call - in real implementation, this would fetch from backend
        // const response = await fetch('/api/notifications');
        // const serverNotifications = await response.json();

        // For now, add some sample notifications
        const sampleNotifications = [
          {
            type: 'success' as const,
            title: 'Monthly Goal Achieved',
            message: 'Congratulations! You saved ₹5,000 this month',
            category: 'financial' as const,
            priority: 'medium' as const
          },
          {
            type: 'warning' as const,
            title: 'Budget Alert',
            message: 'Your entertainment expenses are 20% over budget',
            category: 'financial' as const,
            priority: 'medium' as const
          },
          {
            type: 'info' as const,
            title: 'Investment Update',
            message: 'Your portfolio is up 3.2% this quarter',
            category: 'insight' as const,
            priority: 'low' as const
          }
        ];

        // Only add if we don't have notifications yet
        if (notifications.length === 0) {
          sampleNotifications.forEach(notification => {
            addNotification(notification);
          });
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [notifications.length, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByCategory,
    getNotificationsByPriority
  };
};
