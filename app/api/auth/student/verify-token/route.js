// app/api/auth/student/verify-token/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('Attempting to verify token:', token);

    if (!token) {
      return Response.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find student with exact token match
    const student = await Student.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    console.log('Found student:', student ? student.email : 'No student found');

    if (!student) {
      return Response.json(
        { message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update student verification status
    student.verified = true;
    student.verificationToken = undefined;
    student.verificationTokenExpires = undefined;
    await student.save();

    console.log('Successfully verified student:', student.email);

    return Response.json({ 
      message: "Email verified successfully. You can now log in."
    });

  } catch (error) {
    console.error('Verification error:', error);
    return Response.json(
      { message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}