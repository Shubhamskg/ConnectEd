// app/api/student/courses/enrolled/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await connectDB();

    // Get enrollments with course details
    const enrollments = await Enrollment
      .find({ student: decoded.userId })
      .populate('course')
      .sort({ enrolledAt: -1 });

    // Format the response
    const courses = enrollments.map(enrollment => ({
      id: enrollment.course._id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      thumbnail: enrollment.course.thumbnail,
      progress: enrollment.progress,
      enrollments: enrollment.course.enrollments,
      totalDuration: enrollment.course.totalDuration,
      totalLessons: enrollment.course.totalLessons,
      category: enrollment.course.category,
      level: enrollment.course.level,
      status: enrollment.status,
      lastAccessed: enrollment.lastAccessed
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

