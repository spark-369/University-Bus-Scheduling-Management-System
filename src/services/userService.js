import apiClient from './client';

// User Services
export const userService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await apiClient.put(`/api/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default userService;
