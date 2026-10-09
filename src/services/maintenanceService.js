import apiClient from './client';

// Maintenance Services
export const maintenanceService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/maintenance', { params });
    return response.data;
  },

  create: async (maintenanceData) => {
    const response = await apiClient.post('/api/maintenance', maintenanceData);
    return response.data;
  },

  update: async (id, maintenanceData) => {
    const response = await apiClient.put('/api/maintenance', { id, ...maintenanceData });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/maintenance?id=${id}`);
    return response.data;
  },
};

export default maintenanceService;
