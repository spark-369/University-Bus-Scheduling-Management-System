import apiClient from "./client";

// Report Services
export const reportService = {
  getDashboard: async (params = {}) => {
    const response = await apiClient.get("/api/reports", { params });
    return response.data;
  },

  getDailySummary: async (params = {}) => {
    const response = await apiClient.get("/api/reports", {
      params: { ...params, type: "daily-summary" },
    });
    return response.data;
  },

  getBusUsage: async (params = {}) => {
    const response = await apiClient.get("/api/reports", {
      params: { ...params, type: "bus-usage" },
    });
    return response.data;
  },

  getDriverPerformance: async (params = {}) => {
    const response = await apiClient.get("/api/reports", {
      params: { ...params, type: "driver-performance" },
    });
    return response.data;
  },

  getFuelConsumption: async (params = {}) => {
    const response = await apiClient.get("/api/reports", {
      params: { ...params, type: "fuel-consumption" },
    });
    return response.data;
  },
};

export default reportService;
