// app/dashboard/teacher/courses/[courseId]/analytics/page.js
import { CourseAnalytics } from "@/components/analytics/CourseAnalytics";

export default function CourseAnalyticsPage({ params }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Course Analytics</h1>
      </div>
      <CourseAnalytics courseId={params.courseId} />
    </div>
  );
}