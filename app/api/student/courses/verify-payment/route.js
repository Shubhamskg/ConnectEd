// app/api/student/courses/verify-payment/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-password');

    if (!student) {
      return null;
    }

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, sessionId } = body;

    if (!courseId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check if metadata matches
    if (session.metadata.courseId !== courseId || 
        session.metadata.studentId !== user.id) {
      return NextResponse.json(
        { error: 'Invalid payment session' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    let enrollment = await CourseEnrollment.findOne({
      courseId,
      studentId: user.id
    });

    if (!enrollment) {
      // Create new enrollment
      enrollment = new CourseEnrollment({
        studentId: user.id,
        courseId: course._id,
        status: 'active',
        lessonsProgress: course.sections.flatMap(section =>
          section.lessons.map(lesson => ({
            lessonId: lesson._id,
            completed: false,
            watchTime: 0
          }))
        ),
        paymentInfo: {
          amount: session.amount_total / 100,
          currency: session.currency,
          stripePaymentId: session.payment_intent,
          stripeSessionId: session.id,
          paymentStatus: 'completed',
          paymentDate: new Date()
        }
      });

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollments: 1 }
      });
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      course: {
        id: course._id,
        title: course.title
      },
      enrollment: {
        id: enrollment._id,
        status: enrollment.status
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}