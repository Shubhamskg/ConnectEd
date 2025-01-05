// app/api/auth/[role]/logout/route.js
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // Get the cookie store
    const cookieStore = cookies();
    
    // Delete the auth token cookie
    cookieStore.delete('auth-token');

    return new Response(JSON.stringify({ message: "Logged out successfully" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ message: "Logout failed" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
