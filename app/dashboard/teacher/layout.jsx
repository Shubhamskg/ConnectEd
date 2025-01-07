// app/dashboard/teacher/layout.jsx
import Sidebar from './Sidebar';

export default function TeacherDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-4 bg-background">
        {children}
      </main>
    </div>
  );
}