// app/api/auth/teacher/login/route.js
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!teacher.verified) {
      return new Response(
        JSON.stringify({ message: 'Please verify your email first' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create JWT token with necessary information
    const token = jwt.sign(
      {
        userId: teacher._id,
        email: teacher.email,
        role: 'teacher'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return Response.json({
      message: "Logged in successfully",
      user: {
        id: teacher._id,
        email: teacher.email,
        name: teacher.name,
        role: 'teacher'
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}