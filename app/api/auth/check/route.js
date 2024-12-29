// app/api/auth/check/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const token = request.cookies.get('token');
    if (!token) {
      return NextResponse.json(null, { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json(null, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    // Get role-specific data
    let profileData = {};
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id });
      profileData = {
        specialty: teacher.specialty,
        verificationStatus: teacher.verificationStatus
      };
    } else {
      const student = await Student.findOne({ userId: user._id });
      profileData = {
        interests: student.interests
      };
    }

    return NextResponse.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      ...profileData
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(null, { status: 401 });
  }
}