// app/api/auth/[provider]/callback/route.js
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { provider } = params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Verify state to prevent CSRF attacks
    // Exchange code for tokens
    // Get user information
    // Create/update user in database
    // Set session/cookies

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }
}