// app/api/auth/student/reset-password/route.js
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    await connectDB();
    
    const student = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!student) {
      return Response.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password and update student
    student.password = await bcrypt.hash(password, 10);
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    return Response.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

