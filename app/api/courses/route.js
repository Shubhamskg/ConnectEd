// app/api/courses/route.js
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;

    await connectDB();

    // Build query
    let query = {};
    if (domain) query.domain = domain;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'price-asc':
        sortQuery.price = 1;
        break;
      case 'price-desc':
        sortQuery.price = -1;
        break;
      case 'rating':
        sortQuery.rating = -1;
        break;
      case 'popular':
        sortQuery.enrolledStudents = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('instructor', 'name');

    return Response.json({
      courses,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Courses fetch error:', error);
    return Response.json(
      { message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
