import { createContext, useContext } from 'react';
import type { NotificationContextType } from '../context/NotificationContext';

// Type-only import above: no runtime cycle with the provider module.
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
