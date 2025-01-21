//app/api/auth/[platform]/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

const PLATFORM_CONFIGS = {
  zoom: {
    tokenUrl: 'https://zoom.us/oauth/token',
    userInfoUrl: 'https://api.zoom.us/v2/users/me',
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`
  },
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  },
  microsoft: {
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`
  }
};

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = decoded.role === 'teacher' ? 
      await Teacher.findById(decoded.userId).select('-password') :
      await Student.findById(decoded.userId).select('-password');

    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Initialize OAuth flow
export async function GET(req, { params }) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { platform } =await params;
    const config = PLATFORM_CONFIGS[platform];

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Generate state parameter for security
    const state = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Build authorization URL
    let authUrl;
    switch (platform) {
      case 'zoom':
        authUrl = `https://zoom.us/oauth/authorize?${new URLSearchParams({
          response_type: 'code',
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          state,
          scope: 'meeting:write user:read'
        })}`;
        break;

      case 'google':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          response_type: 'code',
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          state,
          scope: 'https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent'
        })}`;
        break;

      case 'microsoft':
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({
          response_type: 'code',
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          state,
          scope: 'offline_access OnlineMeetings.ReadWrite'
        })}`;
        break;
    }

    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('OAuth initialization error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle OAuth callback
export async function POST(req, { params }) {
  try {
    const { platform } =await params;
    const { code, state } = await req.json();
    const config = PLATFORM_CONFIGS[platform];

    // Verify state parameter
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      config.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn
    } = tokenResponse.data;

    // Get platform user info
    const userInfoResponse = await axios.get(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Store platform credentials
    await connectDB();
    await Teacher.findByIdAndUpdate(userId, {
      [`platformCredentials.${platform}`]: {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        platformUserId: userInfoResponse.data.id || userInfoResponse.data.sub,
        platformEmail: userInfoResponse.data.email,
        lastSync: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      platform,
      message: 'Platform connected successfully'
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to complete platform connection' },
      { status: 500 }
    );
  }
}

// Refresh platform tokens
export async function PUT(req, { params }) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { platform } =await params;
    const config = PLATFORM_CONFIGS[platform];

    await connectDB();
    const teacher = await Teacher.findById(user.id)
      .select(`platformCredentials.${platform}`)
      .lean();

    const credentials = teacher?.platformCredentials?.[platform];
    if (!credentials?.refreshToken) {
      return NextResponse.json(
        { error: 'Platform not connected' },
        { status: 400 }
      );
    }

    // Get new access token
    const tokenResponse = await axios.post(
      config.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn
    } = tokenResponse.data;

    // Update stored credentials
    await Teacher.findByIdAndUpdate(user.id, {
      [`platformCredentials.${platform}.accessToken`]: accessToken,
      [`platformCredentials.${platform}.refreshToken`]: refreshToken,
      [`platformCredentials.${platform}.expiresAt`]: new Date(Date.now() + expiresIn * 1000),
      [`platformCredentials.${platform}.lastSync`]: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Platform tokens refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh platform tokens' },
      { status: 500 }
    );
  }
}