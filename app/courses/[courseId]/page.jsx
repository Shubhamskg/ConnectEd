// app/courses/[courseId]/page.jsx
'use client';

import { useEffect, useState,use } from 'react';
import { useRouter } from 'next/navigation';
import { useuser } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  GraduationCap,
  Star,
  Users,
  PlayCircle,
  CheckCircle,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";

export default function CourseDetailsPage({ params }) {
  const { toast } = useToast();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [user,setUser]=useState(null)
  const {courseId}=use(params)
  useEffect(() => {
    checkAuth()
    fetchCourseDetails();
  }, [courseId]);
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };
  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setCourse(data.course);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/student/login?redirect=/courses/${courseId}`);
      return;
    }
  
    try {
      // Make the API call to enroll
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      // Check if the response is not OK
      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll in course');
      }
  
      setEnrolling(true);
      setLoading(false)
  
      // Show success toast
      toast.success(data.message || 'Successfully enrolled in course');
  
      // Redirect to course content
      router.push(`/dashboard/student/courses/${courseId}`);
    } catch (error) {
      console.error('Enrollment error:', error);
  
      // Show error toast with meaningful error message
      toast.error(error.message || 'An unexpected error occurred. Please try again.');
    }
  };
  

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <Button onClick={() => router.push('/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {course.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>{course.enrolledStudents} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              <span>{course.rating} ({course.totalRatings} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <span>{course.level}</span>
            </div>
          </div>

          {/* Course Content Preview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                A comprehensive curriculum designed by industry experts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample course content - Replace with real data */}
              {[1, 2, 3].map((module) => (
                <div 
                  key={module}
                  className="flex items-start p-4 border rounded-lg hover:bg-gray-50"
                >
                  <PlayCircle className="h-5 w-5 mt-1 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <h3 className="font-medium">Module {module}</h3>
                    <p className="text-sm text-muted-foreground">
                      Introduction to key concepts and fundamentals
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* What You'll Learn */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Array(6).fill("Understand key medical concepts and their applications").map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructor Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Instructor</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{course.teacherName}</h3>
                <p className="text-muted-foreground">{course.status}</p>
                <p className="mt-2">Expert instructor with years of practical experience in the medical field.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-3xl font-bold mb-6">
                ${course.price}
              </div>
              <Button 
  className="w-full mb-4"
  size="lg"
  onClick={handleEnroll}
  disabled={enrolling}
>
  {enrolling ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Enrolling...
    </>
  ) : user ? (
    'Enroll Now'
  ) : (
    'Login to Enroll'
  )}
</Button>
              <div className="space-y-4 text-sm">
                <div className="flex gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{course.duration}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Level</p>
                    <p className="text-muted-foreground">{course.level}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Students</p>
                    <p className="text-muted-foreground">{course.enrolledStudents} enrolled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}