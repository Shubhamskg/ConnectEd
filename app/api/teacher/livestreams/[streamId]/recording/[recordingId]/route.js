// app/api/teacher/livestreams/[streamId]/recording/[recordingId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { LiveStream } from '@/models/LiveStream';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Teacher from '@/models/Teacher';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.userId).select('-password');

    if (!teacher) return null;

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

// Get recording playback URL
export async function GET(req, { params }) {
    try {
      const user = await verifyAuth();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
  
      const { streamId, recordingId } = params;
      await connectDB();
  
      // Get recording details
      const livestream = await LiveStream.findOne(
        { 
          _id: new ObjectId(streamId),
          'recordings._id': new ObjectId(recordingId)
        },
        { 'recordings.$': 1 }
      );
  
      if (!livestream || !livestream.recordings[0]) {
        return NextResponse.json(
          { error: 'Recording not found' },
          { status: 404 }
        );
      }
  
      const recording = livestream.recordings[0];
  
      // Generate presigned URL for playback
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: recording.filename
      });
  
      const signedUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 3600 // URL expires in 1 hour
      });
  
      return NextResponse.json({
        success: true,
        url: signedUrl,
        recording: {
          id: recording._id,
          duration: recording.duration,
          createdAt: recording.createdAt
        }
      });
  
    } catch (error) {
      console.error('Error getting recording:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
  
  // Delete recording
  export async function DELETE(req, { params }) {
    try {
      const user = await verifyAuth();
      if (!user || user.role !== 'teacher') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
  
      const { streamId, recordingId } = params;
      await connectDB();
  
      // Get recording filename
      const livestream = await LiveStream.findOne(
        {
          _id: new ObjectId(streamId),
          'recordings._id': new ObjectId(recordingId)
        },
        { 'recordings.$': 1 }
      );
  
      if (!livestream || !livestream.recordings[0]) {
        return NextResponse.json(
          { error: 'Recording not found' },
          { status: 404 }
        );
      }
  
      const filename = livestream.recordings[0].filename;
  
      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename
      });
  
      await s3Client.send(deleteCommand);
  
      // Remove from database
      await LiveStream.updateOne(
        { _id: new ObjectId(streamId) },
        {
          $pull: {
            recordings: { _id: new ObjectId(recordingId) }
          }
        }
      );
  
      return NextResponse.json({
        success: true,
        message: 'Recording deleted successfully'
      });
  
    } catch (error) {
      console.error('Error deleting recording:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }