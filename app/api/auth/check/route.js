// app/api/auth/check/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const authToken =  cookieStore.get('auth-token');

    if (!authToken || !authToken.value) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
      
      await connectDB();

      const user = await Teacher.findById(decoded.userId)
        .select('-password')
        .lean();

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: 'teacher'
        }
      });

    } catch (err) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 401 }
    );
  }
}