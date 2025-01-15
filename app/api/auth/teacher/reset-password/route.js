// app/api/auth/teacher/reset-password/route.js
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('=== Starting Teacher Password Reset ===');
    const { token, password } = await request.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ message: "Token and password are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();

    // Find teacher
    let teacher = await Teacher.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!teacher) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired reset token" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found teacher ID:', teacher._id);
    console.log('Original password hash:', teacher.password);

    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Generated hash:', hashedPassword);

    // Direct database update
    const result = await Teacher.findByIdAndUpdate(
      teacher._id,
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
    const verifyTeacher = await Teacher.findById(teacher._id);
    console.log('Verification - stored password hash:', verifyTeacher.password);

    // Test the password
    const testPassword = await bcrypt.compare(password, verifyTeacher.password);
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
