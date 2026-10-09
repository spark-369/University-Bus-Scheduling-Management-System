"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Modal,
  Select,
  Alert,
} from "@/components/ui";
import { assignmentService } from "@/services/assignmentService";
import { FiUserCheck, FiUserMinus, FiUser } from "react-icons/fi";

export default function AssignmentsPage() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [buses, setBuses] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await assignmentService.getAll();
      setBuses(data.buses || []);
      setAvailableDrivers(data.availableDrivers || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError(err.response?.data?.error || "Failed to load driver assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchAssignments();
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [fetchAssignments, pathname]);

  const handleOpenAssign = (bus) => {
    setSelectedBus(bus);
    setSelectedDriverId("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBus(null);
    setSelectedDriverId("");
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;
    setSubmitting(true);
    try {
      await assignmentService.assign(selectedBus.id, selectedDriverId);
      await fetchAssignments();
      handleCloseModal();
      setMessage({ type: "success", text: "Driver assigned successfully!" });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.error || "Failed to assign driver",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (bus) => {
    if (!confirm(`Unassign ${bus.driver?.name} from bus ${bus.busNumber}?`)) {
      return;
    }
    try {
      await assignmentService.unassign(bus.id);
      await fetchAssignments();
      setMessage({ type: "success", text: "Driver unassigned successfully!" });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.error || "Failed to unassign driver",
      });
    }
  };

  if (!mounted || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <Alert variant="danger" title="Access Denied">
          Only administrators can manage driver assignments.
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Driver Assignments
            </h1>
            <p className="text-slate-400 mt-1">
              Assign drivers to buses and monitor fleet coverage.
            </p>
          </div>
          <Button variant="outline" onClick={fetchAssignments}>
            Refresh
          </Button>
        </div>

        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" title="Error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Buses", value: stats.totalBuses, color: "bg-blue-500" },
              { label: "Assigned", value: stats.assignedBuses, color: "bg-green-500" },
              { label: "Unassigned", value: stats.unassignedBuses, color: "bg-yellow-500" },
              { label: "Available Drivers", value: stats.availableDrivers, color: "bg-purple-500" },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg mr-3`}>
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bus assignment grid */}
        {buses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <Card key={bus.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {bus.busNumber}
                    </h3>
                    <p className="text-sm text-slate-400">{bus.plateNumber}</p>
                  </div>
                  <Badge
                    variant={
                      bus.status === "ACTIVE"
                        ? "success"
                        : bus.status === "MAINTENANCE"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {bus.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-medium">{bus.capacity} seats</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400">Driver:</span>
                    {bus.driver ? (
                      <div className="text-right">
                        <p className="font-medium">{bus.driver.name}</p>
                        <p className="text-xs text-slate-500">
                          {bus.driver.licenseNumber || bus.driver.email}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="warning">Unassigned</Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-800">
                  {bus.driver ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUnassign(bus)}
                    >
                      <FiUserMinus className="mr-1" /> Unassign
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleOpenAssign(bus)}
                      disabled={availableDrivers.length === 0}
                    >
                      <FiUserCheck className="mr-1" /> Assign Driver
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No buses found</p>
          </div>
        )}

        {/* Assign modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={`Assign Driver to ${selectedBus?.busNumber || ""}`}
          size="md"
        >
          <form onSubmit={handleAssign}>
            <Select
              label="Select Driver"
              name="driverId"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              placeholder="Choose an available driver"
              required
              options={availableDrivers.map((driver) => ({
                value: driver.id,
                label: `${driver.name}${
                  driver.licenseNumber ? ` — ${driver.licenseNumber}` : ""
                }`,
              }))}
            />
            {availableDrivers.length === 0 && (
              <p className="text-sm text-slate-400">
                No available drivers. Add a driver under Users first.
              </p>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!selectedDriverId}
              >
                Assign
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
