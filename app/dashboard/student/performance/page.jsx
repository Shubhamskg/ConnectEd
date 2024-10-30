// app/dashboard/student/performance/page.js
import { StudentPerformance } from "@/app/components/performance/StudentPerformance";

export default function MyPerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Performance</h1>
      </div>
      <StudentPerformance />
    </div>
  );
}