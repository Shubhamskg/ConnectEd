// app/api/auth/[role]/forgot-password/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    const { role } = params;

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email, role });

    // For security, always return the same response whether user exists or not
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, reset instructions will be sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Update user with reset token
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken, role);

    if (!emailResult.success) {
      return NextResponse.json(
        { message: 'Error sending reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If an account exists, reset instructions will be sent'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}