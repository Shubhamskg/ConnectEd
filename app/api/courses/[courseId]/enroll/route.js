// app/api/courses/[courseId]/enroll/route.js
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify student
    const student = await Student.findById(session.user.id);
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