import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { logActivity } from "@/lib/activityLogger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET all routes
export async function GET(req) {
  const authResult = await authMiddleware(req, ["ADMIN", "DRIVER", "PASSENGER"]);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const where = {};

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const routes = await prisma.route.findMany({
      where,
      include: {
        stops: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            schedules: true,
            trips: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Get routes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 },
    );
  }
}

// CREATE route (Admin only)
export async function POST(req) {
  const authResult = await authMiddleware(req, ["ADMIN"]);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { name, description, estimatedDuration, distance, stops } =
      await req.json();

    if (!name || !estimatedDuration || !distance) {
      return NextResponse.json(
        { error: "Name, estimated duration, and distance are required" },
        { status: 400 },
      );
    }

    // Convert to proper types
    const parsedDuration = parseInt(estimatedDuration, 10);
    const parsedDistance = parseFloat(distance);

    if (isNaN(parsedDuration) || isNaN(parsedDistance)) {
      return NextResponse.json(
        { error: "Estimated duration and distance must be valid numbers" },
        { status: 400 },
      );
    }

    // Create route with stops
    const route = await prisma.route.create({
      data: {
        name,
        description,
        estimatedDuration: parsedDuration,
        distance: parsedDistance,
        stops: stops && Array.isArray(stops) && stops.length > 0
          ? {
              create: stops.map((stop, index) => ({
                name: stop.name,
                latitude: parseFloat(stop.latitude) || 0,
                longitude: parseFloat(stop.longitude) || 0,
                address: stop.address,
                order: stop.order || index + 1,
              })),
            }
          : undefined,
      },
      include: {
        stops: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Notify passengers about new route
    await prisma.notification.create({
      data: {
        userRole: "PASSENGER",
        type: "ROUTE_CREATED",
        title: "New Route Available",
        message: `New route "${name}" has been added. Distance: ${distance}km, Duration: ${estimatedDuration} mins`,
        link: "/routes",
      }
    });

    await logActivity({
      userId: authResult.user.id,
      action: "CREATE_ROUTE",
      details: `Route "${route.name}" created`,
      req,
    });

    return NextResponse.json(
      {
        message: "Route created successfully",
        route,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create route error:", error);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 },
    );
  }
}
