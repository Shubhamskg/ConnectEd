// app/api/auth/student/forgot-password/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { sendPasswordResetEmail } from '@/app/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    console.log('Received forgot password request for:', email); // Debug log

    // Find user with student role
    const user = await User.findOne({ 
      email, 
      role: 'student'
    });

    // For security, always return same response whether user exists or not
    if (!user) {
      console.log('No student found with email:', email); // Debug log
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
    console.log('Reset token generated for student:', resetToken); // Debug log

    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken, 'student');
    console.log('Email send result:', emailResult); // Debug log

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return NextResponse.json(
        { message: 'Error sending reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If an account exists, reset instructions will be sent'
    });
  } catch (error) {
    console.error('Student password reset error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}