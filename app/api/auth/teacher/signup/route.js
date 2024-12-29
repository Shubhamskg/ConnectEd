// app/api/auth/teacher/signup/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Teacher from '@/lib/models/Teacher';

export async function POST(request) {
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      specialty,
      credentials,
      bio,
      hourlyRate = 50 // Default hourly rate
    } = await request.json();

    // Validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user with teacher role
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'teacher'
    });

    // Create teacher profile
    const teacher = await Teacher.create({
      userId: user._id,
      specialty,
      credentials,
      bio,
      hourlyRate,
      expertise: [specialty], // Initial expertise based on specialty
      verificationStatus: 'pending'
    });

    return NextResponse.json(
      { message: 'Teacher account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Teacher signup error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

