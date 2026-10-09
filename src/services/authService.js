import apiClient from './client';

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    if (response.data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    if (response.data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Validate the stored token against the server and return the fresh user.
  // Returns null if the token is missing, expired or invalid.
  getSession: async () => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const response = await apiClient.get('/api/auth/me');
      if (response.data?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};

export default authService;
