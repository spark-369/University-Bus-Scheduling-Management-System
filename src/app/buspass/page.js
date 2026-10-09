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
import { busPassService } from "@/services/busPassService";
import { userService } from "@/services/userService";
import {
  FiCreditCard,
  FiPlus,
  FiSearch,
  FiCheck,
  FiX,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import QRVerifier from "@/components/QRVerifier";

export default function BusPassPage() {
  const { isPassenger, isDriver, isAdmin } = useAuth();
  const pathname = usePathname();
  const [busPasses, setBusPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [formData, setFormData] = useState({
    passengerId: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [passNumber, setPassNumber] = useState("");
  const [editingPass, setEditingPass] = useState(null);
  const [editFormData, setEditFormData] = useState({
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [deletingPass, setDeletingPass] = useState(null);

  useEffect(() => {
    fetchBusPasses();
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [pathname]);

  const fetchPassengers = async () => {
    try {
      const data = await userService.getAll({ role: "PASSENGER" });
      // Map to passenger format with user info
      const passengerList = (data.users || []).map((u) => ({
        id: u.id,
        passengerId: u.passengerId || u.id,
        name: u.name,
      }));
      setPassengers(passengerList);
    } catch (error) {
      console.error("Error fetching passengers:", error);
    }
  };

  const handleCreateClick = async () => {
    await fetchPassengers();
    setShowCreateModal(true);
  };

  const fetchBusPasses = async () => {
    try {
      const data = await busPassService.getAll();
      setBusPasses(data.busPasses || []);
    } catch (error) {
      console.error("Error fetching bus passes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await busPassService.create(formData);
      await fetchBusPasses();
      setShowCreateModal(false);
      setFormData({ passengerId: "", startDate: "", endDate: "" });
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to create bus pass. Please check the dates and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const isActive = (pass) => {
    return pass.isActive && !isExpired(pass.endDate);
  };

  // QR Scanner functions
  const verifyQRCode = async (qrCode) => {
    try {
      const result = await busPassService.verify({ qrCode });
      setVerificationResult({ success: true, data: result });
    } catch (error) {
      setVerificationResult({
        success: false,
        error: error.response?.data?.error || "Invalid or expired bus pass",
      });
    }
  };

  const verifyByPassNumber = async (e) => {
    e.preventDefault();
    try {
      const result = await busPassService.verify({ passNumber });
      setVerificationResult({ success: true, data: result });
    } catch (error) {
      setVerificationResult({
        success: false,
        error: error.response?.data?.error || "Invalid or expired bus pass",
      });
    }
  };

  const handleOpenVerify = () => {
    setShowVerifyModal(true);
    setVerificationResult(null);
  };

  const handleCloseVerify = () => {
    setShowVerifyModal(false);
    setVerificationResult(null);
  };

  const handleEditClick = (pass) => {
    setEditingPass(pass);
    setEditFormData({
      startDate: pass.startDate.split("T")[0],
      endDate: pass.endDate.split("T")[0],
      isActive: pass.isActive,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await busPassService.update(editingPass.id, editFormData);
      await fetchBusPasses();
      setEditingPass(null);
    } catch (error) {
      console.error("Error updating bus pass:", error);
      alert(error.response?.data?.error || "Failed to update bus pass");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (pass) => {
    setDeletingPass(pass);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await busPassService.delete(deletingPass.id);
      await fetchBusPasses();
      setDeletingPass(null);
    } catch (error) {
      console.error("Error deleting bus pass:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1
            className={
              isAdmin
                ? "text-2xl font-bold text-slate-100"
                : "text-3xl font-bold ml-[1vw] text-slate-100"
            }
          >
            {isAdmin && "Bus Passes"}
            {isPassenger && "My Bus Pass"}
          </h1>
          <div className="flex space-x-2">
            {isAdmin && (
              <Button onClick={handleCreateClick}>
                <FiPlus className="mr-2" />
                Create Bus Pass
              </Button>
            )}
          </div>
        </div>

        {/* Non-Driver View - Bus Passes grid or Loading */}
        {isDriver ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-slate-900 rounded-2xl shadow-xl p-12 max-w-md w-full text-center ring-1 ring-slate-800">
              <div className="w-24 h-24 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Bus Pass Verification
              </h2>
              <p className="text-slate-400 mb-8">
                Verify passenger bus passes by entering the pass number or
                scanning QR code
              </p>
              <Button
                onClick={handleOpenVerify}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 text-lg font-semibold"
              >
                <FiSearch className="mr-2" />
                Start Verification
              </Button>

              {showVerifyModal && (
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <form onSubmit={verifyByPassNumber} className="space-y-4">
                    <Input
                      label="Enter Pass Number"
                      value={passNumber}
                      onChange={(e) => setPassNumber(e.target.value)}
                      placeholder="e.g., BP-1234567890-ABCDEFGHI"
                      className="text-center"
                    />
                    <Button type="submit" className="w-full">
                      Verify
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : busPasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {busPasses.map((pass) => (
              <Card key={pass.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FiCreditCard className="w-6 h-6 text-blue-400 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">
                        {pass.passNumber}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {pass.passenger?.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isActive(pass) ? "success" : "default"}>
                    {isActive(pass) ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Passenger ID:</span>
                    <span className="font-medium">
                      {pass.passenger?.passengerId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date:</span>
                    <span className="font-medium">
                      {formatDate(pass.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End Date:</span>
                    <span className="font-medium">
                      {formatDate(pass.endDate)}
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                {pass.qrCode && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-400 text-center mb-2">
                      QR Code
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-white p-2 rounded-lg">
                        <img
                          src={pass.qrCode}
                          alt="Bus Pass QR Code"
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex justify-center mt-4 pt-4 border-t border-slate-800 flex space-x-2">
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(pass)}
                        className="flex-1"
                      >
                        <FiEdit2 className="mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(pass)}
                        className="text-red-400 border-red-500/50 hover:bg-red-500/10"
                      >
                        <FiTrash2 className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCreditCard className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No bus passes found</p>
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Bus Pass"
          size="md"
        >
          <form onSubmit={handleCreate}>
            <Select
              label="Passenger"
              name="passengerId"
              value={formData.passengerId}
              onChange={(e) =>
                setFormData({ ...formData, passengerId: e.target.value })
              }
              options={passengers.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.passengerId})`,
              }))}
              required
            />
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
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

        {/* Verify QR Modal */}
        <Modal
          isOpen={showVerifyModal}
          onClose={handleCloseVerify}
          title="Verify Bus Pass"
          size="md"
        >
          {!verificationResult ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Enter the pass number manually or use the QR scanner
              </p>
              <form onSubmit={verifyByPassNumber} className="space-y-4">
                <Input
                  label="Pass Number"
                  value={passNumber}
                  onChange={(e) => setPassNumber(e.target.value)}
                  placeholder="e.g., BP-1234567890-ABCDEFGHI"
                />
                <Button type="submit" className="w-full">
                  Verify
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-400">
                    Or scan QR
                  </span>
                </div>
              </div>
              <QRVerifier
                onVerify={verifyQRCode}
                verifyResult={null}
                onReset={() => setVerificationResult(null)}
              />
            </div>
          ) : verificationResult.success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FiCheck className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-400">
                Valid Bus Pass
              </h3>
              <div className="bg-emerald-500/10 p-4 rounded-lg space-y-2 text-left ring-1 ring-emerald-500/30">
                <p>
                  <span className="font-semibold">Pass Number:</span>{" "}
                  {verificationResult.data.busPass?.passNumber}
                </p>
                <p>
                  <span className="font-semibold">Passenger Name:</span>{" "}
                  {verificationResult.data.busPass?.passengerName}
                </p>
                <p>
                  <span className="font-semibold">Passenger ID:</span>{" "}
                  {verificationResult.data.busPass?.passengerId}
                </p>
                <p>
                  <span className="font-semibold">Valid Until:</span>{" "}
                  {new Date(
                    verificationResult.data.busPass?.endDate,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {verificationResult.data.attendance && (
                  <p className="pt-2 border-t border-emerald-500/30 text-emerald-300 font-medium">
                    {verificationResult.data.attendance.marked > 0
                      ? `Attendance recorded for ${verificationResult.data.attendance.marked} booking(s) today.`
                      : "No pending booking for today to mark as attended."}
                  </p>
                )}
              </div>
              <Button
                onClick={() => {
                  setVerificationResult(null);
                  setPassNumber("");
                }}
                className="w-full"
              >
                Verify Another
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FiX className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400">
                Invalid Bus Pass
              </h3>
              <p className="text-slate-400">{verificationResult.error}</p>
              <Button
                onClick={() => {
                  setVerificationResult(null);
                  setPassNumber("");
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </Modal>

        {/* Edit Bus Pass Modal */}
        <Modal
          isOpen={!!editingPass}
          onClose={() => setEditingPass(null)}
          title="Edit Bus Pass"
          size="md"
        >
          <form onSubmit={handleEdit}>
            <Input
              label="Pass Number"
              value={editingPass?.passNumber || ""}
              disabled
            />
            <Input
              label="Passenger"
              value={editingPass?.passenger?.name || ""}
              disabled
            />
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={editFormData.startDate}
              onChange={(e) =>
                setEditFormData({ ...editFormData, startDate: e.target.value })
              }
              required
              className="mt-4"
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={editFormData.endDate}
              onChange={(e) =>
                setEditFormData({ ...editFormData, endDate: e.target.value })
              }
              required
              className="mt-4"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={editFormData.isActive ? "true" : "false"}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    isActive: e.target.value === "true",
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="true" className="bg-slate-900">Active</option>
                <option value="false" className="bg-slate-900">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPass(null)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingPass}
          onClose={() => setDeletingPass(null)}
          title="Delete Bus Pass"
          size="sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Delete Bus Pass?
            </h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete the bus pass for{" "}
              <span className="font-semibold">
                {deletingPass?.passenger?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeletingPass(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                loading={submitting}
                className="flex-1 bg-red-600 hover:bg-red-500"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
