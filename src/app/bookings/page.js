"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { stopService } from "@/services/stopService";
import { tripService } from "@/services/tripService";
import { busService } from "@/services/busService";
import { userService } from "@/services/userService";
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Modal,
  Input,
  Select,
} from "@/components/ui";
import {
  FiCalendar,
  FiX,
  FiCheck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFilter,
} from "react-icons/fi";

export default function BookingsPage() {
  const { isAdmin, isPassenger } = useAuth();
  const pathname = usePathname();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [formData, setFormData] = useState({
    tripId: "",
    stopId: "",
    bookingDate: "",
  });
  const [editFormData, setEditFormData] = useState({
    stopId: "",
    bookingDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    bookingDate: "",
    busId: "",
    userId: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [buses, setBuses] = useState([]);
  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    fetchBookings();
    // Re-runs whenever this route becomes active again (sidebar tab switch),
    // so the list is refreshed without a full page reload.
  }, [pathname]);

  const fetchRoutesAndStops = async () => {
    try {
      const [tripsData, stopsData] = await Promise.all([
        tripService.getAll(),
        stopService.getAll(),
      ]);
      setTrips(tripsData.trips || []);
      setStops(stopsData.stops || []);
    } catch (error) {
      console.error("Error fetching trips/stops:", error);
    }
  };

  const handleCreateClick = async () => {
    await fetchRoutesAndStops();
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await bookingService.create(formData);
      await fetchBookings();
      setShowCreateModal(false);
      setFormData({ tripId: "", stopId: "", bookingDate: "" });
    } catch (error) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create booking";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBookings = async (filterParams = {}) => {
    try {
      const data = await bookingService.getAll(filterParams);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.cancel(id);
        await fetchBookings();
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    }
  };

  const handleEditClick = async (booking) => {
    if (stops.length === 0) {
      await fetchRoutesAndStops();
    }
    setEditingBooking(booking);
    setEditFormData({
      stopId: booking.stopId || "",
      bookingDate: booking.bookingDate
        ? new Date(booking.bookingDate).toISOString().split("T")[0]
        : "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSubmitting(true);
    try {
      await bookingService.update(editingBooking.id, editFormData);
      await fetchBookings();
      setShowEditModal(false);
      setEditingBooking(null);
      setEditFormData({ stopId: "", bookingDate: "" });
    } catch (error) {
      console.error("Error updating booking:", error);
      alert(error.response?.data?.error || "Failed to update booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to delete this booking? This action cannot be undone.",
      )
    ) {
      try {
        await bookingService.delete(id);
        await fetchBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "danger";
      case "COMPLETED":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleApplyFilters = () => {
    const filterParams = {};
    if (filters.status) filterParams.status = filters.status;
    if (filters.bookingDate) filterParams.bookingDate = filters.bookingDate;
    if (filters.busId) filterParams.busId = filters.busId;
    if (filters.userId) filterParams.userId = filters.userId;
    fetchBookings(filterParams);
  };

  // Only offer trips that are not finished and not in the past.
  const selectableTrips = trips.filter((t) => {
    if (t.status === "COMPLETED" || t.status === "CANCELLED") return false;
    const start = new Date(t.startTime);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return start <= endOfToday || start >= new Date();
  });

  const selectedTrip = trips.find((t) => t.id === formData.tripId);

  // Stops must belong to the selected trip's route, matching the server rule.
  const availableStops = selectedTrip
    ? stops.filter((s) => s.routeId === selectedTrip.routeId)
    : stops;

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    const trip = trips.find((t) => t.id === tripId);
    // Reset the stop if it does not belong to the newly selected trip's route.
    const stillValid =
      !formData.stopId ||
      (trip && stops.some((s) => s.id === formData.stopId && s.routeId === trip.routeId));
    setFormData({
      ...formData,
      tripId,
      stopId: stillValid ? formData.stopId : "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">
            {isAdmin ? "All Bookings" : "My Bookings"}
          </h1>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!showFilters) {
                    // Fetch buses and passengers when opening filters
                    try {
                      const [busesData, usersData] = await Promise.all([
                        busService.getAll(),
                        userService.getAll(),
                      ]);
                      setBuses(busesData.buses || []);
                      setPassengers(
                        usersData.users?.filter((u) => u.role === "PASSENGER") ||
                          [],
                      );
                    } catch (error) {
                      console.error("Error fetching filter data:", error);
                    }
                  }
                  setShowFilters(!showFilters);
                }}
              >
                <FiFilter className="mr-2" />
                Filters
              </Button>
            )}
            {(isAdmin || isPassenger) && (
              <Button onClick={handleCreateClick}>
                <FiPlus className="mr-2" />
                Add Booking
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && isAdmin && (
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="flex flex-row items-center justify-center space-x-5">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "CONFIRMED", label: "Confirmed" },
                    { value: "PENDING", label: "Pending" },
                    { value: "CANCELLED", label: "Cancelled" },
                    { value: "COMPLETED", label: "Completed" },
                  ]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1">
                  Booking Date
                </label>
                <Input
                  type="date"
                  value={filters.bookingDate}
                  onChange={(e) =>
                    setFilters({ ...filters, bookingDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1">
                  Bus
                </label>
                <Select
                  value={filters.busId}
                  onChange={(e) =>
                    setFilters({ ...filters, busId: e.target.value })
                  }
                  options={[
                    { value: "", label: "All Buses" },
                    ...buses.map((bus) => ({
                      value: bus.id,
                      label: bus.busNumber,
                    })),
                  ]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1">
                  Passenger
                </label>
                <Select
                  value={filters.userId}
                  onChange={(e) =>
                    setFilters({ ...filters, userId: e.target.value })
                  }
                  options={[
                    { value: "", label: "All Passengers" },
                    ...passengers.map((passenger) => ({
                      value: passenger.id,
                      label: passenger.name,
                    })),
                  ]}
                />
              </div>
              <div>
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <FiCalendar className="w-5 h-5 text-blue-400 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">
                        {formatDate(booking.bookingDate)}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Seat #{booking.seatNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={booking.isUsed ? "success" : "default"}>
                      {booking.isUsed ? "Attended" : "Not Attended"}
                    </Badge>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bus:</span>
                    <span className="font-medium">
                      {booking.bus?.busNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stop:</span>
                    <span className="font-medium">{booking.stop?.name}</span>
                  </div>
                  {isAdmin && booking.user && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passenger:</span>
                      <span className="font-medium">{booking.user.name}</span>
                    </div>
                  )}
                </div>

                {booking.status === "CONFIRMED" && !isAdmin && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancel(booking.id)}
                    >
                      <FiX className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {isAdmin && booking.status === "PENDING" && (
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancel(booking.id)}
                    >
                      <FiX />
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={async () => {
                        await bookingService.confirm(booking.id);
                        await fetchBookings();
                      }}
                    >
                      <FiCheck />
                    </Button>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(booking)}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(booking.id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No bookings found</p>
          </div>
        )}

        {/* Create Booking Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add Booking"
          size="lg"
        >
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Trip"
                name="tripId"
                value={formData.tripId}
                onChange={handleTripChange}
                options={selectableTrips.map((t) => ({
                  value: t.id,
                  label: `${t.route?.name || "Route"} - ${t.bus?.busNumber || "Bus"} - ${new Date(t.startTime).toLocaleTimeString()}`,
                }))}
                placeholder="Choose a trip"
                required
              />
              <Input
                label="Booking Date"
                name="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={(e) =>
                  setFormData({ ...formData, bookingDate: e.target.value })
                }
                required
              />
              <Select
                label="Stop"
                name="stopId"
                value={formData.stopId}
                onChange={(e) =>
                  setFormData({ ...formData, stopId: e.target.value })
                }
                options={availableStops.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                placeholder={
                  selectedTrip
                    ? "Choose a stop on this route"
                    : "Select a trip first"
                }
                disabled={!selectedTrip}
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Booking Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBooking(null);
          }}
          title="Edit Booking"
          size="lg"
        >
          <form onSubmit={handleEdit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Booking Date"
                name="bookingDate"
                type="date"
                value={editFormData.bookingDate}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    bookingDate: e.target.value,
                  })
                }
                required
              />
              <Select
                label="Stop"
                name="stopId"
                value={editFormData.stopId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, stopId: e.target.value })
                }
                options={stops.map((s) => ({ value: s.id, label: s.name }))}
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBooking(null);
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
