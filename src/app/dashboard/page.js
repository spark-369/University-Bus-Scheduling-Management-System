'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Card, Badge, LoadingSpinner } from '@/components/ui';
import { FiUsers, FiTruck, FiMap, FiClock, FiNavigation, FiCalendar } from 'react-icons/fi';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { dashboardStats, fetchDashboardStats, loading } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin, fetchDashboardStats]);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardStats?.stats || {};

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Buses',
      value: stats.totalBuses || 0,
      icon: FiTruck,
      color: 'bg-green-500',
    },
    {
      title: 'Total Routes',
      value: stats.totalRoutes || 0,
      icon: FiMap,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Schedules',
      value: stats.totalSchedules || 0,
      icon: FiClock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Today\'s Trips',
      value: stats.todayTrips || 0,
      icon: FiNavigation,
      color: 'bg-red-500',
    },
    {
      title: 'Active Buses',
      value: stats.activeBuses || 0,
      icon: FiTruck,
      color: 'bg-teal-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome message */}
        <div className="bg-slate-900 rounded-lg shadow p-6 ring-1 ring-slate-800">
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your bus system today.
          </p>
        </div>

        {isAdmin ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Recent trips and upcoming schedules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Trips */}
              <Card title="Recent Trips">
                {loading.dashboard ? (
                  <LoadingSpinner />
                ) : dashboardStats?.recentTrips?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardStats.recentTrips.map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                        <div>
                          <p className="font-medium text-slate-100">{trip.route?.name}</p>
                          <p className="text-sm text-slate-400">
                            Bus: {trip.bus?.busNumber} | Driver: {trip.driver?.user?.name}
                          </p>
                        </div>
                        <Badge variant={trip.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {trip.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4">No recent trips</p>
                )}
              </Card>

              {/* Upcoming Schedules */}
              <Card title="Upcoming Schedules">
                {loading.dashboard ? (
                  <LoadingSpinner />
                ) : dashboardStats?.upcomingSchedules?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardStats.upcomingSchedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                        <div>
                          <p className="font-medium text-slate-100">{schedule.route?.name}</p>
                          <p className="text-sm text-slate-400">
                            Bus: {schedule.bus?.busNumber} | {new Date(schedule.departureTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="info">{schedule.scheduleType}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4">No upcoming schedules</p>
                )}
              </Card>
            </div>

            {/* Maintenance Alerts */}
            <Card title="Maintenance Alerts">
              {loading.dashboard ? (
                <LoadingSpinner />
              ) : dashboardStats?.maintenanceAlerts?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.maintenanceAlerts.map((maintenance) => (
                    <div key={maintenance.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div>
                        <p className="font-medium text-slate-100">
                          Bus: {maintenance.bus?.busNumber}
                        </p>
                        <p className="text-sm text-slate-400">{maintenance.description}</p>
                      </div>
                      <Badge variant={maintenance.status === 'IN_PROGRESS' ? 'warning' : 'info'}>
                        {maintenance.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No maintenance alerts</p>
              )}
            </Card>
          </>
        ) : (
          <div className="bg-slate-900 rounded-lg shadow p-6 ring-1 ring-slate-800">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/routes"
                className="p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <FiMap className="w-6 h-6 text-blue-400 mb-2" />
                <p className="font-medium text-slate-100">View Routes</p>
                <p className="text-sm text-slate-400">Browse available bus routes</p>
              </a>
              <a
                href="/schedules"
                className="p-4 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors"
              >
                <FiClock className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="font-medium text-slate-100">View Schedules</p>
                <p className="text-sm text-slate-400">Check bus schedules</p>
              </a>
              <a
                href="/bookings"
                className="p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <FiCalendar className="w-6 h-6 text-purple-400 mb-2" />
                <p className="font-medium text-slate-100">My Bookings</p>
                <p className="text-sm text-slate-400">View your bookings</p>
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
