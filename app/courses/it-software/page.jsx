
// app/courses/it-software/page.jsx
"use client";

import { CourseGrid } from "@/app/components/courses/CourseGrid";
import { CourseFilters } from "@/app/components/courses/CourseFilters";
import { Badge } from "@/app/components/ui/badge";

const itSoftwareCourses = [
  {
    id: 1,
    title: "Cloud Computing Fundamentals",
    description: "Learn cloud architecture and deployment with AWS",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Intermediate",
    category: "IT & Software",
    rating: 4.7,
    studentsEnrolled: 1234,
    duration: "30 hours",
    price: 149.99,
    instructor: {
      name: "James Smith",
      role: "Cloud Architect",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["AWS", "Cloud", "DevOps"]
  },
  {
    id: 2,
    title: "Cybersecurity Essentials",
    description: "Understanding cybersecurity fundamentals and best practices",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Beginner",
    category: "IT & Software",
    rating: 4.8,
    studentsEnrolled: 956,
    duration: "20 hours",
    price: 119.99,
    instructor: {
      name: "Emma Davis",
      role: "Security Expert",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Security", "Network", "Privacy"]
  }
];

export default function ITSoftwareCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IT & Software Courses</h1>
        <p className="text-muted-foreground">
          Master cloud computing, cybersecurity, and IT infrastructure
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Cloud", "Security", "DevOps", "Networks", "Systems"].map((tag) => (
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
          <CourseGrid courses={itSoftwareCourses} />
        </div>
      </div>
    </div>
  );
}