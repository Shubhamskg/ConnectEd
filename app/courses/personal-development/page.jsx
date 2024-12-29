
// app/courses/personal-development/page.jsx
"use client";

import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { Badge } from "@/components/ui/badge";

const personalDevCourses = [
  {
    id: 1,
    title: "Productivity Mastery",
    description: "Boost your productivity and achieve your goals",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "All Levels",
    category: "Personal Development",
    rating: 4.9,
    studentsEnrolled: 2345,
    duration: "10 hours",
    price: 59.99,
    instructor: {
      name: "Robert Brown",
      role: "Productivity Coach",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Productivity", "Time Management", "Goals"]
  },
  {
    id: 2,
    title: "Leadership & Communication",
    description: "Develop essential leadership and communication skills",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Intermediate",
    category: "Personal Development",
    rating: 4.7,
    studentsEnrolled: 1567,
    duration: "15 hours",
    price: 79.99,
    instructor: {
      name: "Laura Martinez",
      role: "Leadership Coach",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Leadership", "Communication", "Management"]
  }
];

export default function PersonalDevelopmentCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personal Development Courses</h1>
        <p className="text-muted-foreground">
          Enhance your skills in leadership, productivity, and personal growth
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Leadership", "Productivity", "Communication", "Goal Setting", "Mindfulness"].map((tag) => (
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
          <CourseGrid courses={personalDevCourses} />
        </div>
      </div>
    </div>
  );
}
