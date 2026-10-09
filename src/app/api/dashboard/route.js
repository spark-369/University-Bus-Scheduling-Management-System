import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET dashboard data
export async function GET(req) {
  const authResult = await authMiddleware(req, ['ADMIN']);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Get various counts and statistics
    const [
      totalUsers,
      totalBuses,
      totalRoutes,
      totalSchedules,
      totalTrips,
      activeBuses,
      availableDrivers,
      todayTrips,
      pendingBookings,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.bus.count(),
      prisma.route.count(),
      prisma.schedule.count(),
      prisma.trip.count(),
      prisma.bus.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'DRIVER', isActive: true } }),
      prisma.trip.count({
        where: {
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    // Get recent trips
    const recentTrips = await prisma.trip.findMany({
      take: 5,
      orderBy: { startTime: 'desc' },
      include: {
        route: { select: { name: true } },
        bus: { select: { busNumber: true } },
        driver: { select: { id: true, name: true, phone: true } },
      },
    });

    // Get upcoming schedules for today
    const today = new Date();
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][today.getDay()];
    
    const upcomingSchedules = await prisma.schedule.findMany({
      where: {
        isActive: true,
        daysOfWeek: { has: dayOfWeek },
        departureTime: { gte: today },
      },
      take: 5,
      orderBy: { departureTime: 'asc' },
      include: {
        route: { select: { name: true } },
        bus: { select: { busNumber: true } },
      },
    });

    // Get maintenance alerts
    const maintenanceAlerts = await prisma.maintenance.findMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      take: 5,
      orderBy: { scheduledDate: 'asc' },
      include: {
        bus: { select: { busNumber: true, plateNumber: true } },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBuses,
        totalRoutes,
        totalSchedules,
        totalTrips,
        activeBuses,
        availableDrivers,
        todayTrips,
        pendingBookings,
        unreadNotifications,
      },
      recentTrips,
      upcomingSchedules,
      maintenanceAlerts,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Emergency broadcast (Admin only)
export async function POST(req) {
  const authResult = await authMiddleware(req, ['ADMIN']);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { message, routeId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get all active users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // Create emergency notifications for all users
    const roles = ['ADMIN', 'DRIVER', 'PASSENGER'];
    for (const role of roles) {
      await prisma.notification.create({
        data: {
          userRole: role,
          type: 'EMERGENCY',
          title: 'Emergency Broadcast',
          message,
          link: '',
        },
      });
    }

    // Log activity (only when we have a real authenticated user, otherwise the
    // ActivityLog foreign key constraint would fail).
    if (authResult.user?.id) {
      await prisma.activityLog.create({
        data: {
          userId: authResult.user.id,
          action: 'EMERGENCY_BROADCAST',
          details: message,
        },
      });
    }

    return NextResponse.json({
      message: 'Emergency broadcast sent successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Emergency broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to send emergency broadcast' },
      { status: 500 }
    );
  }
}
