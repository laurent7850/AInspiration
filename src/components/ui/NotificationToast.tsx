import React, { useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationToast() {
  const { notifications, clearNotification } = useNotifications();

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <Mail className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'new_message':
        return 'bg-blue-600 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  const visibleNotifications = notifications.slice(0, 3);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`${getColorClasses(notification.type)} rounded-lg shadow-lg p-4 animate-slide-in-right`}
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => clearNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
