// app/dashboard/student/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Book, Calendar, TrendingUp, 
  Clock, GraduationCap, Activity, Award,
  Video, Users, MessageSquare
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    upcomingEvents: 0,
    averageProgress: 0,
    totalAssignments: 0,
    completionRate: 0
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/student/profile'),
          fetch('/api/student/stats')
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            router.push('/auth/student/login');
            return;
          }
          throw new Error('Failed to fetch profile data');
        }

        const [profileData, statsData] = await Promise.all([
          profileRes.json(),
          statsRes.json()
        ]);

        setStudent(profileData?.student);
        setStats(statsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => router.push('/auth/student/login')}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {student?.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => router.push('/dashboard/student/live')}>
            <Video className="h-4 w-4 mr-2" />
            Join Live Class
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/student/courses')}
          >
            <Book className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events in next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Due assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              Courses completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button 
          variant="outline" 
          className="h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => router.push('/dashboard/student/assignments')}
        >
          <Clock className="h-6 w-6" />
          <span>View Assignments</span>
        </Button>
        
        <Button 
          variant="outline"
          className="h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => router.push('/dashboard/student/discussions')}
        >
          <MessageSquare className="h-6 w-6" />
          <span>Join Discussions</span>
        </Button>

        <Button 
          variant="outline"
          className="h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => router.push('/dashboard/student/events')}
        >
          <Calendar className="h-6 w-6" />
          <span>Browse Events</span>
        </Button>

        <Button 
          variant="outline"
          className="h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => router.push('/dashboard/student/progress')}
        >
          <Activity className="h-6 w-6" />
          <span>Track Progress</span>
        </Button>
      </div>
    </div>
  );
}