// app/api/student/courses/enrolled/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUser(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token.value, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    const user = await getUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all enrollments with course details
    const enrollments = await CourseEnrollment.find({ 
      studentId: user.id 
    })
    .populate({
      path: 'courseId',
      populate: {
        path: 'teacherId',
        select: 'name'
      }
    })
    .sort({ lastAccessedAt: -1 });

    // Format the response with complete course information
    const courses = enrollments.map(enrollment => {
      const course = enrollment.courseId;
      
      // Calculate completed lessons
      const completedLessons = enrollment.lessonsProgress.filter(p => p.completed).length;
      
      // Calculate total lessons
      const totalLessons = course.sections.reduce((total, section) => 
        total + section.lessons.length, 0);
      
      // Calculate remaining time
      const remainingTime = course.sections.reduce((total, section) => {
        return total + section.lessons.reduce((sectionTotal, lesson) => {
          const progress = enrollment.lessonsProgress.find(
            p => p.lessonId.toString() === lesson._id.toString()
          );
          if (!progress?.completed) {
            return sectionTotal + (lesson.duration || 0);
          }
          return sectionTotal;
        }, 0);
      }, 0);

      return {
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructorName: course.teacherId.name,
        progress: Math.round(enrollment.progress),
        completedLessons,
        totalLessons,
        remainingTime,
        lastAccessed: enrollment.lastAccessedAt,
        sections: course.sections.map(section => ({
          _id: section._id,
          title: section.title,
          lessons: section.lessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            duration: lesson.duration,
            completed: enrollment.lessonsProgress.some(
              p => p.lessonId.toString() === lesson._id.toString() && p.completed
            )
          }))
        })),
        // Include progress details for each lesson
        progress: enrollment.lessonsProgress.map(progress => ({
          lessonId: progress.lessonId,
          completed: progress.completed,
          watchTime: progress.watchTime,
          lastAccessed: progress.lastWatched
        }))
      };
    });

    return NextResponse.json({ courses });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}