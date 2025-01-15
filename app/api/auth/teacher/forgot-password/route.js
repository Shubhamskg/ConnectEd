// // app/api/auth/teacher/forgot-password/route.js
// import { NextResponse } from 'next/server';
// import crypto from 'crypto';
// import { connectDB } from '@/lib/mongodb';
// import User from '@/lib/models/User';
// import { sendPasswordResetEmail } from '@/lib/email';

// export async function POST(request) {
//   try {
//     await connectDB();
    
//     const { email } = await request.json();
//     console.log('Received teacher forgot password request for:', email);

//     const user = await User.findOne({ 
//       email, 
//       role: 'teacher'
//     });

//     // For security, always return same response
//     if (!user) {
//       return NextResponse.json({
//         message: 'If an account exists, reset instructions will be sent'
//       });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const tokenHash = crypto
//       .createHash('sha256')
//       .update(resetToken)
//       .digest('hex');

//     // Save token to user
//     user.resetPasswordToken = tokenHash;
//     user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
//     await user.save();

//     // Send email
//     const emailResult = await sendPasswordResetEmail(email, resetToken, 'teacher');

//     if (!emailResult.success) {
//       console.error('Failed to send teacher reset email:', emailResult.error);
//       return NextResponse.json(
//         { message: 'Error sending reset email' },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       message: 'If an account exists, reset instructions will be sent'
//     });
//   } catch (error) {
//     console.error('Teacher password reset error:', error);
//     return NextResponse.json(
//       { message: 'Something went wrong' },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/teacher/forgot-password/route.js
// app/api/auth/teacher/forgot-password/route.js
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
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

    // Find teacher
    const teacher = await Teacher.findOne({ email: email.toLowerCase() });

    // Generate reset token even if user doesn't exist (for security)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (teacher) {
      // Update teacher with reset token
      teacher.resetPasswordToken = resetToken;
      teacher.resetPasswordExpires = resetTokenExpiry;
      await teacher.save();

      // Send reset email
      try {
        const emailResult = await sendPasswordResetEmail({
          email: teacher.email,
          name: teacher.name,
          token: resetToken,
          role: 'teacher'
        });

        if (!emailResult.success) {
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

    // Return same response whether user exists or not
    return new Response(
      JSON.stringify({ 
        message: "If an account exists, password reset instructions will be sent to your email"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ message: "An error occurred while processing your request" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}