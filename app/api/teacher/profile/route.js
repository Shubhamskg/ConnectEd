// app/api/teacher/profile/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Teacher from '@/lib/models/Teacher';
import { getToken } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();

    const token = await getToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const teacher = await Teacher.findOne({ userId: token.id })
      .populate('followers', 'firstName lastName')
      .select('-earnings.history');

    if (!teacher) {
      return NextResponse.json(
        { message: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Get teacher profile error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = await getToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    
    // Prevent updating sensitive fields
    delete updateData.verificationStatus;
    delete updateData.accountStatus;
    delete updateData.earnings;
    delete updateData.userId;

    const teacher = await Teacher.findOneAndUpdate(
      { userId: token.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return NextResponse.json(
        { message: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Update teacher profile error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}