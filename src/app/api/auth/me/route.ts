import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/upstash";

/**
 * GET /api/auth/me
 * Returns the current user's session info.
 * Reads from the httpOnly `taskstack_user_id` cookie.
 */
export async function GET(req: NextRequest) {
  const userId = req.cookies.get("taskstack_user_id")?.value;
  const googleProfileCookie = req.cookies.get("taskstack_google_profile")?.value;

  if (!userId) {
    return NextResponse.json({ authenticated: false, userId: null }, { status: 401 });
  }

  let googleProfile = null;
  if (googleProfileCookie) {
    try {
      googleProfile = JSON.parse(googleProfileCookie);
    } catch {
      // ignore parse errors
    }
  }

  // For Google users (go_ prefix), also fetch profile from Redis
  if (!googleProfile && userId.startsWith("go_")) {
    try {
      googleProfile = await redis.get(`google_profile:${userId}`);
    } catch {
      // Redis lookup failure is non-fatal
    }
  }

  return NextResponse.json({
    authenticated: true,
    userId,
    isGoogleUser: userId.startsWith("go_"),
    googleProfile,
  });
}

/**
 * POST /api/auth/me/logout
 * Clears all session cookies.
 */
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("taskstack_user_id");
  response.cookies.delete("taskstack_google_profile");
  response.cookies.delete("oauth_state");
  return response;
}
