// app/api/student/courses/purchase/route.js
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
    const { courseId } = body;

    await connectDB();

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      courseId,
      studentId: user.id
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
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

    // If course is free, create enrollment directly
    if (course.price === 0) {
      const enrollment = new CourseEnrollment({
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
          amount: 0,
          paymentStatus: 'completed',
          paymentDate: new Date()
        }
      });

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollments: 1 }
      });

      return NextResponse.json({
        message: 'Enrolled successfully',
        enrollment
      });
    }

    // Create Stripe checkout session for paid courses
    // Update the success_url and cancel_url in the stripe session creation
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description?.substring(0, 255) || undefined,
            images: course.thumbnail ? [course.thumbnail] : undefined,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course._id.toString(),
      studentId: user.id,
      studentEmail: user.email
    },
    customer_email: user.email,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/courses/${courseId}/payment/status?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/courses/${courseId}?payment=cancelled`,
  });

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


