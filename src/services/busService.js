import apiClient from './client';

// Bus Services
export const busService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/buses', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/buses/${id}`);
    return response.data;
  },

  create: async (busData) => {
    const response = await apiClient.post('/api/buses', busData);
    return response.data;
  },

  update: async (id, busData) => {
    const response = await apiClient.put(`/api/buses/${id}`, busData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/buses/${id}`);
    return response.data;
  },
};

export default busService;
