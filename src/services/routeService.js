import apiClient from './client';

// Route Services
export const routeService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/routes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/routes/${id}`);
    return response.data;
  },

  create: async (routeData) => {
    const response = await apiClient.post('/api/routes', routeData);
    return response.data;
  },

  update: async (id, routeData) => {
    const response = await apiClient.put(`/api/routes/${id}`, routeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/routes/${id}`);
    return response.data;
  },
};

export default routeService;
