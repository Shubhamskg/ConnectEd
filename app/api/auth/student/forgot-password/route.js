// app/api/auth/student/forgot-password/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    console.log('Received student forgot password request for:', email);

    const user = await User.findOne({ 
      email, 
      role: 'student'
    });

    // For security, always return same response
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

    // Save token to user
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken, 'student');

    if (!emailResult.success) {
      console.error('Failed to send student reset email:', emailResult.error);
      return NextResponse.json(
        { message: 'Error sending reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If an account exists, reset instructions will be sent'
    });
  } catch (error) {
    console.error('Student password reset error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}