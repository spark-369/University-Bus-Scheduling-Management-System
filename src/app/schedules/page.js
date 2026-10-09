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
  Input,
  Select,
} from "@/components/ui";
import { scheduleService } from "@/services/scheduleService";
import { FiPlus, FiClock, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function SchedulesPage() {
  const { isAdmin } = useAuth();
  const {
    schedules,
    fetchSchedules,
    routes,
    buses,
    fetchRoutes,
    fetchBuses,
    loading,
  } = useApp();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [formData, setFormData] = useState({
    routeId: "",
    busId: "",
    scheduleType: "MORNING",
    departureTime: "",
    arrivalTime: "",
    daysOfWeek: [],
    isSpecial: false,
    specialDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSchedules();
    fetchRoutes();
    fetchBuses();
  }, [fetchSchedules, fetchRoutes, fetchBuses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDayToggle = (day) => {
    const days = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter((d) => d !== day)
      : [...formData.daysOfWeek, day];
    setFormData({ ...formData, daysOfWeek: days });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode && editingScheduleId) {
        await scheduleService.update(editingScheduleId, formData);
      } else {
        await scheduleService.create(formData);
      }
      await fetchSchedules();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert(error.response?.data?.error || "Failed to save schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      routeId: "",
      busId: "",
      scheduleType: "MORNING",
      departureTime: "",
      arrivalTime: "",
      daysOfWeek: [],
      isSpecial: false,
      specialDate: "",
      notes: "",
    });
    setIsEditMode(false);
    setEditingScheduleId(null);
  };

  const handleEdit = (schedule) => {
    setFormData({
      routeId: schedule.routeId,
      busId: schedule.busId,
      scheduleType: schedule.scheduleType,
      departureTime: schedule.departureTime ? new Date(schedule.departureTime).toTimeString().slice(0, 5) : "",
      arrivalTime: schedule.arrivalTime ? new Date(schedule.arrivalTime).toTimeString().slice(0, 5) : "",
      daysOfWeek: schedule.daysOfWeek || [],
      isSpecial: schedule.isSpecial || false,
      specialDate: schedule.specialDate ? new Date(schedule.specialDate).toISOString().split('T')[0] : "",
      notes: schedule.notes || "",
    });
    setIsEditMode(true);
    setEditingScheduleId(schedule.id);
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }
    try {
      await scheduleService.delete(scheduleId);
      await fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const scheduleTypeOptions = [
    { value: "MORNING", label: "Morning" },
    { value: "NOON", label: "Noon" },
    { value: "EVENING", label: "Evening" },
    { value: "SPECIAL", label: "Special" },
  ];

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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
          <h1 className="text-2xl font-bold text-slate-100">Schedules</h1>
          {isAdmin && (
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <FiPlus className="mr-2" />
              Add Schedule
            </Button>
          )}
        </div>

        {/* Schedules list */}
        {loading.schedules ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : schedules.length > 0 ? (
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Arrival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-800/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">
                        {schedule.route?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-100">
                        {schedule.bus?.busNumber}
                      </div>
                      <div className="text-sm text-slate-400">
                        {schedule.bus?.plateNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info">{schedule.scheduleType}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                      {formatTime(schedule.departureTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                      {formatTime(schedule.arrivalTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {schedule.daysOfWeek?.map((day) => (
                          <Badge key={day} variant="default" size="sm">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={schedule.isActive ? "success" : "default"}
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
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
            <p className="text-slate-400">No schedules found</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={isEditMode ? "Edit Schedule" : "Add Schedule"}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Route"
                name="routeId"
                value={formData.routeId}
                onChange={handleChange}
                options={routes.map((r) => ({ value: r.id, label: r.name }))}
                required
              />
              <Select
                label="Bus"
                name="busId"
                value={formData.busId}
                onChange={handleChange}
                options={buses.map((b) => ({
                  value: b.id,
                  label: b.busNumber,
                }))}
                required
              />
              <Select
                label="Schedule Type"
                name="scheduleType"
                value={formData.scheduleType}
                onChange={handleChange}
                options={scheduleTypeOptions}
              />
              <Input
                label="Departure Time"
                name="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
              <Input
                label="Arrival Time"
                name="arrivalTime"
                type="time"
                value={formData.arrivalTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Days of Week <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${
                        formData.daysOfWeek.includes(day)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
