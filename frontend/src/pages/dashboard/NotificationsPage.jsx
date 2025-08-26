import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Filter, 
  Search, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw,
  Key,
  Shield,
  Info,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow, format } from 'date-fns';

const NotificationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, key_reminder, security_alert, system_alert
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, urgent, high, medium, low
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications based on all filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesReadFilter = filter === 'all' || 
                             (filter === 'unread' && !notification.isRead) ||
                             (filter === 'read' && notification.isRead);
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;
    
    const matchesPriorityFilter = priorityFilter === 'all' || notification.priority === priorityFilter;
    
    return matchesSearch && matchesReadFilter && matchesTypeFilter && matchesPriorityFilter;
  });

  const getNotificationIcon = (type, priority) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-red-400' :
      priority === 'high' ? 'text-orange-400' :
      priority === 'medium' ? 'text-yellow-400' :
      'text-blue-400'
    }`;

    switch (type) {
      case 'key_reminder':
        return <Key className={iconClass} />;
      case 'security_alert':
        return <Shield className={iconClass} />;
      case 'system_alert':
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'border-l-red-500 bg-red-900/10';
    if (priority === 'high') return 'border-l-orange-500 bg-orange-900/10';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-900/10';
    return 'border-l-blue-500 bg-blue-900/10';
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const handleBulkAction = async (action) => {
    for (const notificationId of selectedNotifications) {
      switch (action) {
        case 'markRead':
          await markAsRead(notificationId);
          break;
        case 'markUnread':
          await markAsUnread(notificationId);
          break;
        case 'delete':
          await deleteNotification(notificationId);
          break;
      }
    }
    setSelectedNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-gray-400">Manage your notifications and stay updated</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {/* Search and Refresh */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="key_reminder">Key Reminders</option>
                <option value="security_alert">Security Alerts</option>
                <option value="system_alert">System Alerts</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quick Actions</label>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="w-full p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">
                {selectedNotifications.length} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => handleBulkAction('markRead')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('markUnread')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Mark Unread
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* List Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-750">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Notifications */}
          <div className="divide-y divide-gray-700">
            <AnimatePresence>
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-400">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No notifications found</h3>
                  <p className="text-gray-400">
                    {searchTerm || filter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'You\'re all caught up! New notifications will appear here.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-4 hover:bg-gray-750 transition-colors border-l-4 ${
                      getNotificationColor(notification.type, notification.priority)
                    } ${!notification.isRead ? 'bg-gray-750/50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        className="mt-1 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          {/* Priority Badge */}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            notification.priority === 'urgent' ? 'bg-red-900 text-red-300' :
                            notification.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                            notification.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-blue-900 text-blue-300'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>

                        <p className={`text-sm mb-3 ${
                          notification.isRead ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </div>
                            <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                            {notification.isRead && notification.readAt && (
                              <span>Read {formatDistanceToNow(new Date(notification.readAt), { addSuffix: true })}</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => notification.isRead ? markAsUnread(notification._id) : markAsRead(notification._id)}
                              className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                              title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                            >
                              {notification.isRead ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
