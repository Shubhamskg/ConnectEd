// lib/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email, resetToken, role) {
  try {
    console.log('Sending reset email to:', email, 'for role:', role); // Debug log

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const resetUrl = `${baseUrl}/auth/${role}/reset-password?token=${resetToken}`;

    const subject = role === 'student' 
      ? 'Reset Your ConnectEd Student Profile Password'
      : 'Reset Your ConnectEd Teacher Profile Password';

    const emailContent = getEmailTemplate(role, resetUrl);

    const mailOptions = {
      from: {
        name: 'ConnectEd',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: subject,
      html: emailContent
    };

    console.log('Sending email with options:', {
      to: email,
      subject: subject,
      resetUrl: resetUrl
    }); // Debug log

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully'); // Debug log

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

function getEmailTemplate(role, resetUrl) {
  const roleText = role === 'student' ? 'Student' : 'Teacher';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6; text-align: center;">ConnectEd</h1>
      <h2>Reset Your ${roleText} Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your ${roleText.toLowerCase()} account password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #3b82f6; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p style="color: #666; font-size: 14px;">For security: This reset link was requested from the ConnectEd platform. If you didn't request this reset, please change your password immediately.</p>
      <hr style="margin: 30px 0; border-color: #e5e7eb;" />
      <p style="text-align: center; color: #666; font-size: 12px;">
        ConnectEd - Transforming the way we learn and teach online
      </p>
    </div>
  `;
}

// Optional: Add a test function to verify email configuration
export async function testEmailConfiguration() {
  try {
    console.log('Testing email configuration...'); // Debug log
    await transporter.verify();
    console.log('Email configuration is valid'); // Debug log
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { success: false, error: error.message };
  }
}