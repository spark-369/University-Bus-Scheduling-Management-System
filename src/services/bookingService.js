import apiClient from './client';

// Booking Services
export const bookingService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/bookings/${id}`);
    return response.data;
  },

  create: async (bookingData) => {
    const response = await apiClient.post('/api/bookings', bookingData);
    return response.data;
  },

  cancel: async (id) => {
    const response = await apiClient.put(`/api/bookings/${id}`, { status: 'CANCELLED' });
    return response.data;
  },

  confirm: async (id) => {
    const response = await apiClient.put(`/api/bookings/${id}`, { status: 'CONFIRMED' });
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/bookings/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/bookings/${id}`);
    return response.data;
  },
};

export default bookingService;
