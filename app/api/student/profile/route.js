// app/api/student/profile/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get auth token from cookie
    const cookieList =await cookies();
    const authToken =  cookieList.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid token" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await connectDB();

    // Find student by ID
    const student = await Student.findById(decoded.userId)
      .select('name email verified createdAt')
      .lean();

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        student: {
          ...student,
          id: student._id.toString()
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
