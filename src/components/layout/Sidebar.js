"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiTruck,
  FiMap,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiUsers,
  FiCalendar,
  FiBell,
  FiSettings,
  FiActivity,
  FiCreditCard,
  FiFileText,
  FiTool,
  FiMessageSquare,
  FiUserCheck,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, isAdmin, isDriver, isPassenger } = useAuth();

  const adminLinks = [
    { href: "/dashboard", icon: FiHome, label: "Admin Dashboard" },
    { href: "/buses", icon: FiTruck, label: "Buses" },
    { href: "/routes", icon: FiMap, label: "Routes" },
    { href: "/schedules", icon: FiClock, label: "Schedules" },
    { href: "/stops", icon: FiMapPin, label: "Stops" },
    { href: "/trips", icon: FiNavigation, label: "Trips" },
    { href: "/tracking", icon: FiMap, label: "Tracking" },
    { href: "/bookings", icon: FiCalendar, label: "Bookings" },
    { href: "/users", icon: FiUsers, label: "Users" },
    { href: "/assignments", icon: FiUserCheck, label: "Assignments" },
    { href: "/maintenance", icon: FiTool, label: "Maintenance" },
    { href: "/notifications", icon: FiBell, label: "Notifications" },
    { href: "/reports", icon: FiFileText, label: "Reports" },
    { href: "/buspass", icon: FiCreditCard, label: "Bus Passes" },
    { href: "/feedback", icon: FiMessageSquare, label: "Feedback" },
    { href: "/activity-logs", icon: FiActivity, label: "Activity Logs" },
  ];

  const driverLinks = [
    { href: "/dashboard", icon: FiHome, label: "Driver Dashboard" },
    { href: "/trips", icon: FiNavigation, label: "Driver Trips" },
    { href: "/tracking", icon: FiMap, label: "Tracking" },
    { href: "/routes", icon: FiMap, label: "Bus Routes" },
    { href: "/schedules", icon: FiClock, label: "Bus Schedules" },
    { href: "/bookings", icon: FiCalendar, label: "Passenger Bookings" },
    { href: "/buspass", icon: FiCreditCard, label: "Verify Pass" },
    { href: "/notifications", icon: FiBell, label: "Notifications" },
  ];

  const passengerLinks = [
    { href: "/dashboard", icon: FiHome, label: "Passenger Dashboard" },
    { href: "/trips", icon: FiNavigation, label: "Bus Trips" },
    { href: "/tracking", icon: FiMap, label: "Tracking" },
    { href: "/routes", icon: FiMap, label: "Bus Routes" },
    { href: "/schedules", icon: FiClock, label: "Bus Schedules" },
    { href: "/bookings", icon: FiCalendar, label: "My Bookings" },
    { href: "/buspass", icon: FiCreditCard, label: "My Bus Pass" },
    { href: "/feedback", icon: FiMessageSquare, label: "Feedback" },
    { href: "/notifications", icon: FiBell, label: "Notifications" },
  ];

  const links = isAdmin ? adminLinks : isDriver ? driverLinks : passengerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold">
                B
              </span>
              <span className="leading-tight">
                Bus<span className="text-blue-400">MS</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <FiSettings size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-colors duration-150
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }
                      `}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-blue-600">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
