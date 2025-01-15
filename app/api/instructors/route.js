import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'rating';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const specialty = searchParams.get('specialty');

    await connectDB();

    // Build query
    let query = { role: 'teacher' };
    
    // Domain filter
    if (domain) {
      query.domains = { $regex: new RegExp(domain, 'i') };
    }
    
    // Specialty filter
    if (specialty) {
      query.specialty = { $regex: new RegExp(specialty, 'i') };
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }

    // Aggregate pipeline for instructor statistics
    const aggregatePipeline = [
      { $match: query },
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
      }
    ];

    // Add sort stage based on sort parameter
    let sortStage = {};
    switch (sort) {
      case 'students':
        sortStage = { totalStudents: -1 };
        break;
      case 'courses':
        sortStage = { coursesCount: -1 };
        break;
      case 'rating':
        sortStage = { averageRating: -1 };
        break;
      case 'name':
        sortStage = { name: 1 };
        break;
      default:
        sortStage = { averageRating: -1 };
    }
    
    aggregatePipeline.push({ $sort: sortStage });

    // Add pagination stages
    aggregatePipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          specialty: 1,
          bio: 1,
          domains: 1,
          coursesCount: 1,
          totalStudents: 1,
          averageRating: 1,
          createdAt: 1
        }
      }
    );

    // Execute queries
    const [instructors, totalCount] = await Promise.all([
      Teacher.aggregate(aggregatePipeline),
      Teacher.countDocuments(query)
    ]);

    // Transform ratings to have max 1 decimal place
    const transformedInstructors = instructors.map(instructor => ({
      ...instructor,
      averageRating: instructor.averageRating ? Number(instructor.averageRating.toFixed(1)) : 0
    }));

    return Response.json({
      instructors: transformedInstructors,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasMore: page < Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Instructors fetch error:', error);
    return Response.json(
      { message: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}