// app/dashboard/student/courses/page.jsx
import { CourseList } from "@/app/components/courses/CourseList";

export default function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
          <p className="text-muted-foreground">
            Discover new learning opportunities
          </p>
        </div>
      </div>
      <CourseList userType="student" />
    </div>
  );
}