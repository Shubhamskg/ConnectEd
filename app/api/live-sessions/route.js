// app/api/live-sessions/route.js
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    // Get token from cookies
    const cookieStore =await cookies();
    const token =  cookieStore.get('auth-token');

    if (!token) {
      return Response.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch (error) {
      return Response.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Parse request body
    const { title, description } = await request.json();

    // Validate required fields
    if (!title?.trim()) {
      return Response.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Convert teacherId to ObjectId
    const teacherId = new mongoose.Types.ObjectId(decoded.userId);

    // Check for existing active session
    const activeSession = await LiveSession.findOne({
      teacherId,
      status: 'active',
      endedAt: null
    });

    if (activeSession) {
      return Response.json(
        { message: "You already have an active session" },
        { status: 400 }
      );
    }

    // Create new session with validated data
    const session = new LiveSession({
      title: title.trim(),
      description: description?.trim() || '',
      teacherId,
      startedAt: new Date(),
      status: 'active'
    });

    await session.save();

    // Generate join link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const joinLink = `${baseUrl}/join/${session._id}`;

    return Response.json({
      message: "Session created successfully",
      session: {
        id: session._id,
        title: session.title,
        description: session.description,
        startedAt: session.startedAt,
        status: session.status
      },
      joinLink
    });

  } catch (error) {
    console.error('Create session error:', error);

    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return Response.json(
      { message: "Failed to create live session" },
      { status: 500 }
    );
  }
}
