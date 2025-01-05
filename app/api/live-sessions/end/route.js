// app/api/live-sessions/end/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LiveSession from '@/lib/models/LiveSession';

export async function POST(req) {
  try {
    await connectDB();
    const { sessionId } = await req.json();

    const session = await LiveSession.findByIdAndUpdate(
      sessionId,
      {
        status: 'ended',
        endTime: new Date()
      },
      { new: true }
    );

    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}