// app/api/auth/student/reset-password/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
      role: 'student'
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}