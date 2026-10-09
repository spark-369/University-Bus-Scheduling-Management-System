'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, LoadingSpinner } from '@/components/ui';
import { activityLogService } from '@/services/activityLogService';
import { FiActivity, FiUser, FiClock } from 'react-icons/fi';

export default function ActivityLogsPage() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [pathname, isAdmin]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await activityLogService.getAll();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('add')) return 'text-green-400';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'text-blue-400';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return 'text-red-400';
    if (actionLower.includes('login')) return 'text-purple-400';
    if (actionLower.includes('logout')) return 'text-orange-400';
    return 'text-slate-400';
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-400">Access denied. Admin only.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Activity Logs</h1>
          <Button onClick={fetchLogs} variant="outline">
            <FiActivity className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Activity Logs */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : logs.length > 0 ? (
          <div className="bg-slate-900 rounded-lg shadow overflow-hidden ring-1 ring-slate-800">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-800 rounded-full mr-3">
                          <FiUser className="text-slate-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-100">
                            {log.user?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {log.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-400 max-w-xs truncate">
                        {log.details || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-400">
                        <FiClock className="mr-1" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiActivity className="mx-auto text-slate-500" size={48} />
            <p className="mt-4 text-slate-400">No activity logs found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Add Button import
import { Button } from '@/components/ui';
