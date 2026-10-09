"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Modal,
  Input,
  Select,
} from "@/components/ui";
import { stopService } from "@/services/stopService";
import { routeService } from "@/services/routeService";
import LocationPicker from "@/components/map/LocationPicker";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";

export default function StopsPage() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
    order: "",
    routeId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchStops();
    fetchRoutes();
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [pathname]);

  const fetchStops = async () => {
    try {
      setLoading(true);
      const data = await stopService.getAll();
      setStops(data.stops || []);
    } catch (error) {
      console.error("Error fetching stops:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const data = await routeService.getAll();
      setRoutes(data.routes || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        order: parseInt(formData.order),
      };

      if (editingStop) {
        await stopService.update(editingStop.id, payload);
      } else {
        await stopService.create(payload);
      }
      await fetchStops();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving stop:", error);
      alert(error.response?.data?.error || "Failed to save stop");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (stop) => {
    setEditingStop(stop);
    setFormData({
      name: stop.name || "",
      latitude: stop.latitude?.toString() || "",
      longitude: stop.longitude?.toString() || "",
      address: stop.address || "",
      order: stop.order?.toString() || "",
      routeId: stop.routeId || "",
    });
    setSelectedLocation([stop.latitude, stop.longitude]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this stop?")) {
      try {
        await stopService.delete(id);
        await fetchStops();
      } catch (error) {
        console.error("Error deleting stop:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingStop(null);
    setFormData({
      name: "",
      latitude: "",
      longitude: "",
      address: "",
      order: "",
      routeId: "",
    });
    setSelectedLocation(null);
  };

  const handleLocationChange = (location) => {
    if (location && location[0] && location[1]) {
      setFormData({
        ...formData,
        latitude: location[0].toString(),
        longitude: location[1].toString(),
      });
      setSelectedLocation(location);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Stops</h1>
          {isAdmin && (
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <FiPlus className="mr-2" />
              Add Stop
            </Button>
          )}
        </div>

        {/* Stops list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : stops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stops.map((stop) => (
              <Card key={stop.id} className="p-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center space-x-5 max-w-full">
                    <div className="p-2 bg-blue-500/15 rounded-full">
                      <FiMapPin className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-slate-100">
                        {stop.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {stop.route?.name}
                      </p>
                    </div>
                    <div>
                      <Badge variant={stop.isActive ? "success" : "danger"}>
                        {stop.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-slate-400">
                    <span className="font-medium">Order:</span> {stop.order}
                  </p>
                  {stop.address && (
                    <p className="text-sm text-slate-400">
                      <span className="font-medium">Address:</span>{" "}
                      {stop.address}
                    </p>
                  )}
                  <p className="text-sm text-slate-400">
                    <span className="font-medium">Location:</span>{" "}
                    {stop.latitude}, {stop.longitude}
                  </p>
                </div>

                {isAdmin && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(stop)}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(stop.id)}
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
            <FiMapPin className="mx-auto text-slate-500" size={48} />
            <p className="mt-4 text-slate-400">No stops found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingStop ? "Edit Stop" : "Add Stop"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stop Name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Select
              label="Route"
              name="routeId"
              value={formData.routeId}
              onChange={(e) =>
                setFormData({ ...formData, routeId: e.target.value })
              }
              options={routes.map((route) => ({
                value: route.id,
                label: route.name,
              }))}
              placeholder="Select a route"
              required
            />
            <Input
              label="Order"
              name="order"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
              required
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* Location Picker */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location {isAdmin && "(Click on map to select)"}
            </label>
            <LocationPicker
              value={selectedLocation}
              onChange={handleLocationChange}
              stops={stops}
              height="250px"
            />
            <div className="mt-2 grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                required
              />
              <Input
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                required
              />
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
              {editingStop ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
