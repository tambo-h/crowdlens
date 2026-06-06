import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/upstash";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://taskstack-psi.vercel.app"
    : "http://localhost:3000");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // 1. Handle errors from Google
  if (error) {
    console.error("[OAuth Callback] Google returned error:", error);
    return NextResponse.redirect(`${APP_BASE_URL}/?auth_error=${encodeURIComponent(error)}`);
  }

  // 2. Validate state to prevent CSRF
  const storedState = req.cookies.get("oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("[OAuth Callback] State mismatch", { state, storedState });
    return NextResponse.redirect(`${APP_BASE_URL}/?auth_error=state_mismatch`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_BASE_URL}/?auth_error=no_code`);
  }

  try {
    // 3. Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // 4. Fetch user profile from Google
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);

    // 5. Map Google user → internal userId
    const userId = await getOrCreateGoogleUser(userInfo);

    // 6. Redirect to app with userId set via cookie
    const response = NextResponse.redirect(`${APP_BASE_URL}/?google_auth=success`);

    // Set auth cookies
    response.cookies.set("taskstack_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Store profile in a readable cookie for client-side display (excludes googleId)
    const profilePayload = JSON.stringify({
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    });

    response.cookies.set("taskstack_google_profile", profilePayload, {
      httpOnly: false, // Client-readable for UI display
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Clear the oauth_state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (err: any) {
    console.error("[OAuth Callback] Error during token exchange:", err);
    return NextResponse.redirect(
      `${APP_BASE_URL}/?auth_error=${encodeURIComponent(err.message || "oauth_failed")}`
    );
  }
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
    code,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Token exchange failed: ${errorData}`);
  }

  return response.json();
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info from Google");
  }

  return response.json();
}

async function getOrCreateGoogleUser(userInfo: GoogleUserInfo): Promise<string> {
  const lookupKey = `google_user:${userInfo.sub}`;

  // Check if this Google user is already mapped
  const existingUserId = await redis.get<string>(lookupKey);
  if (existingUserId) {
    // Update their profile info in case it changed
    await redis.set(`google_profile:${existingUserId}`, {
      googleId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });
    return existingUserId;
  }

  // New Google user — create a deterministic userId from their Google sub
  const shortId = userInfo.sub.slice(-8); // last 8 chars of Google sub
  const userId = `go_${shortId}`;

  // Store the mapping (Google sub → userId)
  await redis.set(lookupKey, userId);

  // Store their profile
  await redis.set(`google_profile:${userId}`, {
    googleId: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
  });

  return userId;
}
