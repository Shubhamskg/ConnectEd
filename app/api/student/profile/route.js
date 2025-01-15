import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get auth token from cookie
    const cookieList = await cookies();
    const authToken = cookieList.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid token" }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await connectDB();

    // Find student by ID with selected fields
    const student = await Student.findById(decoded.userId)
      .select('name email verified createdAt updatedAt profile')
      .lean();

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Transform the data for frontend
    const transformedStudent = {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      verified: student.verified,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      profile: {
        avatar: student.profile?.avatar || null,
        bio: student.profile?.bio || '',
        location: student.profile?.location || '',
        website: student.profile?.website || '',
        education: student.profile?.education || [],
        skills: student.profile?.skills || [],
        socialLinks: {
          linkedin: student.profile?.socialLinks?.linkedin || '',
          github: student.profile?.socialLinks?.github || '',
          twitter: student.profile?.socialLinks?.twitter || ''
        }
      }
    };

    return new Response(
      JSON.stringify(transformedStudent),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request) {
  try {
    // Get auth token from cookie
    const cookieList = await cookies();
    const authToken = cookieList.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid token" }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await connectDB();

    // Parse request body
    const updatedData = await request.json();

    // Validate required fields
    if (!updatedData.name) {
      return new Response(
        JSON.stringify({ message: "Name is required" }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update student profile
    const student = await Student.findById(decoded.userId);

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update basic fields
    student.name = updatedData.name;

    // Update profile fields if provided
    if (updatedData.profile) {
      student.profile = {
        ...student.profile || {},
        ...updatedData.profile,
        // Ensure nested objects are properly merged
        socialLinks: {
          ...(student.profile?.socialLinks || {}),
          ...(updatedData.profile.socialLinks || {})
        }
      };
    }

    // Save the updated student
    await student.save();

    // Transform the data for response
    const transformedStudent = {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      verified: student.verified,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      profile: {
        avatar: student.profile?.avatar || null,
        bio: student.profile?.bio || '',
        location: student.profile?.location || '',
        website: student.profile?.website || '',
        education: student.profile?.education || [],
        skills: student.profile?.skills || [],
        socialLinks: {
          linkedin: student.profile?.socialLinks?.linkedin || '',
          github: student.profile?.socialLinks?.github || '',
          twitter: student.profile?.socialLinks?.twitter || ''
        }
      }
    };

    return new Response(
      JSON.stringify(transformedStudent),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}