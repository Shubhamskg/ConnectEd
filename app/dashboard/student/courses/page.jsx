// app/dashboard/student/courses/page.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import Image from "next/image";

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Introduction to Dental Anatomy",
      instructor: "Dr. Sarah Smith",
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      image:"data:image/jpeg;base64,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"
    },
    {
      id: 1,
      title: "Introduction to Dental Anatomy",
      instructor: "Dr. Sarah Smith",
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      image:"data:image/jpeg;base64,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"
    },
    {
      id: 2,
      title: "Clinical Procedures Fundamentals",
      instructor: "Dr. Michael Johnson",
      progress: 45,
      totalLessons: 15,
      completedLessons: 7,
      image: "data:image/jpeg;base64,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"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">Continue learning where you left off</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10 w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <img
                src={course.image}
                alt={course.title}
                className="object-cover w-full h-full"
              />
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.instructor}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                    <span>{course.progress}% Complete</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="bg-[#3b82f6] hover:bg-[#2563eb] flex-1">
                    Continue Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}