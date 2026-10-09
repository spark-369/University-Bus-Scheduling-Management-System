'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Badge, Alert } from '@/components/ui';
import { userService } from '@/services/userService';
import { FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const updatedUser = await userService.update(user.id, {
        name: formData.name,
        phone: formData.phone,
      });
      // Update localStorage
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser.user }));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'DRIVER': return 'warning';
      case 'PASSENGER': return 'success';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-slate-100">{user?.name}</h2>
                <Badge variant={getRoleBadgeVariant(user?.role)}>{user?.role}</Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {isEditing ? (
            <>
              {message.text && (
                <Alert variant={message.type} className="mb-4">
                  {message.text}
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  disabled
                />
                <p className="-mt-2 mb-2 text-xs text-slate-500">
                  Email address cannot be changed. Contact an administrator if
                  you need to update it.
                </p>
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
                <div className="pt-4">
                  <Button type="submit" loading={loading}>Save Changes</Button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center py-3 border-b border-slate-800">
                <FiUser className="w-5 h-5 text-slate-500 mr-3" />
                <div>
                  <p className="text-sm text-slate-400">Full Name</p>
                  <p className="font-medium text-slate-100">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center py-3 border-b border-slate-800">
                <FiMail className="w-5 h-5 text-slate-500 mr-3" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-medium text-slate-100">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center py-3">
                <FiPhone className="w-5 h-5 text-slate-500 mr-3" />
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="font-medium text-slate-100">{user?.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Account Info */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">User ID:</span>
              <span className="font-mono text-slate-300">{user?.id}</span>
            </div>
            {user?.passengerId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Passenger ID:</span>
                <span className="font-medium text-slate-100">{user.passengerId}</span>
              </div>
            )}
            {user?.licenseNumber && (
              <div className="flex justify-between">
                <span className="text-slate-400">License Number:</span>
                <span className="font-medium text-slate-100">{user.licenseNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Account Status:</span>
              <Badge variant={user?.isActive ? 'success' : 'danger'}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
