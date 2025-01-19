import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Teacher from "@/models/Teacher";
import mongoose from "mongoose";

async function getUser(request) {
  const cookieStore = await cookies();
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

export async function GET(request, { params }) {
  try {
    const user = await getUser(request);
    await connectDB();
    const { courseId } =await params;

    // Convert courseId to ObjectId
    let courseObjectId;
    try {
      courseObjectId = new mongoose.Types.ObjectId(courseId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    // Fetch course with populated instructor and reviews
    const courses = await Course.aggregate([
      { $match: { _id: courseObjectId } },
      
      // Lookup instructor details
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      { $unwind: '$instructor' },

      // Lookup review details with student info
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'courseId',
          pipeline: [
            {
              $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      avatar: 1
                    }
                  }
                ],
                as: 'student'
              }
            },
            { $unwind: '$student' },
            {
              $project: {
                rating: 1,
                comment: 1,
                createdAt: 1,
                studentName: '$student.name',
                studentAvatar: '$student.avatar'
              }
            }
          ],
          as: 'reviews'
        }
      },

      // Calculate review statistics
      {
        $addFields: {
          totalRatings: { $size: '$reviews' },
          rating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              0
            ]
          }
        }
      },

      // Project only needed fields
      {
        $project: {
          title: 1,
          description: 1,
          thumbnail: 1,
          previewVideo: 1,
          price: 1,
          discountedPrice: 1,
          level: 1,
          category: 1,
          language: 1,
          objectives: 1,
          requirements: 1,
          sections: 1,
          totalDuration: 1,
          totalLessons: 1,
          enrolledStudents: 1,
          rating: 1,
          totalRatings: 1,
          reviews: 1,
          lastUpdated: 1,
          moneyBackGuarantee: 1,
          whoShouldTake: 1,
          resources: 1,
          instructor: {
            _id: 1,
            name: 1,
            avatar: 1,
            title: 1,
            bio: 1,
            expertise: 1,
            rating: 1,
            coursesCount: 1,
            studentsCount: 1
          }
        }
      }
    ]);

    // Get the first (and should be only) course from the aggregation result
    const course = courses[0];

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // If user is authenticated, check enrollment status
    let userEnrollment = null;
    if (user) {
      userEnrollment = await CourseEnrollment.findOne({
        courseId: course._id,
        studentId: user.id
      }).select('status progress lessonsProgress lastAccessedAt');
    }

    // Format the response
    const formattedCourse = {
      ...course,
      // Add preview flags to lessons that should be available for preview
      sections: Array.isArray(course.sections) ? course.sections.map(section => ({
        ...section,
        lessons: Array.isArray(section.lessons) ? section.lessons.map((lesson, index) => ({
          ...lesson,
          preview: index === 0 || lesson.preview // Make first lesson always previewable
        })) : []
      })) : []
    };

    return NextResponse.json({
      course: formattedCourse,
      userEnrollment
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}