// app/dashboard/student/assignments/page.js
import { AssignmentDashboard } from "@/app/components/assignments/AssignmentDashboard";

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
      <AssignmentDashboard userType="student" />
    </div>
  );
}