'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, LoadingSpinner, Modal, Input, Select } from '@/components/ui';
import { notificationService } from '@/services/notificationService';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiSend, FiExternalLink } from 'react-icons/fi';

export default function NotificationsPage() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'SCHEDULE_CHANGE',
    title: '',
    message: '',
    userRole: 'PASSENGER',
    link: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = async () => {
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await notificationService.create(formData);
      await fetchNotifications();
      setShowCreateModal(false);
      setFormData({
        type: 'SCHEDULE_CHANGE',
        title: '',
        message: '',
        userRole: 'PASSENGER',
        link: '',
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      alert(error.response?.data?.error || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      await notificationService.markAsRead(notificationIds);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAsRead([], true);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationService.delete([notificationId]);
        await fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleDeleteAllRead = async () => {
    if (confirm('Are you sure you want to delete all read notifications?')) {
      try {
        await notificationService.deleteAllRead();
        await fetchNotifications();
      } catch (error) {
        console.error('Error deleting read notifications:', error);
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION': return 'success';
      case 'BUS_ARRIVING': return 'info';
      case 'EMERGENCY': return 'danger';
      case 'SCHEDULE_CHANGE': return 'warning';
      case 'DELAY': return 'warning';
      case 'BUS_PASS_CREATED': return 'success';
      case 'MAINTENANCE_CREATED': return 'warning';
      case 'ROUTE_CREATED': return 'info';
      case 'TRIP_STARTED': return 'info';
      case 'TRIP_SCHEDULED': return 'info';
      case 'FEEDBACK_RECEIVED': return 'success';
      case 'STOP_CREATED': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const notificationTypes = [
    { value: 'SCHEDULE_CHANGE', label: 'Schedule Change' },
    { value: 'DELAY', label: 'Delay' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'BUS_ARRIVING', label: 'Bus Arriving' },
    { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmation' },
    { value: 'BUS_PASS_CREATED', label: 'Bus Pass Created' },
    { value: 'MAINTENANCE_CREATED', label: 'Maintenance Created' },
    { value: 'ROUTE_CREATED', label: 'Route Created' },
    { value: 'TRIP_STARTED', label: 'Trip Started' },
    { value: 'TRIP_SCHEDULED', label: 'Trip Scheduled' },
    { value: 'FEEDBACK_RECEIVED', label: 'Feedback Received' },
    { value: 'STOP_CREATED', label: 'Stop Created' },
  ];

  const userRoleOptions = [
    { value: 'PASSENGER', label: 'Passengers' },
    { value: 'DRIVER', label: 'Drivers' },
    { value: 'ADMIN', label: 'Admins' },
    { value: '', label: 'All Users' },
  ];

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead([notification.id]);
    }
    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-400">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex space-x-2">
            {isAdmin && (
              <>
                <Button variant="outline" onClick={handleDeleteAllRead}>
                  <FiTrash2 className="mr-2" />
                  Clean up read
                </Button>
                <Button onClick={handleCreateClick}>
                  <FiSend className="mr-2" />
                  Send Notification
                </Button>
              </>
            )}
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <FiCheckCircle className="mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-500/10' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FiBell className={`w-5 h-5 ${notification.isRead ? 'text-slate-500' : 'text-blue-400'}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                          {notification.title}
                        </h3>
                        <Badge variant={getTypeColor(notification.type)} size="sm">
                          {notification.type.replace(/_/g, ' ')}
                        </Badge>
                        {notification.userRole && (
                          <Badge variant="default" size="sm">
                            {notification.userRole}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {formatDate(notification.sentAt)}
                        </p>
                        {notification.link && (
                          <span className="text-xs text-blue-400 flex items-center">
                            <FiExternalLink className="w-3 h-3 mr-1" />
                            View
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead([notification.id])}
                      >
                        <FiCheck />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiBell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No notifications</p>
          </div>
        )}
      </div>

      {/* Create Notification Modal (Admin only) */}
      {isAdmin && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Send Notification"
          size="lg"
        >
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <Select
                label="Notification Type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={notificationTypes}
                required
              />
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter notification title"
                required
              />
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter notification message"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <Select
                label="Send To (Role)"
                name="userRole"
                value={formData.userRole}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                options={userRoleOptions}
              />
              <Input
                label="Link (Optional)"
                name="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/notifications"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Send
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
