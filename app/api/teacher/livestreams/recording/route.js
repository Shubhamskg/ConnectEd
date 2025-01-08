// app/api/teacher/livestreams/recording/route.js
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

// Start recording
export async function POST(req) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const recordingBlob = formData.get('recording');
    const streamId = formData.get('streamId');

    if (!recordingBlob || !streamId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique filename
    const filename = `recordings/${streamId}/${Date.now()}.webm`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename,
      Body: Buffer.from(await recordingBlob.arrayBuffer()),
      ContentType: 'video/webm'
    });

    await s3Client.send(uploadCommand);

    // Update livestream record
    await LiveStream.updateOne(
      { _id: new ObjectId(streamId) },
      {
        $push: {
          recordings: {
            _id: new ObjectId(),
            filename,
            duration: formData.get('duration'),
            createdAt: new Date()
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Recording saved successfully'
    });

  } catch (error) {
    console.error('Error saving recording:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

