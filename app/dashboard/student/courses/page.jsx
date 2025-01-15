"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Book, 
  Clock, 
  Users,
  GraduationCap,
  BookOpen
} from "lucide-react";

export default function StudentCoursesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [enrolledRes, availableRes] = await Promise.all([
          fetch('/api/student/courses/enrolled'),
          fetch('/api/student/courses/available')
        ]);

        const [enrolledData, availableData] = await Promise.all([
          enrolledRes.json(),
          availableRes.json()
        ]);

        setEnrolledCourses(enrolledData.courses);
        setAvailableCourses(availableData.courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

   const categories = [
    // 'Web Development',
    // 'Mobile Development',
    // 'Data Science',
    // 'Machine Learning',
    // 'DevOps',
    // 'Cloud Computing',
    // 'Cybersecurity',
    // 'Blockchain',
    // 'Game Development',
    'Dentistry',
    'Medical',
    'Nursing',
    'Other'
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const CourseCard = ({ course, isEnrolled = false }) => (
    <Card className="h-full">
      <CardHeader>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{course.enrollments} students</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{course.totalDuration} hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>{course.totalLessons} lessons</span>
            </div>
          </div>
          {isEnrolled && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isEnrolled ? (
          <Button 
            className="w-full"
            onClick={() => router.push(`/dashboard/student/courses/${course.id}/enrolled`)}
          >
            Continue Learning
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={() => router.push(`/dashboard/student/courses/${course.id}`)}
          >
            View Course
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const filteredAvailableCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground">
            Manage and explore your learning journey
          </p>
        </div>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrolled">
            <GraduationCap className="h-4 w-4 mr-2" />
            Enrolled Courses
          </TabsTrigger>
          <TabsTrigger value="available">
            <Book className="h-4 w-4 mr-2" />
            Available Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Enrolled Courses</h3>
              <p className="text-muted-foreground">
                Start your learning journey by enrolling in a course
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isEnrolled={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.toLowerCase()} 
                    value={category.toLowerCase()}
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={levelFilter}
              onValueChange={setLevelFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem 
                    key={level.toLowerCase()} 
                    value={level.toLowerCase()}
                  >
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAvailableCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}