'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, LoadingSpinner, Modal, Input, Select } from '@/components/ui';
import { maintenanceService } from '@/services/maintenanceService';
import { busService } from '@/services/busService';
import { FiPlus, FiEdit2, FiTrash2, FiTool } from 'react-icons/fi';

export default function MaintenancePage() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    busId: '',
    type: 'ROUTINE',
    description: '',
    scheduledDate: '',
    cost: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaintenance();
    fetchBuses();
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [pathname]);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getAll();
      setMaintenanceRecords(data.maintenance || []);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const data = await busService.getAll();
      setBuses(data.buses || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        scheduledDate: new Date(formData.scheduledDate),
      };
      
      if (editingRecord) {
        await maintenanceService.update(editingRecord.id, payload);
      } else {
        await maintenanceService.create(payload);
      }
      await fetchMaintenance();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      alert(error.response?.data?.error || 'Failed to save maintenance record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      busId: record.busId || '',
      type: record.type || 'ROUTINE',
      description: record.description || '',
      scheduledDate: record.scheduledDate ? new Date(record.scheduledDate).toISOString().slice(0, 16) : '',
      cost: record.cost || '',
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await maintenanceService.delete(id);
        await fetchMaintenance();
      } catch (error) {
        console.error('Error deleting maintenance:', error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await maintenanceService.update(id, { status: 'COMPLETED' });
      await fetchMaintenance();
    } catch (error) {
      console.error('Error completing maintenance:', error);
    }
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      busId: '',
      type: 'ROUTINE',
      description: '',
      scheduledDate: '',
      cost: '',
      notes: '',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'SCHEDULED': return 'info';
      default: return 'default';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ROUTINE': return 'info';
      case 'REPAIR': return 'warning';
      case 'BREAKDOWN': return 'danger';
      case 'INSPECTION': return 'default';
      default: return 'default';
    }
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
          <h1 className="text-2xl font-bold text-slate-100">Maintenance</h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <FiPlus className="mr-2" />
            Add Maintenance
          </Button>
        </div>

        {/* Maintenance list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : maintenanceRecords.length > 0 ? (
          <div className="bg-slate-900 rounded-lg shadow overflow-hidden ring-1 ring-slate-800">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {maintenanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">
                        {record.bus?.busNumber}
                      </div>
                      <div className="text-sm text-slate-400">
                        {record.bus?.plateNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getTypeBadge(record.type)}>{record.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-100">{record.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {record.cost ? `$${record.cost.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadge(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {record.status === 'SCHEDULED' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleComplete(record.id)}
                            title="Mark Complete"
                          >
                            <FiTool />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                          <FiEdit2 />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(record.id)}>
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No maintenance records found</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={editingRecord ? 'Edit Maintenance' : 'Add Maintenance'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Bus"
                name="busId"
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                options={buses.map(bus => ({
                  value: bus.id,
                  label: `${bus.busNumber} - ${bus.plateNumber}`,
                }))}
                placeholder="Select a bus"
                required
              />
              <Select
                label="Type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'ROUTINE', label: 'Routine' },
                  { value: 'REPAIR', label: 'Repair' },
                  { value: 'BREAKDOWN', label: 'Breakdown' },
                  { value: 'INSPECTION', label: 'Inspection' },
                ]}
              />
              <div className="md:col-span-2">
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Scheduled Date"
                name="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
              <Input
                label="Estimated Cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {editingRecord ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
