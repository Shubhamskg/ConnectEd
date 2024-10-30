// app/courses/development/page.jsx
"use client";

import { CourseGrid } from "@/app/components/courses/CourseGrid";
import { CourseFilters } from "@/app/components/courses/CourseFilters";
import { Badge } from "@/app/components/ui/badge";

const developmentCourses = [
  {
    id: 1,
    title: "Advanced Web Development",
    description: "Master modern web development with React, Node.js, and more",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Advanced",
    category: "Development",
    rating: 4.8,
    studentsEnrolled: 1234,
    duration: "20 hours",
    price: 99.99,
    instructor: {
      name: "Sarah Johnson",
      role: "Senior Developer",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["React", "Node.js", "JavaScript"]
  },
  {
    id: 2,
    title: "Full Stack Development",
    description: "Become a full stack developer with MERN stack",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Intermediate",
    category: "Development",
    rating: 4.7,
    studentsEnrolled: 892,
    duration: "30 hours",
    price: 129.99,
    instructor: {
      name: "Mike Chen",
      role: "Tech Lead",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["MongoDB", "Express", "React", "Node.js"]
  }
];

export default function DevelopmentCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Development Courses</h1>
        <p className="text-muted-foreground">
          Learn programming, web development, and software engineering
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["React", "JavaScript", "Python", "Node.js", "Full Stack"].map((tag) => (
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
          <CourseGrid courses={developmentCourses} />
        </div>
      </div>
    </div>
  );
}