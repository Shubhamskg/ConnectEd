
// app/courses/design/page.jsx
"use client";

import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { Badge } from "@/components/ui/badge";

const designCourses = [
  {
    id: 1,
    title: "UI/UX Design Fundamentals",
    description: "Master the principles of user interface and experience design",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Beginner",
    category: "Design",
    rating: 4.8,
    studentsEnrolled: 945,
    duration: "18 hours",
    price: 89.99,
    instructor: {
      name: "Lisa Wong",
      role: "Senior UX Designer",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["UI", "UX", "Figma", "Design Thinking"]
  },
  {
    id: 2,
    title: "Advanced Graphic Design",
    description: "Create stunning visual designs using modern tools",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Advanced",
    category: "Design",
    rating: 4.7,
    studentsEnrolled: 723,
    duration: "22 hours",
    price: 99.99,
    instructor: {
      name: "David Miller",
      role: "Creative Director",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Adobe", "Illustration", "Typography"]
  }
];

export default function DesignCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Design Courses</h1>
        <p className="text-muted-foreground">
          Learn UI/UX, graphic design, and visual communication
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["UI/UX", "Graphic Design", "Typography", "Figma", "Adobe"].map((tag) => (
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
          <CourseGrid courses={designCourses} />
        </div>
      </div>
    </div>
  );
}
