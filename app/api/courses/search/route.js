// app/api/courses/search/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Teacher from "@/models/Teacher";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const price = searchParams.get('price');
    const sort = searchParams.get('sort') || 'popular';

    await connectDB();

    // Build query
    let query = {
      status: 'published' // Only show published courses
    };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    // Level filter
    if (level && level !== 'all') {
      query.level = level;
    }

    // Price filter
    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
    }

    // Build sort object
    let sortQuery = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'price-low':
        sortQuery = { price: 1 };
        break;
      case 'price-high':
        sortQuery = { price: -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1 };
        break;
      case 'popular':
      default:
        sortQuery = { enrolledStudents: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    // Get courses with instructor information
    const [courses, total] = await Promise.all([
      Course.aggregate([
        { $match: query },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: limit },
        // Lookup instructor details
        {
          $lookup: {
            from: 'teachers',
            localField: 'teacherId',
            foreignField: '_id',
            as: 'instructor'
          }
        },
        // Unwind instructor array (converts array to object)
        { $unwind: '$instructor' },
        // Project only needed fields
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            thumbnail: 1,
            price: 1,
            level: 1,
            category: 1,
            rating: 1,
            enrolledStudents: 1,
            totalDuration: 1,
            featured: 1,
            createdAt: 1,
            'instructor._id': 1,
            'instructor.name': 1,
            'instructor.avatar': 1,
            'instructor.expertise': 1
          }
        }
      ]),
      Course.countDocuments(query)
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Format response
    const formattedCourses = courses.map(course => ({
      ...course,
      instructor: {
        id: course.instructor._id,
        name: course.instructor.name,
        avatar: course.instructor.avatar,
        expertise: course.instructor.expertise
      }
    }));

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses: total,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}