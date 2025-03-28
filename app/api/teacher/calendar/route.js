// app/api/teacher/calendar/route.js
import { NextResponse } from 'next/server';
import { CalendarEvent } from '@/models/CalendarEvent';
import { connectDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Teacher from '@/models/Teacher';

async function verifyAuth() {
  const cookieStore =await cookies();
  const token =  cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.userId).select('-password');

    if (!teacher) {
      return null;
    }

    return {
      id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      role: 'teacher'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}
export async function POST(req) {
  try {
    const user = await verifyAuth();
              if (!user) {
                return NextResponse.json(
                  { error: 'Unauthorized' },
                  { status: 401 }
                );
              }

    await connectDB();
    
    const data = await req.json();
    const event = new CalendarEvent({
      ...data,
      teacher: user.id
    });

    await event.save();

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const user = await verifyAuth();
              if (!user) {
                return NextResponse.json(
                  { error: 'Unauthorized' },
                  { status: 401 }
                );
              }

    await connectDB();
    
    const events = await CalendarEvent.find({ 
      teacher: user.id,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    })
    .sort({ date: 1, startTime: 1 })
    .populate('course', 'title');

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
