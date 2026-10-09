import apiClient from './client';

// Activity Log Services
export const activityLogService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/activity-logs', { params });
    return response.data;
  },
};

export default activityLogService;
