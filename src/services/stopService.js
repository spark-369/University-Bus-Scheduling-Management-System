import apiClient from './client';

// Stop Services
export const stopService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/stops', { params });
    return response.data;
  },

  create: async (stopData) => {
    const response = await apiClient.post('/api/stops', stopData);
    return response.data;
  },

  update: async (id, stopData) => {
    const response = await apiClient.put(`/api/stops/${id}`, stopData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/stops/${id}`);
    return response.data;
  },
};

export default stopService;
