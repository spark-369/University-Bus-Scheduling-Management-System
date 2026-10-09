import apiClient from './client';

// Driver Assignment Services
export const assignmentService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/assignments', { params });
    return response.data;
  },

  assign: async (busId, driverId) => {
    const response = await apiClient.post('/api/assignments', { busId, driverId });
    return response.data;
  },

  unassign: async (busId) => {
    const response = await apiClient.delete('/api/assignments', { params: { busId } });
    return response.data;
  },
};

export default assignmentService;
