// app/api/auth/student/signup/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import crypto from 'crypto';
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    // Validate email format
    if (!email || !email.includes('@')) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for existing student
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return Response.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(16).toString('hex');

    // Create new student with explicit fields
    const student = new Student({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verified: false
    });

    // Log for debugging
    console.log('Creating student with token:', verificationToken);

    await student.save();

    // Verify student was saved
    const savedStudent = await Student.findOne({ email: email.toLowerCase() });
    console.log('Saved student verification token:', savedStudent?.verificationToken);

    // Send verification email
    await sendVerificationEmail({
      email: student.email,
      name: student.name,
      token: verificationToken,
      role: 'student'
    });

    return Response.json({
      message: "Registration successful! Please check your email to verify your account."
    });

  } catch (error) {
    console.error('Signup error:', error);
    return Response.json(
      { message: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
