import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { api, getToken } from '../utils/api';
import { useAuth } from './AuthContext';
import type { ContactMessage } from '../utils/types';

interface Notification {
  id: string;
  type: 'new_message' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  data?: ContactMessage;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  newMessagesCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const prevCountRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only poll when user is authenticated (not just token present)
    if (!user) {
      prevCountRef.current = null;
      setNewMessagesCount(0);
      return;
    }

    loadNewMessagesCount();

    const interval = setInterval(() => {
      if (getToken()) {
        loadNewMessagesCount();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  const loadNewMessagesCount = async () => {
    try {
      const stats = await api.get<{ new: number }>('/contact-messages/stats');
      const currentCount = stats.new || 0;

      // Detect new messages (count increased)
      if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
        const diff = currentCount - prevCountRef.current;
        addNotification({
          type: 'new_message',
          title: 'Nouveau message de contact',
          message: `${diff} nouveau${diff > 1 ? 'x' : ''} message${diff > 1 ? 's' : ''} de contact`,
        });

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nouveau message de contact', {
            body: `${diff} nouveau${diff > 1 ? 'x' : ''} message${diff > 1 ? 's' : ''}`,
            icon: '/favicon.ico',
          });
        }

        // Sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWa87OihUBEJTqLh8bllHAU2ldjxz3cpBSl+zPDijz4KFmS56+qnVRIKRJzg8r9sIAUsgs/y2Ik2Bxpouuzqp1QRAkig3/G4aB4GNZbY8s92KQQogM3w45A+ChViu+rso1MRA0Ke4fK/bSAGLIHP8tiKNwgZbLvt6aRTEgJHn+Dyvmwg');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }

      prevCountRef.current = currentCount;
      setNewMessagesCount(currentCount);
    } catch (error) {
      console.error('Error loading new messages count:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    newMessagesCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
