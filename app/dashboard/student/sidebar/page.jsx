// app/components/dashboard/Sidebar.jsx
"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";  
import { Button } from "@/app/components/ui/button";
import {
  BookOpen,
  Layout,
  FileText,
  MessageSquare,
  BarChart,
  Clock,
  Settings,
  LogOut,
  GraduationCap
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard/student",
    icon: Layout
  },
  {
    name: "Courses",
    href: "/dashboard/student/courses",
    icon: BookOpen
  },
  {
    name: "Assignments",
    href: "/dashboard/student/assignments",
    icon: FileText
  },
  {
    name: "Discussions",
    href: "/dashboard/student/discussions",
    icon: MessageSquare
  },
  {
    name: "Performance",
    href: "/dashboard/student/performance",
    icon: BarChart
  },
  {
    name: "Schedule",
    href: "/dashboard/student/schedule",
    icon: Clock
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[#3b82f6]" />
          <span className="font-bold text-xl">ConnectEd</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#3b82f6] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t">
        <Link href="/dashboard/student/settings">
          <span
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/dashboard/student/settings"
                ? "bg-[#3b82f6] text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </span>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 mt-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}