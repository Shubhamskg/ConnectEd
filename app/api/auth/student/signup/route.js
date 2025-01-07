import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    // Input validation
    if (!name || !email || !password) {
      return Response.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return Response.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new student
    const student = new Student({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      verificationToken,
      verificationTokenExpires,
      verified: false
    });

    await student.save();

    // Send verification email
    await sendVerificationEmail({
      email: student.email,
      token: verificationToken,
      name: student.name,
      role: 'student'
    });

    return Response.json({
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message === 'Failed to send verification email') {
      return Response.json(
        { message: "Account created but failed to send verification email. Please contact support." },
        { status: 500 }
      );
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}