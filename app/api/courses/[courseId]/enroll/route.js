// app/api/courses/[courseId]/enroll/route.js
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";
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

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth();
        
        if (!user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

    await connectDB();

    // Verify student
    const student = await Student.findById(user.id);
    if (!student) {
      return Response.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Verify course
    const course = await Course.findById(params.courseId);
    if (!course) {
      return Response.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      course: course._id
    });

    if (existingEnrollment) {
      return Response.json(
        { message: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: student._id,
      course: course._id
    });

    await enrollment.save();

    // Update course enrolled students count
    await Course.findByIdAndUpdate(course._id, {
      $inc: { enrolledStudents: 1 }
    });

    return Response.json({
      message: "Successfully enrolled in course",
      enrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return Response.json(
      { message: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}