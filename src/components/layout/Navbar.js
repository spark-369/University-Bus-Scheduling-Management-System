'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMenu, FiBell, FiLogOut, FiUser, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { notificationService } from '@/services/notificationService';

const Navbar = ({ onMenuClick }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount, fetchNotifications } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownNotifications, setDropdownNotifications] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (showNotifications) {
      fetchDropdownNotifications();
    }
  }, [showNotifications]);

  // Close the dropdowns when clicking outside of them.
  useEffect(() => {
    if (!showUserMenu && !showNotifications) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const fetchDropdownNotifications = async () => {
    setLoadingDropdown(true);
    try {
      const data = await notificationService.getAll();
      setDropdownNotifications(data.notifications?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dropdown notifications:', error);
    } finally {
      setLoadingDropdown(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead([notificationId]);
      fetchDropdownNotifications();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION': return 'bg-emerald-500/15 text-emerald-300';
      case 'BUS_ARRIVING': return 'bg-blue-500/15 text-blue-300';
      case 'EMERGENCY': return 'bg-red-500/15 text-red-300';
      case 'SCHEDULE_CHANGE': return 'bg-amber-500/15 text-amber-300';
      case 'DELAY': return 'bg-amber-500/15 text-amber-300';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-2 rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>
        </div>

        {/* Right side */}
        <div ref={containerRef} className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Notifications"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="animate-scale-in absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                  <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
                  <Link
                    href="/notifications"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loadingDropdown ? (
                    <div className="p-4 text-center text-sm text-slate-400">Loading...</div>
                  ) : dropdownNotifications.length > 0 ? (
                    dropdownNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`cursor-pointer border-b border-slate-800 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-800 ${
                          !notification.isRead ? 'bg-blue-500/10' : ''
                        }`}
                        onClick={() => {
                          if (notification.link) {
                            window.location.href = notification.link;
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`truncate text-sm ${!notification.isRead ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                                {notification.title}
                              </p>
                              <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${getTypeColor(notification.type)}`}>
                                {notification.type.replace(/_/g, ' ').substring(0, 10)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {formatTime(notification.sentAt)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification.id)}
                                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-blue-400"
                                title="Mark as read"
                              >
                                <FiCheck size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-400">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 text-slate-300 transition-colors hover:bg-slate-800"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-200 md:block">
                {user?.name}
              </span>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="animate-scale-in absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
