import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET reports and analytics
export async function GET(req) {
  const authResult = await authMiddleware(req, ["ADMIN"]);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // daily, weekly, monthly, driver-performance, bus-usage
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const busId = searchParams.get("busId");
    const driverId = searchParams.get("driverId");

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let report = {};

    switch (type) {
      case "daily-summary":
        // Get today's trip summary
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTrips = await prisma.trip.findMany({
          where: {
            startTime: {
              gte: today,
              lt: tomorrow,
            },
          },
          include: {
            route: true,
            bus: true,
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        });

        // Attendance derived from bookings linked to today's trips.
        const dailyBookings = await prisma.booking.findMany({
          where: {
            tripId: { in: todayTrips.map((t) => t.id) },
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
          select: { id: true, isUsed: true },
        });

        const totalAttendance = dailyBookings.length;
        const presentAttendance = dailyBookings.filter((b) => b.isUsed).length;

        report = {
          date: today.toISOString().split("T")[0],
          totalTrips: todayTrips.length,
          completedTrips: todayTrips.filter((t) => t.status === "COMPLETED")
            .length,
          cancelledTrips: todayTrips.filter((t) => t.status === "CANCELLED")
            .length,
          trips: todayTrips,
          stats: {
            total: totalAttendance,
            present: presentAttendance,
            absent: totalAttendance - presentAttendance,
            attendanceRate:
              totalAttendance > 0
                ? (presentAttendance / totalAttendance) * 100
                : 0,
          },
        };
        break;

      case "fuel-consumption":
        // Fuel usage derived from maintenance costs and completed-trip distance.
        const fuelBuses = await prisma.bus.findMany({
          where: busId ? { id: busId } : undefined,
          include: {
            maintenance: {
              where: {
                type: { in: ["ROUTINE", "REPAIR"] },
                ...(dateFilter.gte || dateFilter.lte
                  ? { scheduledDate: dateFilter }
                  : {}),
              },
              orderBy: { scheduledDate: "desc" },
            },
          },
        });

        // Estimate: DIESEL/PETROL ~ 3.5 km/L, CNG ~ 4.5 km/L, ELECTRIC ~ 5.5 km/kWh
        const KM_PER_UNIT = {
          DIESEL: 3.5,
          PETROL: 4.0,
          CNG: 4.5,
          ELECTRIC: 5.5,
        };

        const fuelRecords = fuelBuses.map((bus) => {
          const kmPerUnit = KM_PER_UNIT[bus.fuelType] || 3.5;
          const amount = Number((bus.mileage / kmPerUnit).toFixed(2));
          const cost = bus.maintenance.reduce(
            (sum, m) => sum + (m.cost || 0),
            0,
          );

          return {
            id: bus.id,
            date: bus.lastMaintenance || bus.updatedAt,
            bus: {
              id: bus.id,
              busNumber: bus.busNumber,
              plateNumber: bus.plateNumber,
            },
            mileage: bus.mileage,
            amount,
            cost: Number(cost.toFixed(2)),
          };
        });

        const totalLiters = fuelRecords.reduce((s, r) => s + r.amount, 0);
        const totalCost = fuelRecords.reduce((s, r) => s + r.cost, 0);

        report = {
          records: fuelRecords,
          summary: {
            totalLiters: Number(totalLiters.toFixed(2)),
            totalCost: Number(totalCost.toFixed(2)),
            averagePricePerLiter:
              totalLiters > 0
                ? Number((totalCost / totalLiters).toFixed(2))
                : 0,
          },
        };
        break;

      case "bus-usage":
        // Bus usage statistics
        const busUsage = await prisma.bus.findMany({
          include: {
            _count: {
              select: {
                trips: {
                  where: dateFilter.gte || dateFilter.lte
                    ? {
                        startTime: dateFilter,
                      }
                    : undefined,
                },
                bookings: {
                  where: dateFilter.gte || dateFilter.lte
                    ? {
                        bookingDate: dateFilter,
                      }
                    : undefined,
                },
              },
            },
          },
        });

        report = {
          buses: busUsage.map((bus) => ({
            id: bus.id,
            busNumber: bus.busNumber,
            plateNumber: bus.plateNumber,
            capacity: bus.capacity,
            status: bus.status,
            totalTrips: bus._count.trips,
            totalBookings: bus._count.bookings,
          })),
        };
        break;

      case "driver-performance":
        // Driver performance evaluation - using User with DRIVER role
        const driverUsers = await prisma.user.findMany({
          where: {
            role: "DRIVER",
            ...(driverId && { id: driverId }),
          },
        });

        // Get trip counts for each driver
        const driversWithTrips = await Promise.all(
          driverUsers.map(async (driver) => {
            const tripCount = await prisma.trip.count({
              where: {
                driverId: driver.id,
                ...(dateFilter.gte || dateFilter.lte
                  ? { startTime: dateFilter }
                  : {}),
              },
            });
            return {
              id: driver.id,
              name: driver.name,
              email: driver.email,
              phone: driver.phone,
              totalTrips: tripCount,
              isAvailable: driver.isActive,
            };
          }),
        );

        report = {
          drivers: driversWithTrips,
        };
        break;

      default:
        // Default: return overview dashboard data
        const [totalUsers, totalBuses, totalRoutes, totalTrips, activeBuses] =
          await Promise.all([
            prisma.user.count(),
            prisma.bus.count(),
            prisma.route.count(),
            prisma.trip.count(),
            prisma.bus.count({
              where: { status: "ACTIVE" },
            }),
          ]);

        report = {
          overview: {
            totalUsers,
            totalBuses,
            totalRoutes,
            totalTrips,
            activeBuses,
          },
        };
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
