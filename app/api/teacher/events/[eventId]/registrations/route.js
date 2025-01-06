// app/api/teacher/events/[eventId]/registrations/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Event from '@/models/Event';
import Registration from '@/models/Registration';

export async function GET(request, { params }) {
  try {
    const cookieStore =await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and teacher role
    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { eventId } =await params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify event ownership
    const event = await Event.findOne({
      _id: eventId,
      teacherId: decoded.userId
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get registrations with user details
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email profile')
      .sort({ registeredAt: -1 })
      .lean();

    return NextResponse.json(registrations);

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Export registrations to CSV
export async function POST(request, { params }) {
  try {
    const cookieStore =await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { eventId } =await params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify event ownership
    const event = await Event.findOne({
      _id: eventId,
      teacherId: decoded.userId
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get registrations with user details
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email profile')
      .sort({ registeredAt: -1 })
      .lean();

    // Convert to CSV
    const rows = registrations.map(reg => ({
      'Attendee Name': reg.userId?.name || 'Unknown',
      'Email': reg.userId?.email || 'Unknown',
      'Ticket Type': reg.ticketTier.name,
      'Price': reg.ticketTier.price,
      'Status': reg.status,
      'Registration Date': new Date(reg.registeredAt).toLocaleDateString(),
      'Payment Status': reg.paymentStatus
    }));

    // Create CSV content
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${event.title}-registrations.csv`
      }
    });

  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}