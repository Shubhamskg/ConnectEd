// app/api/teacher/courses/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Teacher from '@/models/Teacher';

async function verifyAuth() {
  const cookieStore =await cookies();
  const token =  cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.userId).select('-password');

    if (!teacher) {
      return null;
    }

    return {
      id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      role: 'teacher'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth();
    
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const courseData = await req.json();

    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.thumbnail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate duration and lessons count
    const totalDuration = courseData.sections?.reduce((total, section) => {
      return total + (section.lessons?.reduce((sectionTotal, lesson) => {
        return sectionTotal + (parseInt(lesson.duration) || 0);
      }, 0) || 0);
    }, 0) || 0;

    const totalLessons = courseData.sections?.reduce((total, section) => {
      return total + (section.lessons?.length || 0);
    }, 0) || 0;

    // Create new course document
    const course = new Course({
      ...courseData,
      teacherId: user.id,
      teacherName: user.name,
      status: 'draft',
      enrollments: 0,
      reviews: [],
      rating: 0,
      totalDuration,
      totalLessons
    });

    // Save course
    const savedCourse = await course.save();

    return NextResponse.json({
      message: 'Course created successfully',
      courseId: savedCourse._id,
      course: savedCourse
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const user = await verifyAuth();
    
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build query
    const query = { teacherId: user.id };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    return NextResponse.json({
      courses,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}