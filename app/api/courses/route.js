import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Teacher from "@/models/Teacher"; 

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const instructor = searchParams.get('instructor');

    await connectDB();

    // Build query
    let query = {};
    
    // Domain filter
    if (domain) {
      query.domain = { $regex: new RegExp(domain, 'i') };
    }
    
    // Level filter
    if (level) {
      query.level = level;
    }
    
    // Instructor filter
    if (instructor && instructor !== 'all') {
      query.teacherId = instructor;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'teacherName': { $regex: search, $options: 'i' } }
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
        sortQuery.averageRating = -1;
        sortQuery.totalReviews = -1;
        break;
      case 'popular':
        sortQuery.enrolledStudents = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    // Execute queries
    const [total, courses] = await Promise.all([
      Course.countDocuments(query),
      Course.find(query)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('teacherId', 'name avatar specialty bio rating coursesCount studentsCount')
    ]);

    // Transform the data to include instructor information
    const transformedCourses = courses.map(course => {
      const courseObj = course.toObject();
      return {
        ...courseObj,
        teacherName: courseObj.teacherId?.name || courseObj.teacherName,
        teacherAvatar: courseObj.teacherId?.avatar,
        teacherSpecialty: courseObj.teacherId?.specialty,
        instructor: courseObj.teacherId ? {
          id: courseObj.teacherId._id,
          name: courseObj.teacherId.name,
          avatar: courseObj.teacherId.avatar,
          specialty: courseObj.teacherId.specialty,
          bio: courseObj.teacherId.bio,
          rating: courseObj.teacherId.rating,
          coursesCount: courseObj.teacherId.coursesCount,
          studentsCount: courseObj.teacherId.studentsCount
        } : null
      };
    });

    return Response.json({
      courses: transformedCourses,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: page < Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('Courses fetch error:', error);
    return Response.json(
      { message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// Helper function to get featured instructors for a domain
export async function getFeaturedInstructors(domain) {
  try {
    const instructors = await Teacher.aggregate([
      { 
        $match: { 
          role: 'teacher',
          domains: { $regex: new RegExp(domain, 'i') }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'teacherId',
          as: 'courses'
        }
      },
      {
        $addFields: {
          coursesCount: { $size: '$courses' },
          totalStudents: {
            $reduce: {
              input: '$courses',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.enrolledStudents'] }
            }
          },
          averageRating: {
            $avg: '$courses.rating'
          }
        }
      },
      {
        $sort: {
          totalStudents: -1,
          averageRating: -1
        }
      },
      {
        $limit: 4
      },
      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          specialty: 1,
          bio: 1,
          coursesCount: 1,
          totalStudents: 1,
          averageRating: 1
        }
      }
    ]);

    return instructors;
  } catch (error) {
    console.error('Featured instructors fetch error:', error);
    throw error;
  }
}