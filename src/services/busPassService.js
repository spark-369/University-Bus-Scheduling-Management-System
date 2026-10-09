import apiClient from './client';

// Bus Pass Services
export const busPassService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/buspass', { params });
    return response.data;
  },

  create: async (passData) => {
    const response = await apiClient.post('/api/buspass', passData);
    return response.data;
  },

  update: async (id, passData) => {
    const response = await apiClient.patch('/api/buspass', { id, ...passData });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/buspass?id=${id}`);
    return response.data;
  },

  verify: async (data) => {
    const response = await apiClient.put('/api/buspass', data);
    return response.data;
  },
};

export default busPassService;
