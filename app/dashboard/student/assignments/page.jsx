// app/dashboard/teacher/assignments/page.js
import { AssignmentDashboard } from "@/app/components/assignments/AssignmentDashboard";

export default function TeacherAssignmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Assignment Management</h1>
      <AssignmentDashboard userType="teacher" />
    </div>
  );
}