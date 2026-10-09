import apiClient from './client';

// Notification Services
export const notificationService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/notifications', { params });
    return response.data;
  },

  create: async (notificationData) => {
    const response = await apiClient.post('/api/notifications', notificationData);
    return response.data;
  },

  markAsRead: async (notificationIds, markAllRead = false) => {
    const response = await apiClient.put('/api/notifications', { notificationIds, markAllRead });
    return response.data;
  },

  delete: async (notificationIds) => {
    const response = await apiClient.put('/api/notifications', { deleteNotificationIds: notificationIds });
    return response.data;
  },

  deleteById: async (id) => {
    const response = await apiClient.delete(`/api/notifications?id=${id}`);
    return response.data;
  },

  deleteAllRead: async () => {
    const response = await apiClient.delete('/api/notifications');
    return response.data;
  },
};

export default notificationService;
