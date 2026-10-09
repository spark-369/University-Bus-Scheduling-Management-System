import apiClient from './client';

// Dashboard Services
export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/api/dashboard');
    return response.data;
  },

  sendEmergencyBroadcast: async (message, routeId = null) => {
    const response = await apiClient.post('/api/dashboard', { message, routeId });
    return response.data;
  },
};

export default dashboardService;
