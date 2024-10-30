// app/courses/business/page.jsx
"use client";

import { CourseGrid } from "@/app/components/courses/CourseGrid";
import { CourseFilters } from "@/app/components/courses/CourseFilters";
import { Badge } from "@/app/components/ui/badge";

const businessCourses = [
  {
    id: 1,
    title: "Business Strategy & Management",
    description: "Learn essential business management skills and strategies",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Intermediate",
    category: "Business",
    rating: 4.6,
    studentsEnrolled: 756,
    duration: "15 hours",
    price: 89.99,
    instructor: {
      name: "Emily Parker",
      role: "Business Consultant",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Management", "Strategy", "Leadership"]
  },
  {
    id: 2,
    title: "Digital Marketing for Business",
    description: "Master digital marketing strategies for business growth",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Beginner",
    category: "Business",
    rating: 4.5,
    studentsEnrolled: 623,
    duration: "12 hours",
    price: 79.99,
    instructor: {
      name: "Alex Thompson",
      role: "Marketing Director",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Marketing", "Digital", "Strategy"]
  }
];

export default function BusinessCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Courses</h1>
        <p className="text-muted-foreground">
          Develop business skills for entrepreneurship and management
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Management", "Strategy", "Marketing", "Leadership", "Finance"].map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block">
          <CourseFilters />
        </div>
        <div className="lg:col-span-3">
          <CourseGrid courses={businessCourses} />
        </div>
      </div>
    </div>
  );
}