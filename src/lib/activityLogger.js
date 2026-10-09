import prisma from '@/lib/prisma';

/**
 * Writes an audit-trail entry. Never throws — audit logging must never break
 * the primary operation.
 *
 * @param {object} params
 * @param {string} params.userId  - ID of the user performing the action
 * @param {string} params.action  - short action code, e.g. "CREATE_BUS"
 * @param {string} [params.details] - human readable description
 * @param {object} [params.req]   - optional NextRequest for ip/user-agent
 */
export const logActivity = async ({ userId, action, details, req }) => {
  try {
    if (!userId || !action) return;

    let ipAddress = null;
    let userAgent = null;

    if (req?.headers) {
      ipAddress =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        null;
      userAgent = req.headers.get('user-agent') || null;
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Swallow — an audit failure must not fail the request.
    console.error('logActivity failed:', error);
  }
};

export default logActivity;
