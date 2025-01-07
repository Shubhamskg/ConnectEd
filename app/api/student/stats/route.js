// app/api/student/stats/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import Student from '@/models/Student';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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

export async function GET(req) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const studentId = user.id;

    // Run all queries in parallel for better performance
    const [
      enrollments,
      upcomingEvents,
      assignments
    ] = await Promise.all([
      // Get all enrollments for the student
      Enrollment
        .find({ student: studentId })
        .populate('course'),
      
      // Get upcoming events
      EventRegistration
        .find({
          studentId,
          'event.startDate': { 
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }),
      
      // Get pending assignments (this would need to be implemented based on your Assignment model)
      // Assignment.find({ studentId, status: 'pending' })
    ]);

    // Calculate statistics
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    
    // Calculate average progress
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    const averageProgress = totalEnrolled > 0 
      ? Math.round(totalProgress / totalEnrolled) 
      : 0;

    // Calculate completion rate
    const completionRate = totalEnrolled > 0 
      ? Math.round((completedCourses / totalEnrolled) * 100)
      : 0;

    return NextResponse.json({
      enrolledCourses: totalEnrolled,
      completedCourses,
      upcomingEvents: upcomingEvents.length,
      averageProgress,
      totalAssignments: assignments?.length || 0,
      completionRate
    });

  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}