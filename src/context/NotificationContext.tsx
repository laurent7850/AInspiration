import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
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

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  useEffect(() => {
    loadNewMessagesCount();
    setupRealtimeSubscription();
  }, []);

  const loadNewMessagesCount = async () => {
    try {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      setNewMessagesCount(count || 0);
    } catch (error) {
      console.error('Error loading new messages count:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('contact_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          const newMessage = payload.new as ContactMessage;

          addNotification({
            type: 'new_message',
            title: 'Nouveau message de contact',
            message: `${newMessage.name} de ${newMessage.company} a envoyé un message`,
            data: newMessage
          });

          setNewMessagesCount(prev => prev + 1);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouveau message de contact', {
              body: `${newMessage.name} de ${newMessage.company}`,
              icon: '/favicon.ico',
              tag: newMessage.id
            });
          }

          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWa87OihUBEJTqLh8bllHAU2ldjxz3cpBSl+zPDijz4KFmS56+qnVRIKRJzg8r9sIAUsgs/y2Ik2Bxpouuzqp1QRAkig3/G4aB4GNZbY8s92KQQogM3w45A+ChViu+rso1MRA0Ke4fK/bSAGLIHP8tiKNwgZbLvt6aRTEgJHn+Dyvmwg');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
