// app/api/auth/student/forgot-password/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ message: "Email is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find student
    const student = await Student.findOne({ email: email.toLowerCase() });

    // Generate reset token even if user doesn't exist (for security)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (student) {
      // Update student with reset token
      student.resetPasswordToken = resetToken;
      student.resetPasswordExpires = resetTokenExpiry;
      await student.save();

      // Send reset email
      try {
        const emailResult = await sendPasswordResetEmail({
          email: student.email,
          name: student.name,
          token: resetToken,
          role: 'student'
        });

        if (!emailResult.success) {
          console.error('Failed to send student reset email:', emailResult.error);
          throw new Error('Failed to send reset email');
        }
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        return new Response(
          JSON.stringify({ message: "Failed to send reset email" }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return same response whether user exists or not (for security)
    return new Response(
      JSON.stringify({ 
        message: "If an account exists, password reset instructions will be sent to your email"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Student password reset error:', error);
    return new Response(
      JSON.stringify({ message: "An error occurred while processing your request" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}