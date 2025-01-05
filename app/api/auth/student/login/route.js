import { cookies } from 'next/headers';
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const student = await Student.findOne({ email });
    if (!student) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!student.verified) {
      return new Response(JSON.stringify({ message: "Please verify your email first" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: student._id, 
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return new Response(JSON.stringify({
      message: "Logged in successfully",
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}