"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Book,
  Calendar,
  Users,
  MessageSquare,
  Video,
  Upload,
  FileText,
  Settings,
  Layout,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: Layout, label: 'Dashboard', href: '/dashboard/teacher' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/teacher/analytics' },
    { icon: Book, label: 'Courses', href: '/dashboard/teacher/courses' },
    { icon: Calendar, label: 'Event', href: '/dashboard/teacher/events' },
    // { icon: FileText, label: 'Assignments', href: '/dashboard/teacher/assignments' },
    // { icon: MessageSquare, label: 'Discussions', href: '/dashboard/teacher/discussions' },
    { icon: Video, label: 'Livestream', href: '/dashboard/teacher/livestream' },
    // { icon: Calendar, label: 'Calendar', href: '/dashboard/teacher/calendar' },
    // { icon: Users, label: 'Students', href: '/dashboard/teacher/students' },
    { icon: Upload, label: 'Upload Course', href: '/dashboard/teacher/courses/upload' },
    { icon: Settings, label: 'Settings', href: '/dashboard/teacher/settings' },
    
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col fixed">
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;