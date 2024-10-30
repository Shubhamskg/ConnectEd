// components/courses/CourseGrid.jsx
import { CourseCard } from "./CourseCard";
import { CourseListItem } from "./CourseListItem";

// Sample course data
const sampleCourses = [
  {
    id: 1,
    title: "Advanced Web Development",
    description: "Learn modern web development techniques with React, Node.js, and more.",
    thumbnail: "/api/placeholder/400/300",
    level: "Intermediate",
    category: "Development",
    rating: 4.8,
    studentsEnrolled: 1234,
    duration: "20 hours",
    lessons: 42,
    price: 99.99,
    instructor: {
      name: "Sarah Johnson",
      role: "Senior Developer",
      avatar: "/api/placeholder/40/40",
    },
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    description: "Master the principles of user interface and user experience design.",
    thumbnail: "/api/placeholder/400/300",
    level: "Beginner",
    category: "Design",
    rating: 4.6,
    studentsEnrolled: 856,
    duration: "15 hours",
    lessons: 35,
    price: 79.99,
    instructor: {
      name: "Michael Chen",
      role: "UX Designer",
      avatar: "/api/placeholder/40/40",
    },
  },
  {
    id: 3,
    title: "Data Science Essentials",
    description: "Introduction to data analysis, machine learning, and statistics.",
    thumbnail: "/api/placeholder/400/300",
    level: "Intermediate",
    category: "Data Science",
    rating: 4.7,
    studentsEnrolled: 1567,
    duration: "25 hours",
    lessons: 48,
    price: 129.99,
    instructor: {
      name: "Alex Turner",
      role: "Data Scientist",
      avatar: "/api/placeholder/40/40",
    },
  },
];

export function CourseGrid({ courses = sampleCourses, view = 'grid', userType = 'student' }) {
  // Loading state
  if (!courses) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-[400px] rounded-lg border-2 border-dashed border-gray-200 p-6 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  // List view
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {courses.map((course) => (
          <CourseListItem
            key={course.id}
            course={course}
            userType={userType}
          />
        ))}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className={
      view === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
    }>
      {courses.map((course) => (
        view === 'grid' ? (
          <CourseCard key={course.id} course={course} />
        ) : (
          <CourseListItem key={course.id} course={course} />
        )
      ))}
    </div>
  );
}
