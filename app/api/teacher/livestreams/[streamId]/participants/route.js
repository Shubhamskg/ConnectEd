// app/api/teacher/livestreams/[streamId]/participants/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { LiveStream } from '@/models/LiveStream';
import { use } from 'react';
import Enrollment from '@/models/Enrollment';
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
// Join livestream
export async function POST(req, { params }) {
  try {
    const user = await verifyAuth();
                      if (!user) {
                        return NextResponse.json(
                          { error: 'Unauthorized' },
                          { status: 401 }
                        );
                      }

    const { streamId } =use(params);
    await connectDB();

    // Verify livestream is active
    const livestream = await LiveStream.findOne({
      _id: new ObjectId(streamId),
      status: 'live'
    });

    if (!livestream) {
      return NextResponse.json(
        { error: 'Livestream not found or has ended' },
        { status: 404 }
      );
    }

    // If it's a course livestream, verify enrollment
    if (livestream.courseId) {
      const enrollment = await Enrollment.findOne({
        courseId: livestream.courseId,
        studentId: new ObjectId(user.id)
      });

      if (!enrollment && user.role !== 'teacher') {
        return NextResponse.json(
          { error: 'You must be enrolled in the course to join this livestream' },
          { status: 403 }
        );
      }
    }

    // Add participant and update statistics
    await LiveStream.updateOne(
      { _id: new ObjectId(streamId) },
      {
        $addToSet: { attendees: new ObjectId(user.id) },
        $inc: { 'statistics.totalViews': 1 },
        $max: { 
          'statistics.peakViewers': { 
            $size: '$attendees' 
          } 
        }
      }
    );

    // Create participation record
    await db.collection('livestreamParticipation').insertOne({
      livestreamId: new ObjectId(streamId),
      userId: new ObjectId(user.id),
      joinedAt: new Date(),
      lastActive: new Date(),
      watchTime: 0,
      interactions: 0
    });

    return NextResponse.json({
      success: true,
      message: 'Joined livestream successfully'
    });

  } catch (error) {
    console.error('Error joining livestream:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Leave livestream
export async function DELETE(req, { params }) {
  try {
    const user = await verifyAuth();
                      if (!user) {
                        return NextResponse.json(
                          { error: 'Unauthorized' },
                          { status: 401 }
                        );
                      }

    const { streamId } = use(params)
    await connectDB();

    // Update participation record with total watch time
    const participation = await db.collection('livestreamParticipation').findOne({
      livestreamId: new ObjectId(streamId),
      userId: new ObjectId(user.id)
    });

    if (participation) {
      const watchTime = Math.round(
        (new Date() - new Date(participation.joinedAt)) / 1000 / 60
      );

      await db.collection('livestreamParticipation').updateOne(
        { _id: participation._id },
        {
          $set: {
            leftAt: new Date(),
            watchTime
          }
        }
      );
    }

    // Remove from active attendees
    await db.collection('livestreams').updateOne(
      { _id: new ObjectId(streamId) },
      {
        $pull: { attendees: new ObjectId(user.id) }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Left livestream successfully'
    });

  } catch (error) {
    console.error('Error leaving livestream:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// app/api/teacher/livestreams/[streamId]/participants/route.js

// ... (previous code remains the same)

// Update activity status
export async function PATCH(req, { params }) {
    try {
      const user = await verifyAuth();
                        if (!user) {
                          return NextResponse.json(
                            { error: 'Unauthorized' },
                            { status: 401 }
                          );
                        }
  
      const { streamId } =use(params);
      const { activityType = 'heartbeat' } = await req.json();
  
      const { db } = await connectDB();
  
      // Update last active timestamp and interaction count
      const updateData = {
        lastActive: new Date()
      };
  
      if (activityType !== 'heartbeat') {
        updateData.interactions = { $inc: 1 };
      }
  
      await db.collection('livestreamParticipation').updateOne(
        {
          livestreamId: new ObjectId(streamId),
          userId: new ObjectId(user.id)
        },
        { $set: updateData }
      );
  
      // Get current participants count
      const livestream = await db.collection('livestreams').findOne(
        { _id: new ObjectId(streamId) },
        { projection: { attendees: 1 } }
      );
  
      return NextResponse.json({
        success: true,
        currentParticipants: livestream?.attendees?.length || 0
      });
  
    } catch (error) {
      console.error('Error updating activity status:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
  
  // Get participant list (teacher only)
  export async function GET(req, { params }) {
    try {
      const user = await verifyAuth();
                        if (!user) {
                          return NextResponse.json(
                            { error: 'Unauthorized' },
                            { status: 401 }
                          );
                        }
      const { streamId } = use(params);
      const { db } = await connectDB();
  
      // Get livestream participants with user details
      const participants = await db.collection('livestreamParticipation')
        .aggregate([
          {
            $match: {
              livestreamId: new ObjectId(streamId)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $project: {
              _id: 1,
              userId: 1,
              joinedAt: 1,
              lastActive: 1,
              watchTime: 1,
              interactions: 1,
              'user.name': 1,
              'user.email': 1,
              'user.avatar': 1,
              isActive: {
                $gt: [
                  '$lastActive',
                  new Date(Date.now() - 5 * 60 * 1000) // Consider active if last active within 5 minutes
                ]
              }
            }
          },
          {
            $sort: { joinedAt: -1 }
          }
        ])
        .toArray();
  
      // Get engagement metrics
      const metrics = {
        totalParticipants: participants.length,
        activeParticipants: participants.filter(p => p.isActive).length,
        averageWatchTime: participants.reduce((acc, p) => acc + (p.watchTime || 0), 0) / participants.length,
        totalInteractions: participants.reduce((acc, p) => acc + (p.interactions || 0), 0)
      };
  
      return NextResponse.json({
        success: true,
        participants,
        metrics
      });
  
    } catch (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
  
  // Remove participant (teacher only)
  export async function PUT(req, { params }) {
    try {
      const user = await verifyAuth();
                        if (!user) {
                          return NextResponse.json(
                            { error: 'Unauthorized' },
                            { status: 401 }
                          );
                        }
  
      const { streamId } = use(params);
      const { userId, reason } = await req.json();
  
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }
  
      const { db } = await connectDB();
  
      // Remove participant
      await Promise.all([
        // Remove from active attendees
        db.collection('livestreams').updateOne(
          { _id: new ObjectId(streamId) },
          { $pull: { attendees: new ObjectId(userId) } }
        ),
        // Update participation record
        db.collection('livestreamParticipation').updateOne(
          {
            livestreamId: new ObjectId(streamId),
            userId: new ObjectId(userId)
          },
          {
            $set: {
              leftAt: new Date(),
              removedByTeacher: true,
              removalReason: reason || 'Removed by teacher'
            }
          }
        )
      ]);
  
      return NextResponse.json({
        success: true,
        message: 'Participant removed successfully'
      });
  
    } catch (error) {
      console.error('Error removing participant:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }