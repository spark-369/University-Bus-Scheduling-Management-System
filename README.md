# University Bus Scheduling Management System

A full-stack **Next.js 14** web application for managing university/campus bus
transportation operations. It provides separate experiences for **Administrators**,
**Drivers** and **Passengers** with role-based access control, live map tracking,
digital QR bus passes, seat bookings, maintenance scheduling and analytics.

The entire app — frontend UI, REST API and authentication — lives in a single
Next.js App Router project under `my-app/`, backed by a PostgreSQL database via
Prisma.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model (Database Schema)](#data-model-database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [Frontend Documentation](#frontend-documentation)
  - [App Router Pages](#app-router-pages)
  - [Layout & Navigation Components](#layout--navigation-components)
  - [UI Component Library](#ui-component-library)
  - [Map Components](#map-components)
  - [State Management (Contexts)](#state-management-contexts)
  - [API Service Layer](#api-service-layer)
  - [Styling & Design System](#styling--design-system)
  - [Client-Side Authentication Flow](#client-side-authentication-flow)
- [Backend Documentation](#backend-documentation)
  - [API Conventions](#api-conventions)
  - [Authentication & Middleware](#authentication--middleware)
  - [Audit Logging](#audit-logging)
  - [API Endpoint Reference](#api-endpoint-reference)
  - [Backend Business Logic](#backend-business-logic)
- [How Attendance Works](#how-attendance-works)
- [Notifications](#notifications)
- [Security Notes](#security-notes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deploying to Vercel (Free Tier)](#deploying-to-vercel-free-tier)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

The system models the day-to-day operations of a campus shuttle service:

- Admins define **buses**, **routes**, **stops**, **schedules**, **trips**,
  assign **drivers**, schedule **maintenance** and issue **digital bus passes**.
- Drivers start/complete trips and **verify passenger passes** (which records
  attendance automatically).
- Passengers browse routes/schedules, **book seats**, view their **QR bus pass**,
  track their position against stops and submit **feedback**.

All API routes run on the Node.js runtime, are never cached (`force-dynamic`) and
enforce authorization with a shared JWT middleware.

## Key Features

### User Management
- **Role-based Access Control**: Separate roles for Administrators, Drivers, and Passengers
- **Secure Authentication**: JWT-based login with bcrypt-hashed credentials
- **Self-Registration**: Public sign-up limited to Passengers and Drivers (admins are created by an existing admin)
- **Profile Management**: Update name and phone; view account details
- **Session Validation**: Stored sessions are re-validated against the server on load

### Route, Stop & Schedule Management
- **Route Management**: Create, update, deactivate routes and manage their stops
- **Stop Management**: Add/update/remove stops with map-based location picking, coordinates and ordering
- **Schedule Management**: Morning, noon, evening and special schedules with days-of-week and date ranges
- **Automatic Notifications**: Creating routes/stops/schedules/trips notifies the relevant roles

### Live Tracking
- **Live Map Visualization**: Route polylines and stop markers using React-Leaflet + OpenStreetMap
- **Geolocation**: Uses the browser's current position and distance to each stop
- **Auto-refresh**: The tracking view polls for updated stops every 30 seconds

### Booking & Pass Management
- **Seat Reservation**: Seat availability is checked inside a transaction to prevent overbooking
- **Smart Selection**: Trips are filtered to upcoming/active ones and stops are restricted to the selected trip's route
- **Digital Bus Passes**: QR-code based passes with admin create/update/delete
- **QR Verification**: Scan or type a pass number to validate a pass (Admin/Driver)
- **Attendance on Verify**: When a driver verifies a passenger's pass, that passenger's
  active booking for the day is automatically marked as **attended** — no manual
  admin step required
- **Booking Management**: Filter, confirm, cancel, edit and delete bookings by role

### Administrative Control
- **Dashboard**: Statistics plus recent trips, upcoming schedules and maintenance alerts
- **Driver Assignment**: Assign/unassign drivers to buses (one driver per bus)
- **Maintenance Scheduling**: Track routine/repair/breakdown/inspection work and auto-update bus status
- **Emergency Broadcasting**: Send emergency notifications to all roles from the dashboard
- **User Management**: Create, update and deactivate users

### Reporting & Analytics
- **Daily Summary**: Today's trips plus attendance (total / present / absent / rate)
- **Bus Usage**: Trips and bookings per bus
- **Driver Performance**: Trip counts and availability per driver
- **Fuel Consumption**: Estimated fuel usage and cost per bus

### UI/UX
- **Modern Design System**: Consistent slate/blue palette, rounded surfaces, soft shadows
- **Fast Perceived Navigation**: Route-level loading state, page-enter transitions and a sticky blurred header
- **Accessible**: Keyboard-visible focus rings, ARIA labels, `prefers-reduced-motion` support, Escape-to-close modals, click-outside dropdowns
- **Responsive**: Mobile-first layouts with a slide-in sidebar drawer


### Security & Compliance
- **Activity Logs**: Every mutating action is written to an audit trail with actor, IP and user agent
- **Encrypted Authentication**: Secure JWT-based tokens
- **Input Validation**: All write endpoints validate fields, enums, ranges, dates and references


## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (React 18)                        │
│                                                                  │
│  Pages (App Router)  ──►  Contexts (Auth/App)  ──►  Services      │
│        │                      │                      │           │
│        └── DashboardLayout    └── localStorage       └── axios    │
│            (Sidebar/Navbar)       (token+user)          client    │
└───────────────────────────────┬──────────────────────────────────┘
                                │  fetch / axios  (Bearer JWT)
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│              Next.js Route Handlers (Node.js runtime)            │
│                                                                  │
│   /app/api/**/route.js                                           │
│        │                                                         │
│        ├── authMiddleware(req, roles)  ── verifyToken + Prisma   │
│        ├── logActivity({...})          ── audit trail            │
│        └── prisma.<model>.<op>()       ── business logic         │
└───────────────────────────────┬──────────────────────────────────┘
                                │  Prisma Client
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                            │
│   User · Bus · Route · Stop · Schedule · Trip · Booking ·        │
│   BusPass · Maintenance · Notification · Feedback · ActivityLog  │
└──────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Next.js 14** — React framework with the App Router.
- **React 18** — UI library.
- **TailwindCSS v4** — utility-first CSS (via `@tailwindcss/postcss`).
- **React Context** — global state management (`AuthContext`, `AppContext`).
- **React-Leaflet / Leaflet** — map integration with OpenStreetMap tiles.
- **React Icons** — icon library (`react-icons/fi`).
- **Axios** — HTTP client with request/response interceptors.
- **html5-qrcode** — in-browser QR scanning.
- **date-fns** — date utilities.

### Backend
- **Next.js Route Handlers** — server-side API endpoints (Node.js runtime).
- **Prisma** — ORM and type-safe query builder.
- **PostgreSQL** — relational database.
- **jsonwebtoken** — JWT signing/verification.
- **bcryptjs** — password hashing.
- **qrcode** — server-side QR data-URL generation.
- **uuid** — unique QR identifiers.

## Project Structure

```
my-app/
├── prisma/
│   ├── schema.prisma             # Data model (models + enums)
│   └── migrations/               # SQL migration history
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # REST route handlers
│   │   │   ├── auth/             #   login, register, me
│   │   │   ├── users/            #   users + [id]
│   │   │   ├── buses/            #   buses + [id]
│   │   │   ├── routes/           #   routes + [id]
│   │   │   ├── stops/            #   stops + [id]
│   │   │   ├── schedules/        #   schedules + [id]
│   │   │   ├── trips/            #   trips + [id]
│   │   │   ├── bookings/         #   bookings + [id]
│   │   │   ├── buspass/          #   bus passes + QR verify
│   │   │   ├── assignments/      #   driver ↔ bus assignment
│   │   │   ├── maintenance/      #   maintenance records
│   │   │   ├── notifications/    #   notifications
│   │   │   ├── feedback/         #   feedback
│   │   │   ├── activity-logs/    #   audit trail
│   │   │   ├── reports/          #   analytics
│   │   │   └── dashboard/        #   stats + emergency broadcast
│   │   ├── activity-logs/        # Audit log page
│   │   ├── assignments/          # Driver assignment page
│   │   ├── bookings/             # Bookings page
│   │   ├── buses/                # Buses page
│   │   ├── buspass/              # Bus passes / verify page
│   │   ├── dashboard/            # Dashboard + error boundary
│   │   ├── feedback/             # Feedback page
│   │   ├── login/                # Login page
│   │   ├── maintenance/          # Maintenance page
│   │   ├── notifications/        # Notifications page
│   │   ├── profile/              # Profile page
│   │   ├── register/             # Registration page
│   │   ├── reports/              # Reports page
│   │   ├── routes/               # Routes page
│   │   ├── schedules/            # Schedules page
│   │   ├── stops/                # Stops page
│   │   ├── tracking/             # Live tracking page
│   │   ├── trips/                # Trips page
│   │   ├── users/                # Users page
│   │   ├── layout.js             # Root layout (fonts, providers)
│   │   ├── providers.js          # AuthProvider + AppProvider
│   │   ├── page.js               # Landing page
│   │   ├── loading.js            # Route loading state
│   │   ├── error.js              # Global error boundary
│   │   ├── not-found.js          # 404 page
│   │   └── globals.css           # Tailwind import + custom styles
│   ├── components/
│   │   ├── ui/                   # Button, Input, Select, Card, Modal, Badge, Alert, LoadingSpinner (+ barrel)
│   │   ├── layout/               # Sidebar, Navbar, DashboardLayout
│   │   ├── map/                  # MapView, LocationPicker (+ barrel)
│   │   └── QRVerifier.js         # Camera QR scanner component
│   ├── context/                  # AuthContext, AppContext
│   ├── lib/                      # prisma client, activityLogger
│   ├── middleware/               # authMiddleware, optionalAuth
│   ├── services/                 # axios client + per-resource API services
│   └── utils/                    # jwt helpers
├── .env.example
├── next.config.mjs
├── postcss.config.mjs
├── vercel.json
└── package.json
```


## Data Model (Database Schema)

PostgreSQL, defined in `prisma/schema.prisma`. IDs are `cuid()` strings; every
model has `createdAt`/`updatedAt` unless noted.

### Enums

| Enum | Values |
| --- | --- |
| `UserRole` | `ADMIN`, `DRIVER`, `PASSENGER` |
| `BusStatus` | `ACTIVE`, `MAINTENANCE`, `INACTIVE` |
| `ScheduleType` | `MORNING`, `NOON`, `EVENING`, `SPECIAL` |
| `BookingStatus` | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `MaintenanceStatus` | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED` |
| `MaintenanceType` | `ROUTINE`, `REPAIR`, `BREAKDOWN`, `INSPECTION` |
| `NotificationType` | `SCHEDULE_CHANGE`, `DELAY`, `EMERGENCY`, `BUS_ARRIVING`, `BOOKING_CONFIRMATION`, `BUS_PASS_CREATED`, `MAINTENANCE_CREATED`, `ROUTE_CREATED`, `TRIP_STARTED`, `FEEDBACK_RECEIVED`, `STOP_CREATED`, `TRIP_SCHEDULED` |

### Models

| Model | Key fields | Relations |
| --- | --- | --- |
| **User** | `email` (unique), `password`, `name`, `phone?`, `role`, `passengerId?` (unique), `licenseNumber?`, `isActive` | `bookings`, `feedbacks`, `activityLogs`, `busPass?`, `bus?`, `trips` |
| **Bus** | `busNumber` (unique), `plateNumber` (unique), `capacity`, `model?`, `year?`, `status`, `lastMaintenance?`, `fuelType`, `mileage`, `driverId?` (unique) | `driver? (User)`, `schedules`, `bookings`, `trips`, `maintenance` |
| **Route** | `name`, `description?`, `isActive`, `estimatedDuration` (min), `distance` (km) | `stops`, `schedules`, `trips` |
| **Stop** | `name`, `latitude`, `longitude`, `address?`, `order`, `isActive`, `routeId` | `route`, `bookings` |
| **Schedule** | `routeId`, `busId`, `scheduleType`, `departureTime`, `arrivalTime`, `daysOfWeek` (String[]), `isActive`, `isSpecial`, `specialDate?`, `notes?` | `route`, `bus`, `trips` |
| **Trip** | `scheduleId`, `busId`, `routeId`, `driverId`, `startTime`, `endTime?`, `status` (default `SCHEDULED`), `actualStartTime?`, `actualEndTime?` | `schedule`, `bus`, `route`, `driver`, `bookings`, `feedbacks` |
| **Booking** | `userId`, `busId`, `stopId`, `tripId?`, `bookingDate`, `status`, `seatNumber?`, `qrCode?` (unique), `qrCodeData?`, `isUsed` | `user`, `bus`, `stop`, `trip?` |
| **BusPass** | `passengerId` (unique), `passNumber` (unique), `startDate`, `endDate`, `isActive`, `qrCode?` (unique) | `passenger (User)` |
| **Maintenance** | `busId`, `type`, `status`, `description`, `scheduledDate`, `completedDate?`, `cost?`, `notes?` | `bus` |
| **Notification** | `userRole` (String), `link`, `type`, `title`, `message`, `isRead`, `sentAt` | — (targeted by role, not per-user) |
| **Feedback** | `userId`, `tripId?`, `rating` (1–5), `comment?` | `user`, `trip?` |
| **ActivityLog** | `userId`, `action`, `details?`, `ipAddress?`, `userAgent?` | `user` |

> **Design note:** a driver may be assigned to at most one bus (`Bus.driverId` is
> `@unique`), enforcing a 1:1 driver↔bus relationship at the database level.
> `Notification` rows are targeted by `userRole` rather than by individual user,
> so one row serves every user of that role.

## User Roles & Permissions

### Administrator
- Full system access.
- User management (create, update, deactivate).
- Route, stop and schedule creation; bus management.
- Bus & driver assignment (one driver per bus).
- Maintenance scheduling.
- View all reports and analytics, activity logs.
- Send emergency broadcasts.
- Create/update/delete digital bus passes and verify passes.

### Driver
- View assigned routes, schedules and trips.
- Start / complete / cancel trip status (only for trips assigned to them).
- Verify bus passes (QR scan or pass number) — records attendance.
- View role notifications.

### Passenger
- View routes and schedules; live tracking.
- Make and manage their own bookings (create / cancel).
- View their digital bus pass.
- Provide trip feedback.
- Receive notifications.

## Frontend Documentation

### App Router Pages

All pages are **client components** (`'use client'`) that fetch data through the
service layer and render inside `DashboardLayout` (except auth/landing pages).

| Route | File | Description | Roles |
| --- | --- | --- | --- |
| `/` | `app/page.js` | Landing page; shows Login/Register or a "Go to Dashboard" shortcut if a session exists. | Public |
| `/login` | `app/login/page.js` | Email/password sign-in form. On success routes to `/dashboard`. | Public |
| `/register` | `app/register/page.js` | Self-registration (role-limited to Passenger/Driver). | Public |
| `/dashboard` | `app/dashboard/page.js` | Role-aware dashboard: admin stats, recent trips, schedules, maintenance alerts. | All |
| `/buses` | `app/buses/page.js` | Bus list + create/edit/delete (admin). | All (write: admin) |
| `/routes` | `app/routes/page.js` | Route list with stops + create/edit/deactivate. | All (write: admin) |
| `/stops` | `app/stops/page.js` | Stop management with map location picking. | All (write: admin) |
| `/schedules` | `app/schedules/page.js` | Schedule CRUD with day-of-week & type. | All (write: admin) |
| `/trips` | `app/trips/page.js` | Trip list; start/complete/cancel; create from schedule. | All (write: admin/driver) |
| `/tracking` | `app/tracking/page.js` | Live map of stops + user location; polls every 30 s. | All |
| `/bookings` | `app/bookings/page.js` | Booking management; passengers see only their own. | All |
| `/buspass` | `app/buspass/page.js` | Passenger pass view / admin management / driver QR verify. | All |
| `/assignments` | `app/assignments/page.js` | Assign/unassign drivers to buses. | Admin |
| `/maintenance` | `app/maintenance/page.js` | Maintenance records CRUD + complete. | Admin |
| `/notifications` | `app/notifications/page.js` | Role notifications list; mark read/delete. | All |
| `/feedback` | `app/feedback/page.js` | Submit/view feedback (passenger) with ratings. | All |
| `/reports` | `app/reports/page.js` | Analytics: daily summary, bus usage, driver performance, fuel. | Admin |
| `/activity-logs` | `app/activity-logs/page.js` | Paginated audit trail. | Admin |
| `/users` | `app/users/page.js` | User CRUD + deactivate + search. | Admin |
| `/profile` | `app/profile/page.js` | View/update own name & phone; change password. | All |

**Special app files**
- `app/layout.js` — root layout: loads Inter font, sets metadata/viewport, wraps children in `<Providers>`.
- `app/providers.js` — composes `AuthProvider` (outer) and `AppProvider` (inner).
- `app/loading.js` — global route loading spinner.
- `app/error.js` — global error boundary with a reset button.
- `app/not-found.js` — 404 page.
- `app/dashboard/error.js` — dashboard-scoped error boundary.


### Layout & Navigation Components

**`DashboardLayout`** (`components/layout/DashboardLayout.js`)
- Client component wrapping every authenticated page.
- Redirects unauthenticated users to `/login` (in an effect, never during render).
- Shows a full-screen loader while `loading || !isAuthenticated`.
- Renders `<Sidebar>` + `<Navbar>` and a scrollable `<main>`.
- Keys the content wrapper on `pathname` so a `page-enter` animation replays per route.
- Closes the mobile sidebar whenever the route changes.

**`Sidebar`** (`components/layout/Sidebar.js`)
- Fixed slide-in drawer on mobile, static on `lg`.
- Builds role-specific nav link arrays (`adminLinks`, `driverLinks`, `passengerLinks`).
- Highlights the active link; sets `aria-current="page"`.
- Shows the user avatar, name and role at the bottom.

**`Navbar`** (`components/layout/Navbar.js`)
- Sticky, blurred, `z-30` header.
- Hamburger (`onMenuClick`) to open the mobile sidebar.
- Notification bell dropdown: fetches the latest 5 notifications, shows an unread
  badge, supports per-item "mark as read".
- User dropdown: Profile link + Logout; closes on outside click (`mousedown` listener).

### UI Component Library

Re-exported from `components/ui/index.js`. All are client components.

| Component | Props (highlights) | Notes |
| --- | --- | --- |
| `Button` | `variant` (`primary`/`secondary`/`success`/`danger`/`warning`/`outline`/`ghost`), `size` (`sm`/`md`/`lg`), `loading`, `disabled` | Inline spinner while loading; visible focus ring; `active:scale-[0.98]`. |
| `Input` | `label`, `name`, standard input props, password toggle | Forwards attributes to `<input>`. |
| `Select` | `label`, `options`, `name` | Themed native select with chevron icon. |
| `Card` | `title`, `children`, etc. | Rounded surface with soft shadow. |
| `Modal` | `isOpen`, `onClose`, `title` | Escape-to-close, backdrop click, focus handling. |
| `Badge` | `variant`, `children` | Status pills with color variants. |
| `Alert` | `variant` (`info`/`success`/`warning`/`danger`) | Icon + message banner. |
| `LoadingSpinner` | `size`, `className` | Accessible loading indicator. |

### Map Components

Re-exported from `components/map/index.js`. Both are client components that
**dynamically import** `react-leaflet` with `ssr: false` (Leaflet needs `window`).

**`MapView`** (`components/map/MapView.js`)
- Props: `stops`, `center`, `zoom`, `height`, `onMapClick`.
- Watches the user position with `getCurrentPosition` + `watchPosition`.
- Draws a dashed polyline from the user to each stop, a user marker and stop markers.
- Popups show stop name, address, order, route and **Haversine distance** to the user.
- Uses OpenStreetMap tiles; shows a "Loading Map…" placeholder until geolocation resolves.

**`LocationPicker`** (`components/map/LocationPicker.js`)
- Used where admins pick stop coordinates.
- Dynamically loads Leaflet + react-leaflet and patches default marker icons from CDN.
- `useMapEvents` handles clicks; `onChange([lat, lng])` reports the selection.
- Renders the user marker, selected marker and connecting polylines with distances.

**`QRVerifier`** (`components/QRVerifier.js`)
- Props: `onVerify(text)`, `verifyResult`, `onReset()`.
- Uses `html5-qrcode` to scan QR codes (environment-facing camera).
- Guards against double-start (StrictMode), releases the camera on unmount, and maps
  common camera errors (permission denied, not available, already in use) to friendly messages.
- Renders a green success card (pass number, passenger name/ID, valid-until) or a
  red failure card.


### State Management (Contexts)

**`AuthContext`** (`context/AuthContext.js`)
- Holds `user`, `loading`, `error`.
- On mount, **re-validates** the stored session: optimistically restores the cached
  user, then calls `authService.getSession()`; clears the session if invalid.
- Exposes `login`, `register`, `logout` and derived flags:
  `isAuthenticated`, `isAdmin`, `isDriver`, `isPassenger`.
- `useAuth()` throws if used outside the provider.

**`AppContext`** (`context/AppContext.js`)
- Holds shared collections: `notifications`, `unreadCount`, `dashboardStats`,
  `buses`, `routes`, `schedules`, `trips`, plus per-collection `loading` flags.
- Provides `fetchNotifications`, `markNotificationsAsRead`, `fetchDashboardStats`,
  `fetchBuses`, `fetchRoutes`, `fetchSchedules`, `fetchTrips`.
- `useApp()` throws if used outside the provider.

### API Service Layer

`services/client.js` creates a single axios instance:

- `baseURL = process.env.NEXT_PUBLIC_API_URL || ''` (same-origin on Vercel).
- **Request interceptor** attaches `Authorization: Bearer <token>` from `localStorage`.
- **Response interceptor** clears the session and redirects to `/login` on `401`.

Per-resource services export a namespaced object that wraps the endpoints. `authService`
also manages token/user persistence in `localStorage`.

| Service | Methods |
| --- | --- |
| `authService` | `login`, `register`, `logout`, `getCurrentUser`, `getToken`, `getSession` |
| `userService` | `getAll`, `getById`, `create`, `update`, `delete` |
| `busService` | `getAll`, `getById`, `create`, `update`, `delete` |
| `routeService` | `getAll`, `getById`, `create`, `update`, `delete` |
| `stopService` | `getAll`, `getById`, `create`, `update`, `delete` |
| `scheduleService` | `getAll`, `getById`, `create`, `update`, `delete` |
| `tripService` | `getAll`, `getById`, `create`, `update`, `delete` |
| `bookingService` | `getAll`, `getById`, `create`, `cancel`, `confirm`, `update`, `delete` |
| `busPassService` | `getAll`, `create`, `update`, `delete`, `verify` |
| `assignmentService` | `getAll`, `assign`, `unassign` |
| `maintenanceService` | `getAll`, `create`, `update`, `delete` |
| `notificationService` | `getAll`, `create`, `markAsRead`, `delete`, `deleteById`, `deleteAllRead` |
| `feedbackService` | `getAll`, `create` |
| `activityLogService` | `getAll` |
| `dashboardService` | `getStats`, `sendEmergencyBroadcast` |
| `reportService` | `getDashboard`, `getDailySummary`, `getBusUsage`, `getDriverPerformance`, `getFuelConsumption` |

All list methods accept a `params` object forwarded as query string.

### Styling & Design System

- **TailwindCSS v4** imported in `app/globals.css` via `@import "tailwindcss";` and
  compiled through PostCSS (`postcss.config.mjs` with `@tailwindcss/postcss`).
- **Palette**: slate backgrounds (`bg-slate-950`/`900`), blue primary accents,
  emerald/amber/red for status. Rounded surfaces, soft shadows, blurred sticky header.
- **Font**: Inter via `next/font/google`, exposed as `--font-inter`.
- **Custom utilities/animations** in `globals.css`: `page-enter`, `animate-slide-up`,
  `animate-scale-in`.
- **Accessibility**: `focus-visible` rings, ARIA labels (`aria-current`, `aria-label`),
  Escape-to-close modals, click-outside dropdowns, `prefers-reduced-motion` support.

### Client-Side Authentication Flow

1. `AuthProvider` mounts → reads cached `user` from `localStorage` → optimistically sets it.
2. Calls `authService.getSession()` → `GET /api/auth/me` with the bearer token.
3. Valid → fresh user stored; invalid/expired → `logout()` clears storage and `user`.
4. `DashboardLayout` redirects to `/login` if `!isAuthenticated` after loading.
5. Any `401` from the API interceptor also clears storage and redirects to `/login`.


## Backend Documentation

### API Conventions

- Every handler module sets `export const runtime = 'nodejs'` and
  `export const dynamic = 'force-dynamic'`.
- All endpoints require `Authorization: Bearer <token>` **except**
  `POST /api/auth/login` and `POST /api/auth/register`.
- Handlers begin with `const authResult = await authMiddleware(req, [roles])` and
  short-circuit with `if (authResult instanceof NextResponse) return authResult;`.
- Success responses use `NextResponse.json({...})`; errors use
  `NextResponse.json({ error }, { status })` with meaningful status codes
  (`400`, `401`, `403`, `404`, `409`, `500`).
- Writes validate required fields, enums, numeric ranges, dates and foreign-key
  existence before touching the database.

### Authentication & Middleware

`middleware/auth.js` exports:

**`authMiddleware(req, roles = [])`**
1. Reads the `Authorization` header; requires the `Bearer ` prefix (else `401`).
2. Verifies the token via `verifyToken` (else `401`).
3. Loads the user by `decoded.userId` (else `401`); checks `isActive` (else `403`).
4. If `roles` is non-empty and the user's role isn't included → `403`.
5. Returns `{ user }` on success or a `NextResponse` error otherwise.

**`optionalAuth(req)`** — returns `{ user: null }` instead of erroring when the
token is missing/invalid.

`utils/jwt.js`:
- `generateToken(payload)` signs with `JWT_SECRET`, expiry `JWT_EXPIRES_IN` (default `7d`).
- `verifyToken(token)` returns the decoded payload or `null`.
- `decodeToken(token)` — non-verifying decode.
- The secret is resolved lazily: in **production** a missing `JWT_SECRET` throws;
  in development a fallback secret is used so builds succeed.

### Audit Logging

`lib/activityLogger.js` exports `logActivity({ userId, action, details, req })`:
- Extracts `ipAddress` from `x-forwarded-for` / `x-real-ip` and `userAgent` from headers.
- Writes an `ActivityLog` row.
- **Never throws** — a logging failure must not break the primary request.

Actions recorded include: `LOGIN`, `REGISTER`, `CREATE_USER`, `CREATE_BUS`,
`CREATE_ROUTE`, `CREATE_SCHEDULE`, `CREATE_STOP`, `CREATE_BUS_PASS`,
`UPDATE_BUS_PASS`, `DELETE_BUS_PASS`, `VERIFY_BUS_PASS`, `UPDATE_TRIP`,
`DELETE_TRIP`, `UPDATE_BOOKING`, `DELETE_BOOKING`, `ASSIGN_DRIVER`,
`UNASSIGN_DRIVER`, `CREATE_MAINTENANCE`, `UPDATE_MAINTENANCE`,
`DELETE_MAINTENANCE`, `SUBMIT_FEEDBACK`, `EMERGENCY_BROADCAST`.

`lib/prisma.js` exports a singleton `PrismaClient` (stored on `global` in
non-production to survive hot reloads), logging errors only.

### API Endpoint Reference

All paths are relative to `/api`. The **Auth** column lists permitted roles.

#### Authentication
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Validate credentials, return `token` + `user`. |
| POST | `/auth/register` | Public | Register as `PASSENGER`/`DRIVER` only; returns `token` + `user`. |
| GET | `/auth/me` | All | Validate bearer token, return current `user`. |

#### Users
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users` | Admin | List users (filters: `role`, `isActive`). |
| POST | `/users` | Admin | Create user (any role). |
| GET | `/users/[id]` | All | Get user details. |
| PUT | `/users/[id]` | All/Admin | Update user (self or admin). |
| DELETE | `/users/[id]` | Admin | Deactivate user. |

#### Buses
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/buses` | All | List buses (filter `?status=`), incl. driver + schedules. |
| POST | `/buses` | Admin | Create bus (validates capacity, unique number/plate). |
| GET | `/buses/[id]` | All | Get bus details. |
| PUT | `/buses/[id]` | Admin | Update bus. |
| DELETE | `/buses/[id]` | Admin | Delete bus. |

#### Routes
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/routes` | All | List routes incl. stops, counts (filter `?isActive=`). |
| POST | `/routes` | Admin | Create route (optionally with nested stops). |
| GET | `/routes/[id]` | All | Get route details. |
| PUT | `/routes/[id]` | Admin | Update route (cannot replace stops with existing bookings). |
| DELETE | `/routes/[id]` | Admin | Deactivate route. |

#### Stops
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/stops` | All | List stops (optionally `?routeId=`). |
| POST | `/stops` | Admin | Create stop (validates lat/lng range, route exists; auto-order). |
| GET | `/stops/[id]` | All | Get stop details. |
| PUT | `/stops/[id]` | Admin | Update stop. |
| DELETE | `/stops/[id]` | Admin | Delete / deactivate stop. |

#### Schedules
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/schedules` | All | List schedules (filters: `routeId`, `busId`, `scheduleType`, `isActive`, `isSpecial`). |
| POST | `/schedules` | Admin | Create schedule (validates route/bus; supports `HH:mm` times; notifies passengers). |
| GET | `/schedules/[id]` | All | Get schedule details. |
| PUT | `/schedules/[id]` | Admin | Update schedule. |
| DELETE | `/schedules/[id]` | Admin | Deactivate schedule. |

#### Trips
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/trips` | All | List trips (filters: `routeId`, `busId`, `date`). |
| POST | `/trips` | Admin/Driver | Start (create) a trip from a `scheduleId`; notifies passengers. |
| GET | `/trips/[id]` | All | Get trip details. |
| PUT | `/trips/[id]` | Admin/Owning Driver | Update status (`IN_PROGRESS`/`COMPLETED`/`CANCELLED`); terminal states enforced. |
| DELETE | `/trips/[id]` | Admin | Delete trip (not if in progress). |

#### Bookings
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/bookings` | All | List bookings (passengers see only their own; filters available). |
| POST | `/bookings` | Admin/Passenger | Create booking; atomic seat allocation; QR generated. |
| GET | `/bookings/[id]` | All | Get booking (passengers only their own). |
| PUT | `/bookings/[id]` | Admin/Owning Passenger | Update/cancel (passengers can only cancel). |
| DELETE | `/bookings/[id]` | Admin | Delete booking. |

#### Bus Pass
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/buspass` | Admin/Passenger | List passes (passengers see their own; `?passengerId=` for admin). |
| POST | `/buspass` | Admin | Create pass (validates role/date range; one active pass per passenger). |
| PUT | `/buspass` | Admin/Driver | **Verify** a QR/pass number; marks today's bookings attended. |
| PATCH | `/buspass` | Admin | Update pass dates/active flag. |
| DELETE | `/buspass?id=` | Admin | Delete a pass. |

#### Driver Assignments
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/assignments` | Admin | List buses with drivers + pool of unassigned drivers + stats. |
| POST | `/assignments` | Admin | Assign a driver to a bus (both must be free). |
| DELETE | `/assignments?busId=` | Admin | Unassign a driver from a bus. |

#### Maintenance
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/maintenance` | Admin | List records (filters: `busId`, `status`, `type`). |
| POST | `/maintenance` | Admin | Create record; sets bus to `MAINTENANCE` for repair/breakdown. |
| PUT | `/maintenance` | Admin | Update status; on `COMPLETED` reactivates bus & stamps `lastMaintenance`. |
| DELETE | `/maintenance?id=` | Admin | Delete a record. |

#### Notifications
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | All | List notifications for the caller's role (admin sees all) + `unreadCount`. |
| POST | `/notifications` | Admin | Send a notification (by `userRole`, or to all roles). |
| PUT | `/notifications` | All | Mark specific/all-read, or delete by ids (scoped by role). |
| DELETE | `/notifications?id=` | Admin | Delete one, or all read when no `id`. |

#### Feedback
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/feedback` | All | List feedback (admin sees all, others their own) + `averageRating`. |
| POST | `/feedback` | Admin/Passenger | Submit feedback (rating 1–5; one per trip per user). |

#### Activity Logs
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/activity-logs` | Admin | Paginated audit trail (`?page=&limit=`). |

#### Reports
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/reports?type=…` | Admin | `daily-summary` \| `bus-usage` \| `driver-performance` \| `fuel-consumption` (default: overview). |

#### Dashboard
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/dashboard` | Admin | Aggregate stats + recent trips + upcoming schedules + maintenance alerts. |
| POST | `/dashboard` | Admin | Send an emergency broadcast to all roles. |

### Backend Business Logic

**Booking creation (overbooking protection)** — `POST /api/bookings`
- Validates the trip exists and the selected stop belongs to the trip's route.
- Rejects duplicate active bookings for the same user/trip/day (`409`).
- Runs a `Serializable` transaction: counts confirmed bookings for the trip/day,
  throws `NO_SEATS` if capacity is reached, otherwise generates a seat number
  (`1A`–`nD`) and a UUID QR data-URL, then inserts the booking as `CONFIRMED`.
- Notifies drivers of the new booking.

**Pass verification + attendance** — `PUT /api/buspass`
- Finds an active, non-expired pass by `passNumber` (or scanned value).
- `updateMany` marks today's `CONFIRMED`/`COMPLETED` bookings for that passenger
  with `isUsed: false` → `isUsed: true`.
- Returns `valid`, pass summary and `attendance.marked` count. Logs `VERIFY_BUS_PASS`.

**Trip lifecycle** — `PUT /api/trips/[id]`
- Drivers may only update trips assigned to them.
- Statuses limited to `SCHEDULED`/`IN_PROGRESS`/`COMPLETED`/`CANCELLED`.
- `COMPLETED`/`CANCELLED` are terminal; setting `IN_PROGRESS` stamps
  `actualStartTime`, `COMPLETED` stamps `endTime`/`actualEndTime`.

**Maintenance ↔ bus status**
- Creating a `REPAIR`/`BREAKDOWN` record sets the bus to `MAINTENANCE`.
- Completing a record sets the bus back to `ACTIVE` and stamps `lastMaintenance`.

**Notifications** are stored per role. Creation sites include: routes, stops,
schedules, trips, bookings (driver), bus passes, maintenance, feedback (admin),
driver assignment and broadcasts.

## How Attendance Works

Attendance is driven entirely by **driver pass verification** (no manual marking):

1. A passenger books a trip — the booking is created with attendance unmarked.
2. When boarding, the driver opens **Bus Passes → Verify Pass** and scans the
   passenger's QR code (or types the pass number).
3. `PUT /api/buspass` validates the pass and marks the passenger's **active
   booking for the current day** as attended (`Booking.isUsed = true`).
4. The driver sees a confirmation ("Attendance recorded for N booking(s) today.").
5. **Reports → Daily Summary → Attendance Summary** displays Total / Present /
   Absent / Attendance Rate from that data.


## Notifications

- Notifications are **role-targeted** (`Notification.userRole`), not per-user.
- `GET /api/notifications` returns the caller's role's notifications; admins see all.
- Each response includes an `unreadCount`; the Navbar badge and bell dropdown use it.
- `PUT /api/notifications` marks items read or deletes them, always scoped to the
  caller's role (admins may act on any).
- Types are validated against the `NotificationType` enum on `POST`.

## Security Notes

- **Admin provisioning**: public `/api/auth/register` is restricted server-side to
  `PASSENGER` and `DRIVER`. Admin accounts are created by an existing admin through
  `POST /api/users`.
- **Password hashing**: bcrypt with a cost factor of 12.
- **JWT**: `JWT_SECRET` is **required in production** — the app refuses to sign or
  verify tokens without it. Sessions are re-validated on load via `GET /api/auth/me`,
  so expired/deactivated sessions are cleared automatically.
- **Authorization**: every API route enforces role checks through `authMiddleware`;
  passengers can only read/modify their own bookings, feedback and bus passes.
- **Booking integrity**: seat allocation runs inside a `Serializable` transaction to
  prevent overbooking under concurrency.
- **Audit trail**: every mutating action is written to `ActivityLog` with actor, IP
  address and user agent.
- **Input validation**: all write endpoints validate required fields, enums, numeric
  ranges, dates and foreign-key existence before touching the database.




## Getting Started

### Prerequisites
- Node.js 18.18+ (see `engines` in `package.json`)
- PostgreSQL database
- npm (or yarn/pnpm)

> **Important:** the app lives in the `my-app/` subfolder — run all commands from there.

### Installation

1. Install dependencies:
```bash
cd my-app
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push        # or: npx prisma migrate deploy
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Key | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. Use a hosted DB on Vercel; append `?pgbouncer=true&connection_limit=1` for pooled serverless connections. |
| `JWT_SECRET` | Yes (prod) | Long random string (`openssl rand -base64 32`). The app throws in production without it. |
| `JWT_EXPIRES_IN` | No | Token lifetime, e.g. `7d` (default `7d`). |
| `NEXT_PUBLIC_API_URL` | No | Leave **empty** so browser requests use the same origin. Set only for an external API host. |

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint (`next lint`) |
| `npm run vercel-build` | Build with `prisma migrate deploy` (used by `vercel.json`) |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:push` | Push the schema to the database (no migration history) |
| `npm run prisma:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run prisma:studio` | Open Prisma Studio |

## Deploying to Vercel (Free Tier)

This project is preconfigured to run on the Vercel Hobby (free) plan.

### 1. Push to a Git repository
Commit the project (including `prisma/migrations/`) to GitHub/GitLab/Bitbucket.

### 2. Import the project in Vercel
Import the repository and set the **Root Directory** to `my-app` (the app lives in a subfolder). Vercel auto-detects the Next.js framework; `vercel.json` sets the build command to:

```
prisma generate && prisma migrate deploy && next build
```

### 3. Add environment variables
In **Project → Settings → Environment Variables**, add (for Production, Preview and Development):

| Key | Value |
| --- | --- |
| `DATABASE_URL` | A **hosted** Postgres URL (Neon, Supabase, Vercel Postgres, etc.). For pooled connections append `?pgbouncer=true&connection_limit=1`. |
| `JWT_SECRET` | A long random string, e.g. output of `openssl rand -base64 32`. **Required** — the app refuses to sign tokens in production without it. |
| `JWT_EXPIRES_IN` | Optional, e.g. `7d`. |
| `NEXT_PUBLIC_API_URL` | Leave **empty** so the browser calls the same origin. |

> ⚠️ The default `DATABASE_URL` in `.env` points at `localhost` and will **not** work on Vercel. Always use a hosted database in production.

### 4. Deploy
Vercel runs `prisma generate`, applies pending migrations (`prisma migrate deploy`) and builds. The build is statically lint-checked with `.eslintrc.json` (non-interactive).

### Free-tier notes
- All API routes use `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`, so no response is cached and the Node runtime (required by Prisma/bcrypt/jsonwebtoken) is always used.
- Function `maxDuration` is capped at 10s in `vercel.json` to stay within Hobby limits.
- Prisma client generation happens automatically via the `postinstall` script and the build command.
- `socket.io` server usage is not supported on serverless functions and has been removed; real-time behaviour is achieved via polling (`/tracking` auto-refreshes every 30s).

## Troubleshooting

- **`JWT_SECRET is not set` in production** — add `JWT_SECRET` to your host's
  environment variables.
- **Styles are missing / the page looks unstyled** — Tailwind v4 is compiled
  through PostCSS via `postcss.config.mjs`. Ensure that file exists and that
  `@tailwindcss/postcss` is installed; the stylesheet is imported in
  `src/app/globals.css` with `@import "tailwindcss";`.
- **`Query engine not found` / Prisma errors on deploy** — ensure the build runs
  `prisma generate` (the `postinstall` and `build` scripts handle this) and that
  `binaryTargets` includes your host's target (already set to
  `["native", "rhel-openssl-3.0.x"]` for Vercel).
- **Requests fail with 401 after a while** — the JWT expired; the client clears
  the stale session and redirects to `/login`.
- **`Cannot modify stops that have existing bookings`** — a route's stops cannot
  be replaced once bookings reference them; deactivate the route instead.
- **`No seats available for this trip`** — capacity was reached; seat allocation
  is transactional, so concurrent bookings cannot overbook.
- **QR scanner shows "Camera is not available"** — the browser blocks camera
  access on insecure origins. Use `https://` (e.g. on Vercel) or `http://localhost`;
  plain `http://` on a LAN IP will not work. The scanner also needs permission
  granted and no other app holding the camera.

## License

MIT License
