// app/api/auth/teacher/forgot-password/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { sendPasswordResetEmail } from '@/app/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    const user = await User.findOne({ 
      email, 
      role: 'teacher'
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, reset instructions will be sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save token to user
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken, 'teacher');

    return NextResponse.json({
      message: 'If an account exists, reset instructions will be sent'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}