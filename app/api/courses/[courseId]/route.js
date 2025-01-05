// app/api/courses/[courseId]/route.js
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const course = await Course.findById(params.courseId)
      .populate('teacherId', 'teacherName')
      .lean();

    if (!course) {
      return Response.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return Response.json({ course });
  } catch (error) {
    console.error('Course fetch error:', error);
    return Response.json(
      { message: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
