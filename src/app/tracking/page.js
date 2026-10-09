'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MapView } from '@/components/map';
import { Card, Badge, LoadingSpinner } from '@/components/ui';
import { stopService } from '@/services/stopService';

export default function TrackingPage() {
  const pathname = usePathname();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchStops();
      }
    }, 30000);

    return () => clearInterval(interval);
    // `pathname` re-runs this on each sidebar tab switch so the map data is
    // refreshed without a full page reload.
  }, [autoRefresh, pathname]);

  const fetchData = async () => {
    try {
      const stopsData = await stopService.getAll();
      setStops(stopsData.stops || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStops = async () => {
    try {
      const data = await stopService.getAll();
      setStops(data.stops || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Live Tracking</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-slate-300">Auto-refresh</span>
            </label>
            <button
              onClick={fetchStops}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Map */}
            <Card className="p-0 overflow-hidden">
              <MapView
                stops={stops}
                height="500px"
              />
            </Card>

            {/* Stops List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stops.map((stop) => (
                <Card key={stop.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100">
                        {stop.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Order: {stop.order}
                      </p>
                    </div>
                    <Badge variant={stop.isActive ? 'success' : 'default'}>
                      {stop.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {stop.address && (
                    <div className="mt-3 text-sm text-slate-400">
                      <p>{stop.address}</p>
                    </div>
                  )}
                </Card>
              ))}
              
              {stops.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-400">No stops found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
