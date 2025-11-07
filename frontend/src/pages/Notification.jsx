// [file name]: Notification.jsx
// [file content begin]
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
import {
  Bell,
  CheckCircle,
  Clock,
  Car,
  UserCheck,
  Star,
  Filter,
  CheckCheck,
  Trash2
} from 'lucide-react';

// Import the actions
import {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsReadSuccess,
  markAllAsReadSuccess,
  deleteNotificationSuccess,
  deleteMultipleNotificationsSuccess,
} from '../redux/notification/notificationSlice';

export default function Notification() {
  const { currentUser } = useSelector((state) => state.user);
  const { notifications, unreadCount, loading } = useSelector((state) => state.notification); // Get from Redux
  const dispatch = useDispatch(); // Initialize dispatch

  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const notificationIcons = {
    car_match: <Car className="w-5 h-5 text-blue-400" />,
    purchase_update: <CheckCircle className="w-5 h-5 text-green-400" />,
    review_request: <Clock className="w-5 h-5 text-yellow-400" />,
    verification_request: <UserCheck className="w-5 h-5 text-purple-400" />,
    general: <Bell className="w-5 h-5 text-gray-400" />,
    promotion: <Star className="w-5 h-5 text-pink-400" />
  };

  const notificationColors = {
    car_match: 'border-l-blue-500 bg-blue-500/5',
    purchase_update: 'border-l-green-500 bg-green-500/5',
    review_request: 'border-l-yellow-500 bg-yellow-500/5',
    verification_request: 'border-l-purple-500 bg-purple-500/5',
    general: 'border-l-gray-500 bg-gray-500/5',
    promotion: 'border-l-pink-500 bg-pink-500/5'
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchNotifications = async () => {
    try {
      dispatch(fetchNotificationsStart());
      const res = await fetch('/backend/notification');
      const data = await res.json();

      if (data.success) {
        dispatch(fetchNotificationsSuccess(data.notifications));
      } else {
        dispatch(fetchNotificationsFailure('Failed to load notifications'));
        showMessage('Failed to load notifications', 'error');
      }
    } catch (error) {
      dispatch(fetchNotificationsFailure('Error fetching notifications'));
      showMessage('Error fetching notifications', 'error');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/backend/notification/${notificationId}/mark-read`, {
        method: 'PUT'
      });

      if (res.ok) {
        dispatch(markAsReadSuccess(notificationId));
      } else {
        showMessage('Failed to mark as read', 'error');
      }
    } catch (error) {
      showMessage('Error marking as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/backend/notification/mark-all-read', {
        method: 'PUT'
      });

      if (res.ok) {
        dispatch(markAllAsReadSuccess());
      } else {
        showMessage('Failed to mark all as read', 'error');
      }
    } catch (error) {
      showMessage('Error marking all as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`/backend/notification/${notificationId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        dispatch(deleteNotificationSuccess(notificationId));
        showMessage('Notification deleted', 'success');
      } else {
        showMessage('Failed to delete notification', 'error');
      }
    } catch (error) {
      showMessage('Error deleting notification', 'error');
    }
  };

  const deleteSelected = async () => {
    try {
      const promises = Array.from(selectedNotifications).map(id =>
        fetch(`/backend/notification/${id}`, { method: 'DELETE' })
      );

      await Promise.all(promises);
      dispatch(deleteMultipleNotificationsSuccess(Array.from(selectedNotifications)));
      setSelectedNotifications(new Set());
      showMessage('Selected notifications deleted', 'success');
    } catch (error) {
      showMessage('Failed to delete notifications', 'error');
    }
  };

  const toggleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    else if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    else return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20">
      <div className="container mx-auto px-4 py-8 mt-10">

        {/* ✅ Message Banner */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-center font-medium ${
              messageType === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="p-3 bg-gray-800/50 rounded-2xl border border-gray-700">
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Notifications
              </h1>
              <p className="text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="car_match">Car Matches</option>
                <option value="purchase_update">Purchase Updates</option>
                <option value="review_request">Review Requests</option>
                <option value="verification_request">Verification Requests</option>
                <option value="promotion">Promotions</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {selectedNotifications.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete ({selectedNotifications.size})</span>
                </button>
              )}

              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500">
                {filter === 'unread'
                  ? "You're all caught up with unread notifications!"
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 transition-all duration-200 hover:bg-gray-700/20 border-l-4 ${
                    notificationColors[notification.type] || 'border-l-gray-500 bg-gray-500/5'
                  } ${!notification.read ? 'bg-gray-700/10' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification._id)}
                      onChange={() => toggleSelectNotification(notification._id)}
                      className="mt-1 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 focus:ring-offset-gray-800"
                    />

                    {/* Icon */}
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      {notificationIcons[notification.type] || <Bell className="w-5 h-5 text-gray-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white text-lg leading-relaxed">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-2"></div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{formatTime(notification.createdAt)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions Footer */}
        {selectedNotifications.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-2xl px-6 py-3 shadow-2xl">
            <div className="flex items-center space-x-4">
              <span className="text-white">
                {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAll}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {selectedNotifications.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// [file content end]
