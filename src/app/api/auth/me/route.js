import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns the currently authenticated user for the provided bearer token.
// Used by the client to re-validate a stored session on load (the token may
// have expired or the account may have been deactivated).
export async function GET(req) {
  const authResult = await authMiddleware(req, ['ADMIN', 'DRIVER', 'PASSENGER']);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({ user: authResult.user });
}
