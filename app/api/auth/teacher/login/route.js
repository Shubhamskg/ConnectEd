// app/api/auth/teacher/login/route.js
import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import Teacher from '@/app/lib/models/Teacher';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Find user
    const user = await User.findOne({ email, role: 'teacher' }).select('+password');
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: user._id });
    if (!teacher) {
      return NextResponse.json(
        { message: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Check account status
    if (teacher.accountStatus !== 'active') {
      return NextResponse.json(
        { message: 'Account is not active' },
        { status: 403 }
      );
    }

    // Create token with teacher info
    const token = sign(
      { 
        id: user._id, 
        role: user.role,
        teacherId: teacher._id,
        verificationStatus: teacher.verificationStatus
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const response = NextResponse.json(
      { message: 'Logged in successfully' },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Teacher login error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

