
// app/courses/marketing/page.jsx
"use client";

import { CourseGrid } from "@/app/components/courses/CourseGrid";
import { CourseFilters } from "@/app/components/courses/CourseFilters";
import { Badge } from "@/app/components/ui/badge";

const marketingCourses = [
  {
    id: 1,
    title: "Digital Marketing Mastery",
    description: "Comprehensive guide to digital marketing strategies",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Intermediate",
    category: "Marketing",
    rating: 4.9,
    studentsEnrolled: 1567,
    duration: "25 hours",
    price: 129.99,
    instructor: {
      name: "Rachel Green",
      role: "Marketing Strategist",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["SEO", "Social Media", "Content Marketing"]
  },
  {
    id: 2,
    title: "Social Media Marketing",
    description: "Build and grow your brand on social media platforms",
    thumbnail: "/placeholders/course-1.jpeg",
    level: "Beginner",
    category: "Marketing",
    rating: 4.6,
    studentsEnrolled: 892,
    duration: "15 hours",
    price: 79.99,
    instructor: {
      name: "Tom Wilson",
      role: "Social Media Expert",
      avatar: "/placeholders/course-1.jpeg",
    },
    tags: ["Instagram", "Facebook", "LinkedIn"]
  }
];

export default function MarketingCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketing Courses</h1>
        <p className="text-muted-foreground">
          Master digital marketing, social media, and growth strategies
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Digital Marketing", "SEO", "Social Media", "Content", "Analytics"].map((tag) => (
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
          <CourseGrid courses={marketingCourses} />
        </div>
      </div>
    </div>
  );
}
