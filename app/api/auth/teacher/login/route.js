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

    console.log('=== Teacher Login Attempt ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    
    if (!teacher) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found teacher ID:', teacher._id);
    console.log('Stored hash:', teacher.password);

    // Test password match
    const isValid = await bcrypt.compare(password, teacher.password);
    console.log('Password comparison result:', isValid);

    // Double-check with a fresh hash
    const testSalt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash(password, testSalt);
    console.log('Test hash generated:', testHash);

    if (!isValid) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!teacher.verified) {
      return new Response(
        JSON.stringify({ message: "Please verify your email first" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create token
    const token = jwt.sign(
      {
        userId: teacher._id,
        email: teacher.email,
        role: 'teacher'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    const cookie=await cookies()
    cookie.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log('=== Login Successful ===');

    return new Response(
      JSON.stringify({
        message: "Logged in successfully",
        user: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher'
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ message: "An error occurred during login" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
