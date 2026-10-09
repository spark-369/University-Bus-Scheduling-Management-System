import apiClient from './client';

// Schedule Services
export const scheduleService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/schedules', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/schedules/${id}`);
    return response.data;
  },

  create: async (scheduleData) => {
    const response = await apiClient.post('/api/schedules', scheduleData);
    return response.data;
  },

  update: async (id, scheduleData) => {
    const response = await apiClient.put(`/api/schedules/${id}`, scheduleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/schedules/${id}`);
    return response.data;
  },
};

export default scheduleService;
