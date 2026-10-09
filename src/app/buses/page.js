'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Card, Button, Badge, LoadingSpinner, Modal, Input, Select } from '@/components/ui';
import { busService } from '@/services/busService';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function BusesPage() {
  const { isAdmin } = useAuth();
  const { buses, fetchBuses, loading } = useApp();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    plateNumber: '',
    capacity: '',
    model: '',
    year: '',
    fuelType: 'DIESEL',
    mileage: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBuses();
  }, [fetchBuses]);

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
      if (selectedBus) {
        await busService.update(selectedBus.id, formData);
      } else {
        await busService.create(formData);
      }
      await fetchBuses();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving bus:', error);
      alert(error.response?.data?.error || 'Failed to save bus');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (bus) => {
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      plateNumber: bus.plateNumber,
      capacity: bus.capacity,
      model: bus.model || '',
      year: bus.year || '',
      fuelType: bus.fuelType || 'DIESEL',
      mileage: bus.mileage || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this bus?')) {
      try {
        await busService.delete(id);
        await fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedBus(null);
    setFormData({
      busNumber: '',
      plateNumber: '',
      capacity: '',
      model: '',
      year: '',
      fuelType: 'DIESEL',
      mileage: 0,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'MAINTENANCE': return 'warning';
      case 'INACTIVE': return 'danger';
      default: return 'default';
    }
  };

  const fuelTypeOptions = [
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'PETROL', label: 'Petrol' },
    { value: 'ELECTRIC', label: 'Electric' },
    { value: 'CNG', label: 'CNG' },
  ];

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
          <h1 className="text-2xl font-bold text-slate-100">Buses</h1>
          {isAdmin && (
            <Button onClick={() => { resetForm(); setShowModal(true); }}>
              <FiPlus className="mr-2" />
              Add Bus
            </Button>
          )}
        </div>

        {/* Buses grid */}
        {loading.buses ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : buses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <Card key={bus.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {bus.busNumber}
                    </h3>
                    <p className="text-sm text-slate-400">{bus.plateNumber}</p>
                  </div>
                  <Badge variant={getStatusColor(bus.status)}>{bus.status}</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-medium">{bus.capacity} seats</span>
                  </div>
                  {bus.model && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model:</span>
                      <span className="font-medium">{bus.model}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fuel Type:</span>
                    <span className="font-medium">{bus.fuelType}</span>
                  </div>
                  {bus.driver && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <span className="font-medium">{bus.driver.name}</span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-800">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(bus)}>
                      <FiEdit />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(bus.id)}>
                      <FiTrash2 />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No buses found</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={selectedBus ? 'Edit Bus' : 'Add Bus'}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <Input
              label="Bus Number"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              placeholder="e.g., Bus-001"
              required
            />
            <Input
              label="Plate Number"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              placeholder="e.g., ABC-1234"
              required
            />
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Number of seats"
              required
            />
            <Input
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Bus model"
            />
            <Input
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder="Manufacturing year"
            />
            <Select
              label="Fuel Type"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              options={fuelTypeOptions}
            />
            <Input
              label="Mileage"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleChange}
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
                {selectedBus ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
