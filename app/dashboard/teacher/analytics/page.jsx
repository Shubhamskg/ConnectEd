import { CourseAnalytics } from "@/app/components/analytics/CourseAnalytics";

export default function TeacherDashboard() {
    const courseId = "your_course_id" // Replace with the actual course ID
    return(
        <CourseAnalytics courseId={courseId} />
    )
}