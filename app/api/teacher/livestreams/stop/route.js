// app/api/teacher/livestreams/stop/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { LiveStream } from '@/models/LiveStream';
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

    const { db } = await connectDB();

    // Find the active livestream
    const activeLivestream = await LiveStream.findOne({
      teacherId: new ObjectId(user.id),
      status: 'live'
    });

    if (!activeLivestream) {
      return NextResponse.json(
        { error: 'No active livestream found' },
        { status: 404 }
      );
    }

    const endedAt = new Date();
    const duration = Math.round((endedAt - new Date(activeLivestream.startedAt)) / 1000 / 60); // in minutes

    // Update livestream status and statistics
    await db.collection('livestreams').updateOne(
      { _id: activeLivestream._id },
      {
        $set: {
          status: 'ended',
          endedAt,
          duration,
          'statistics.finalViewerCount': activeLivestream.attendees.length,
          'statistics.totalDuration': duration,
          'statistics.finalChatCount': activeLivestream.chat?.length || 0
        }
      }
    );

    // Create notifications for attendees about replay availability
    if (activeLivestream.settings.allowReplays) {
      const notifications = activeLivestream.attendees.map(attendeeId => ({
        userId: attendeeId,
        type: 'LIVESTREAM_ENDED',
        title: 'Class Recording Available',
        message: `The recording for "${activeLivestream.title}" is now available.`,
        courseId: activeLivestream.courseId,
        livestreamId: activeLivestream._id,
        read: false,
        createdAt: new Date()
      }));

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications);
      }
    }

    // Update course if associated
    if (activeLivestream.courseId) {
      await db.collection('courses').updateOne(
        { _id: activeLivestream.courseId },
        {
          $set: {
            [`livestreams.${activeLivestream._id}.endedAt`]: endedAt,
            [`livestreams.${activeLivestream._id}.duration`]: duration
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Livestream ended successfully',
      statistics: {
        duration,
        totalViewers: activeLivestream.statistics.totalViews,
        peakViewers: activeLivestream.statistics.peakViewers,
        chatMessages: activeLivestream.chat?.length || 0
      }
    });

  } catch (error) {
    console.error('Error ending livestream:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}