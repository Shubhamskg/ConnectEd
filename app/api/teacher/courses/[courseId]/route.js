// app/api/teacher/courses/[courseId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { deleteFromFirebase } from '@/lib/firebase';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Review from '@/models/Review';
import Discussion from '@/models/Discussion';
import Assignment from '@/models/Assignment';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { use } from 'react';
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

export async function GET(request, { params }) {
  try {
    // Get auth token
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken || !authToken.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify token
    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const { courseId } = params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const course = await Course.findOne({
      _id: courseId,
      teacherId: decoded.userId
    }).lean();
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(course);
    
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
     const user = await verifyAuth();
                  if (!user) {
                    return NextResponse.json(
                      { error: 'Unauthorized' },
                      { status: 401 }
                    );
                  }

    const { courseId } =use(params);
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find course and verify ownership
    const course = await Course.findOne({
      _id: courseId,
      teacherId: user.id
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course resources from Firebase Storage
    if (course.thumbnail) {
      await deleteFromFirebase(course.thumbnail);
    }

    // Delete lesson videos
    for (const section of course.sections || []) {
      for (const lesson of section.lessons || []) {
        if (lesson.videoURL) {
          await deleteFromFirebase(lesson.videoURL);
        }
      }
    }

    // Delete course and related data
    await Promise.all([
      Course.deleteOne({ _id: courseId }),
      Enrollment.deleteMany({ courseId }),
      Review.deleteMany({ courseId }),
      Discussion.deleteMany({ courseId }),
      Assignment.deleteMany({ courseId })
    ]);

    return NextResponse.json({
      message: 'Course and related data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}