"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl animate-slide-up">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Campus Bus Scheduling
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Manage buses, routes, schedules, bookings and digital passes — all
            in one place.
          </p>
        </div>

        {user ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-slate-900 p-6 text-center shadow-2xl ring-1 ring-slate-800">
            <p className="mb-4 text-slate-300">Welcome back, {user.name}!</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/login"
              className="group rounded-2xl bg-slate-900 p-6 shadow-xl ring-1 ring-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:ring-slate-700"
            >
              <h2 className="mb-1 text-lg font-semibold text-slate-100">
                Login
              </h2>
              <p className="text-sm text-slate-400">Sign in to your account</p>
            </Link>
            <Link
              href="/register"
              className="group rounded-2xl bg-slate-900 p-6 shadow-xl ring-1 ring-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:ring-slate-700"
            >
              <h2 className="mb-1 text-lg font-semibold text-slate-100">
                Register
              </h2>
              <p className="text-sm text-slate-400">Create a new account</p>
            </Link>
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-white">Features</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Route Management", desc: "Create and manage bus routes with multiple stops" },
              { title: "Live Tracking", desc: "Interactive map with stop markers and distances" },
              { title: "Booking System", desc: "Reserve seats and manage bookings" },
              { title: "Digital Passes", desc: "QR code-based digital bus passes" },
              { title: "Notifications", desc: "Alerts and schedule updates" },
              { title: "Reports", desc: "Analytics and performance reports" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <h3 className="mb-1 text-sm font-semibold text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
