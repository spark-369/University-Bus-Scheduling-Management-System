'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Card, Button, Badge, LoadingSpinner, Modal, Input } from '@/components/ui';
import { routeService } from '@/services/routeService';
import { FiPlus, FiEdit, FiTrash2, FiMapPin } from 'react-icons/fi';

export default function RoutesPage() {
  const { isAdmin } = useAuth();
  const { routes, fetchRoutes, loading } = useApp();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedDuration: '',
    distance: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRoutes();
  }, [fetchRoutes]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedRoute) {
        await routeService.update(selectedRoute.id, formData);
      } else {
        await routeService.create(formData);
      }
      await fetchRoutes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving route:', error);
      alert(error.response?.data?.error || 'Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      description: route.description || '',
      estimatedDuration: route.estimatedDuration,
      distance: route.distance,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await routeService.delete(id);
        await fetchRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedRoute(null);
    setFormData({
      name: '',
      description: '',
      estimatedDuration: '',
      distance: '',
    });
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Routes</h1>
          {isAdmin && (
            <Button onClick={() => { resetForm(); setShowModal(true); }}>
              <FiPlus className="mr-2" />
              Add Route
            </Button>
          )}
        </div>

        {/* Routes grid */}
        {loading.routes ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : routes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <Card key={route.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {route.name}
                    </h3>
                    {route.description && (
                      <p className="text-sm text-slate-400 mt-1">{route.description}</p>
                    )}
                  </div>
                  <Badge variant={route.isActive ? 'success' : 'default'}>
                    {route.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-medium">{route.estimatedDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-medium">{route.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stops:</span>
                    <span className="font-medium">{route.stops?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Schedules:</span>
                    <span className="font-medium">{route._count?.schedules || 0}</span>
                  </div>
                </div>

                {/* Stops list */}
                {route.stops && route.stops.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-sm font-medium text-slate-300 mb-2">Stops:</p>
                    <div className="flex flex-wrap gap-1">
                      {route.stops.slice(0, 5).map((stop) => (
                        <Badge key={stop.id} variant="info" size="sm">
                          <FiMapPin className="mr-1" />
                          {stop.name}
                        </Badge>
                      ))}
                      {route.stops.length > 5 && (
                        <Badge variant="default" size="sm">
                          +{route.stops.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-800">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(route)}>
                      <FiEdit />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(route.id)}>
                      <FiTrash2 />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No routes found</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={selectedRoute ? 'Edit Route' : 'Add Route'}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <Input
              label="Route Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Route 1 - Main Campus"
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Route description"
                rows={3}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
            <Input
              label="Estimated Duration (minutes)"
              name="estimatedDuration"
              type="number"
              value={formData.estimatedDuration}
              onChange={handleChange}
              placeholder="e.g., 30"
              required
            />
            <Input
              label="Distance (km)"
              name="distance"
              type="number"
              step="0.1"
              value={formData.distance}
              onChange={handleChange}
              placeholder="e.g., 10.5"
              required
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {selectedRoute ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
