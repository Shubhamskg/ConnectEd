// app/dashboard/student/discussions/page.js
import { DiscussionBoard } from "@/app/components/discussion/DiscussionBoard";

export default function StudentDiscussionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Course Discussions</h1>
      <DiscussionBoard userType="student" />
    </div>
  );
}