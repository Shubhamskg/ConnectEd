// app/api/student/courses/[courseId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-password');

    if (!student) {
      return null;
    }

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } =await params;
    await connectDB();

    // Get course details and check if student is enrolled
    const [course, enrollment] = await Promise.all([
      Course.findById(courseId)
        .select('-reviews')
        .lean(),
      CourseEnrollment.findOne({
        courseId,
        studentId: user.id
      }).lean()
    ]);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedCourse = {
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      level: course.level,
      category: course.category,
      enrollments: course.enrollments,
      rating: course.rating,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      prerequisites: course.prerequisites,
      objectives: course.objectives,
      sections: course.sections.map(section => ({
        title: section.title,
        lessons: section.lessons.map(lesson => ({
          id: lesson._id,
          title: lesson.title,
          duration: lesson.duration,
          ...(enrollment ? { videoURL: lesson.videoURL } : {})
        }))
      }))
    };

    let formattedEnrollment = null;
    if (enrollment) {
      formattedEnrollment = {
        id: enrollment._id,
        status: enrollment.status,
        progress: enrollment.progress,
        lessonsProgress: enrollment.lessonsProgress,
        lastAccessedAt: enrollment.lastAccessedAt,
        certificate: enrollment.certificate
      };
    }

    return NextResponse.json({
      course: formattedCourse,
      enrollment: formattedEnrollment
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

