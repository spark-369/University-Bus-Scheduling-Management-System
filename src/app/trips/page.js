"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Modal,
  Select,
} from "@/components/ui";
import { tripService } from "@/services/tripService";
import { FiPlay, FiCheck, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function TripsPage() {
  const { isAdmin, isDriver } = useAuth();
  const { trips, fetchTrips, schedules, fetchSchedules, loading } = useApp();
  const [mounted, setMounted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTrips();
    fetchSchedules();
  }, [fetchTrips, fetchSchedules]);

  const handleStartTrip = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await tripService.start(selectedSchedule);
      await fetchTrips();
      setShowStartModal(false);
      setSelectedSchedule("");
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to start trip. The selected schedule may already have an active trip.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTrip = async (id) => {
    if (confirm("Are you sure you want to complete this trip?")) {
      try {
        await tripService.complete(id);
        await fetchTrips();
      } catch (error) {
        alert(error.response?.data?.error || "Failed to complete trip");
      }
    }
  };

  const handleCancelTrip = async (id) => {
    if (confirm("Are you sure you want to cancel this trip?")) {
      try {
        await tripService.cancel(id);
        await fetchTrips();
      } catch (error) {
        alert(error.response?.data?.error || "Failed to cancel trip");
      }
    }
  };

  const handleEditClick = (trip) => {
    setEditingTrip(trip);
    setEditFormData({
      status: trip.status,
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingTrip) return;
    setSubmitting(true);
    try {
      await tripService.update(editingTrip.id, editFormData);
      await fetchTrips();
      setShowEditModal(false);
      setEditingTrip(null);
      setEditFormData({ status: "" });
    } catch (error) {
      console.error("Error updating trip:", error);
      alert(error.response?.data?.error || "Failed to update trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to delete this trip? This action cannot be undone.",
      )
    ) {
      try {
        await tripService.delete(id);
        await fetchTrips();
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "default";
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
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
          <h1 className="text-2xl font-bold text-slate-100">Trips</h1>
          {isDriver && (
            <Button onClick={() => setShowStartModal(true)}>
              <FiPlay className="mr-2" />
              Start Trip
            </Button>
          )}
        </div>

        {/* Trips list */}
        {loading.trips ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : trips.length > 0 ? (
          <div className="bg-slate-900 rounded-lg shadow overflow-hidden ring-1 ring-slate-800">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  {isDriver && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                  {isAdmin && !isDriver && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-800/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">
                        {trip.route?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-100">
                        {trip.bus?.busNumber}
                      </div>
                      <div className="text-sm text-slate-400">
                        {trip.bus?.plateNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-100">
                        {trip.driver?.name || "Not assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                      {trip.startTime ? formatDateTime(trip.startTime) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </td>
                    {isDriver && trip.status === "IN_PROGRESS" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCompleteTrip(trip.id)}
                          >
                            <FiCheck />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancelTrip(trip.id)}
                          >
                            <FiX />
                          </Button>
                        </div>
                      </td>
                    )}
                    {isAdmin && !isDriver && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(trip)}
                          >
                            <FiEdit2 />
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(trip.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    )}
                    {isAdmin && isDriver && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {trip.status !== "COMPLETED" &&
                            trip.status !== "CANCELLED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(trip)}
                              >
                                <FiEdit2 />
                              </Button>
                            )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(trip.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No trips found</p>
          </div>
        )}

        {/* Start Trip Modal */}
        <Modal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          title="Start Trip"
          size="md"
        >
          <form onSubmit={handleStartTrip}>
            {loading.schedules ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : schedules.filter((s) => s.isActive).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No active schedules available
              </div>
            ) : (
              <Select
                label="Select Schedule"
                name="scheduleId"
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                options={schedules
                  .filter((s) => s.isActive)
                  .map((s) => ({
                    value: s.id,
                    label: `${s.route?.name || "Route"} - ${new Date(s.departureTime).toLocaleTimeString()}`,
                  }))}
                placeholder="Choose a schedule"
                required
              />
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStartModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={
                  loading.schedules ||
                  schedules.filter((s) => s.isActive).length === 0
                }
              >
                Start Trip
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Trip Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTrip(null);
          }}
          title="Edit Trip"
          size="md"
        >
          <form onSubmit={handleEdit}>
            <Select
              label="Status"
              name="status"
              value={editFormData.status}
              onChange={(e) =>
                setEditFormData({ ...editFormData, status: e.target.value })
              }
              options={[
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              required
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTrip(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Update
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
