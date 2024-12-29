// app/dashboard/student/layout.js
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "./sidebar/page";

export default function StudentDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      <div className="flex">
        
        
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}