// app/api/auth/teacher/resend-verification/route.js
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return Response.json(
        { message: "If an account exists, a verification email will be sent." }
      );
    }

    if (teacher.verified) {
      return Response.json(
        { message: "Email is already verified. Please login." },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    teacher.verificationToken = verificationToken;
    teacher.verificationTokenExpires = verificationTokenExpires;
    await teacher.save();

    await sendVerificationEmail({
      email,
      token: verificationToken,
      name: teacher.name,
      role: 'teacher'
    });

    return Response.json({
      message: "If an account exists, a verification email will be sent."
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}