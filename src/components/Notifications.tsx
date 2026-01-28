import { useState } from 'react';
import { Bell, X, Sparkles, TrendingUp, Calendar } from 'lucide-react';

interface Notification {
  id: string;
  type: 'upcoming-bill' | 'payment-success' | 'milestone';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'upcoming-bill',
    title: '🎯 Upcoming Payment Reminder',
    message: 'You have a payment of $500 due on January 1st for Chase Credit Card. You\'re doing amazing - every payment brings you closer to financial freedom!',
    date: '2024-12-18',
    read: false,
  },
  {
    id: '2',
    type: 'payment-success',
    title: '🌟 Payment Successful!',
    message: 'Great news! Your payment of $450 has been processed. You\'re one step closer to your goal! Keep up the incredible momentum!',
    date: '2024-12-15',
    read: false,
  },
  {
    id: '3',
    type: 'upcoming-bill',
    title: '💪 Friendly Payment Reminder',
    message: 'Personal Loan - Bank payment of $300 is due on December 20th. You\'ve got this! Each payment is a victory on your journey to debt freedom.',
    date: '2024-12-16',
    read: false,
  },
  {
    id: '4',
    type: 'milestone',
    title: '🎉 You\'re Making Progress!',
    message: 'Amazing work! You\'ve reduced your total debt by 15% this quarter. Your dedication is paying off - literally! Keep pushing forward!',
    date: '2024-12-12',
    read: true,
  },
];

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showPanel, setShowPanel] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upcoming-bill':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'payment-success':
        return <Sparkles className="w-5 h-5 text-green-600" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'upcoming-bill':
        return 'bg-purple-50';
      case 'payment-success':
        return 'bg-green-50';
      case 'milestone':
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                  <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${getNotificationBg(notification.type, notification.read)} hover:bg-opacity-80 transition-colors`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
