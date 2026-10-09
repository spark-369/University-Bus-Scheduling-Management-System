'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import { dashboardService } from '@/services/dashboardService';
import { busService } from '@/services/busService';
import { routeService } from '@/services/routeService';
import { scheduleService } from '@/services/scheduleService';
import { tripService } from '@/services/tripService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState({
    notifications: false,
    dashboard: false,
    buses: false,
    routes: false,
    schedules: false,
    trips: false,
  });

  // Notification functions
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, []);

  const markNotificationsAsRead = useCallback(async (notificationIds, markAllRead = false) => {
    try {
      await notificationService.markAsRead(notificationIds, markAllRead);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [fetchNotifications]);

  // Dashboard functions
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      const data = await dashboardService.getStats();
      setDashboardStats(data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, []);

  // Bus functions
  const fetchBuses = useCallback(async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, buses: true }));
      const data = await busService.getAll(params);
      setBuses(data.buses || []);
      return data.buses;
    } catch (error) {
      console.error('Error fetching buses:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, buses: false }));
    }
  }, []);

  // Route functions
  const fetchRoutes = useCallback(async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, routes: true }));
      const data = await routeService.getAll(params);
      setRoutes(data.routes || []);
      return data.routes;
    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, routes: false }));
    }
  }, []);

  // Schedule functions
  const fetchSchedules = useCallback(async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, schedules: true }));
      const data = await scheduleService.getAll(params);
      setSchedules(data.schedules || []);
      return data.schedules;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, schedules: false }));
    }
  }, []);

  // Trip functions
  const fetchTrips = useCallback(async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, trips: true }));
      const data = await tripService.getAll(params);
      setTrips(data.trips || []);
      return data.trips;
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, trips: false }));
    }
  }, []);

  const value = {
    // State
    notifications,
    unreadCount,
    dashboardStats,
    buses,
    routes,
    schedules,
    trips,
    loading,
    
    // Actions
    fetchNotifications,
    markNotificationsAsRead,
    fetchDashboardStats,
    fetchBuses,
    fetchRoutes,
    fetchSchedules,
    fetchTrips,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
