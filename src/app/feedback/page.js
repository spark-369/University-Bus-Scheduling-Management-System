'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, LoadingSpinner, Modal, Input, Select } from '@/components/ui';
import { feedbackService } from '@/services/feedbackService';
import { tripService } from '@/services/tripService';
import { FiStar, FiMessageSquare, FiSend, FiThumbsUp } from 'react-icons/fi';

export default function FeedbackPage() {
  const { user, isAdmin, isPassenger } = useAuth();
  const pathname = usePathname();
  const [feedbackList, setFeedbackList] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    tripId: '',
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchFeedback();
    // Re-runs on each sidebar tab switch so the list stays fresh.
  }, [pathname]);

  const fetchFeedback = async () => {
    try {
      const data = await feedbackService.getAll();
      setFeedbackList(data.feedback || []);
      setAverageRating(data.averageRating || 0);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const data = await tripService.getAll();
      // Filter completed trips for feedback
      const completedTrips = (data.trips || []).filter(
        (trip) => trip.status === 'COMPLETED'
      );
      setTrips(completedTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleCreateClick = async () => {
    await fetchTrips();
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackService.create(formData);
      await fetchFeedback();
      setShowCreateModal(false);
      setFormData({ tripId: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error creating feedback:', error);
      alert(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Feedback</h1>
          {isPassenger && (
            <Button onClick={handleCreateClick}>
              <FiSend className="mr-2" />
              Submit Feedback
            </Button>
          )}
        </div>

        {/* Average Rating Card */}
        {isAdmin && averageRating > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Average Rating</p>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-slate-100">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xl text-slate-500 ml-1">/5</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getRatingStars(Math.round(averageRating))}
              </div>
            </div>
          </Card>
        )}

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : feedbackList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbackList.map((feedback) => (
              <Card key={feedback.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                      <span className="text-blue-400 font-semibold">
                        {feedback.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-slate-100">
                        {isAdmin ? feedback.user?.name : 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getRatingStars(feedback.rating)}
                  </div>
                </div>

                {feedback.trip && (
                  <div className="mb-3 text-sm">
                    <span className="text-slate-400">Trip: </span>
                    <span className="font-medium">{feedback.trip.route?.name}</span>
                  </div>
                )}

                {feedback.comment && (
                  <div className="bg-slate-950/60 p-3 rounded-lg">
                    <div className="flex items-start">
                      <FiMessageSquare className="w-4 h-4 text-slate-500 mt-1 mr-2" />
                      <p className="text-sm text-slate-300">{feedback.comment}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiThumbsUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No feedback yet</p>
          </div>
        )}

        {/* Create Feedback Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Submit Feedback"
          size="md"
        >
          <form onSubmit={handleCreate}>
            <Select
              label="Trip"
              name="tripId"
              value={formData.tripId}
              onChange={(e) =>
                setFormData({ ...formData, tripId: e.target.value })
              }
              options={trips.map((trip) => ({
                value: trip.id,
                label: `${trip.route?.name || 'Trip'} - ${formatDate(trip.startTime)}`,
              }))}
              required
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <FiStar
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Comment (optional)"
                name="comment"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="Share your experience..."
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
                Submit
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
