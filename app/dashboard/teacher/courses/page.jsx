// app/dashboard/teacher/courses/page.jsx
import { CourseList } from "@/app/components/courses/CourseList";

export default function TeacherCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage and track your course content
          </p>
        </div>
      </div>
      <CourseList userType="teacher" />
    </div>
  );
}