"use client"
import { CourseAnalytics } from "@/app/components/analytics/CourseAnalytics";

export default function TeacherDashboard() {
    const courseId = "your_course_id" // Replace with the actual course ID
    return(
        <CourseAnalytics courseId={courseId} />
    )
}

// app/dashboard/teacher/analytics/page.jsx
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
// import {
//   BarChart,
//   LineChart,
//   Line,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { 
//   Users, 
//   BookOpen, 
//   GraduationCap, 
//   TrendingUp,
//   Clock,
//   Star 
// } from "lucide-react";

// const studentData = [
//   { month: 'Jan', students: 65, completion: 45, engagement: 80 },
//   { month: 'Feb', students: 75, completion: 55, engagement: 85 },
//   { month: 'Mar', students: 85, completion: 60, engagement: 88 },
//   { month: 'Apr', students: 82, completion: 63, engagement: 90 },
//   { month: 'May', students: 88, completion: 68, engagement: 92 },
//   { month: 'Jun', students: 90, completion: 70, engagement: 95 },
// ];

// const courseData = [
//   { name: 'Web Development', students: 120, rating: 4.8, completion: 85 },
//   { name: 'JavaScript', students: 90, rating: 4.6, completion: 78 },
//   { name: 'React', students: 150, rating: 4.9, completion: 92 },
//   { name: 'Node.js', students: 80, rating: 4.7, completion: 75 },
// ];

// export default function TeacherAnalyticsPage() {
//   const stats = {
//     totalStudents: 440,
//     totalCourses: 4,
//     avgCompletion: 82,
//     avgRating: 4.75,
//     totalHours: 256,
//     revenue: 15680,
//   };

//   return (
//     <div className="space-y-8">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
//         <p className="text-muted-foreground">
//           Track your teaching performance and student engagement
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.totalStudents}</div>
//             <p className="text-xs text-muted-foreground">
//               Across all courses
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
//             <BookOpen className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.totalCourses}</div>
//             <p className="text-xs text-muted-foreground">
//               Currently published
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
//             <GraduationCap className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
//             <p className="text-xs text-muted-foreground">
//               Course completion rate
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
//             <Star className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.avgRating}</div>
//             <p className="text-xs text-muted-foreground">
//               Out of 5.0
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Teaching Hours</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.totalHours}</div>
//             <p className="text-xs text-muted-foreground">
//               Total content length
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${stats.revenue}</div>
//             <p className="text-xs text-muted-foreground">
//               Lifetime earnings
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid gap-4 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Student Growth</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={studentData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line 
//                     type="monotone" 
//                     dataKey="students" 
//                     stroke="#8884d8" 
//                     name="Students"
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="completion" 
//                     stroke="#82ca9d" 
//                     name="Completion %"
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="engagement" 
//                     stroke="#ffc658" 
//                     name="Engagement %"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Course Performance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={courseData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="students" fill="#8884d8" name="Students" />
//                   <Bar dataKey="completion" fill="#82ca9d" name="Completion %" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
