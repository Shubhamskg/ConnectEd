// app/dashboard/student/schedule/page.js
import { ScheduleView } from '@/app/components/calendar/ScheduleView';

export default function StudentSchedulePage() {
  return <ScheduleView userType="student" />;
}