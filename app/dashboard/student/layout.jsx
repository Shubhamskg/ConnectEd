// app/dashboard/student/layout.jsx
export default function StudentDashboardLayout({ children }) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }
  