// app/api/auth/teacher/reset-password/route.js
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    await connectDB();
    
    const teacher = await Teacher.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!teacher) {
      return Response.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password and update teacher
    teacher.password = await bcrypt.hash(password, 10);
    teacher.resetPasswordToken = undefined;
    teacher.resetPasswordExpires = undefined;
    await teacher.save();

    return Response.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

