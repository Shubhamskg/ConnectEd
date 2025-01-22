
// File: app/api/student/profile/education/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    await connectDB();

    const { education } = await request.json();
    const student = await Student.findById(decoded.userId);

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        { status: 404 }
      );
    }

    student.profile.education = education;
    await student.save();

    return new Response(
      JSON.stringify({
        education: student.profile.education
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Education update error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
