import apiClient from './client';

// Feedback Services
export const feedbackService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/feedback', { params });
    return response.data;
  },

  create: async (feedbackData) => {
    const response = await apiClient.post('/api/feedback', feedbackData);
    return response.data;
  },
};

export default feedbackService;
