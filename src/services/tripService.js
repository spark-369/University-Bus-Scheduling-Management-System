import apiClient from './client';

// Trip Services
export const tripService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/trips', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/trips/${id}`);
    return response.data;
  },

  start: async (scheduleId) => {
    const response = await apiClient.post('/api/trips', { scheduleId });
    return response.data;
  },

  update: async (id, tripData) => {
    const response = await apiClient.put(`/api/trips/${id}`, tripData);
    return response.data;
  },

  complete: async (id) => {
    const response = await apiClient.put(`/api/trips/${id}`, { status: 'COMPLETED' });
    return response.data;
  },

  cancel: async (id) => {
    const response = await apiClient.put(`/api/trips/${id}`, { status: 'CANCELLED' });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/trips/${id}`);
    return response.data;
  },
};

export default tripService;
