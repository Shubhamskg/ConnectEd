// app/api/categories/request/route.js
import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subject, description, qualifications } = await request.json();

    if (!subject || !description || !qualifications) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectDB();

    await db.collection('categoryRequests').insertOne({
      subject,
      description,
      qualifications,
      teacherId: session.user.id,
      teacherName: session.user.name,
      teacherEmail: session.user.email,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Category request submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Category request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit category request' },
      { status: 500 }
    );
  }
}