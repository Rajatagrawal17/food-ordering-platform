import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { connectSocket, disconnectSocket, onSocketEvent } from '../services/socketService';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list ?? []);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    const unsubscribeStatus = onSocketEvent('order:status', (order) => {
      setToast({
        title: 'Order Status Updated',
        message: `Order #${order._id.slice(-6)} is now ${order.orderStatus.replace('_', ' ')}.`,
      });
      loadNotifications();
    });

    const unsubscribePayment = onSocketEvent('payment:event', (payload) => {
      if (payload.status === 'successful') {
        setToast({
          title: 'Payment Successful',
          message: `Your payment was verified successfully.`,
        });
      } else if (payload.status === 'failed') {
        setToast({
          title: 'Payment Failed',
          message: payload.failureReason ?? 'Your payment attempt failed.',
        });
      }
      loadNotifications();
    });

    return () => {
      unsubscribeStatus();
      unsubscribePayment();
      disconnectSocket();
    };
  }, [token, isAuthenticated]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const clearToast = () => setToast(null);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      toast,
      clearToast,
      markAsRead,
      markAllAsRead,
      refresh: loadNotifications,
    }),
    [notifications, unreadCount, toast]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast && (
        <div className="notification-toast">
          <strong>{toast.title}</strong>
          <p>{toast.message}</p>
          <button type="button" onClick={clearToast}>Dismiss</button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
