// app/api/auth/student/reset-password/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('=== Starting Password Reset ===');
    const { token, password } = await request.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ message: "Token and password are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();

    // Find student
    let student = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired reset token" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found student ID:', student._id);
    console.log('Original password hash:', student.password);

    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Generated hash:', hashedPassword);

    // Direct database update to ensure atomic operation
    const result = await Student.findByIdAndUpdate(
      student._id,
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      },
      { new: true }
    );

    console.log('Update result - new password hash:', result.password);

    // Verify the update
    const verifyStudent = await Student.findById(student._id);
    console.log('Verification - stored password hash:', verifyStudent.password);

    // Test the password
    const testPassword = await bcrypt.compare(password, verifyStudent.password);
    console.log('Password verification test:', testPassword);

    return new Response(
      JSON.stringify({ message: "Password reset successfully" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(
      JSON.stringify({ 
        message: "Failed to reset password",
        error: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
