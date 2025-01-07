// app/api/student/courses/available/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
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

    // Get enrolled course IDs for the student
    const enrolledCourseIds = await Enrollment
      .find({ student: decoded.userId })
      .distinct('course');

    // Get available courses (excluding enrolled ones)
    const courses = await Course
      .find({
        _id: { $nin: enrolledCourseIds },
        status: 'published'
      })
      .sort({ enrollments: -1 });

    // Format the response
    const formattedCourses = courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      enrollments: course.enrollments,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      category: course.category,
      level: course.level,
      price: course.price
    }));

    return NextResponse.json({ courses: formattedCourses });
  } catch (error) {
    console.error('Error fetching available courses:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}