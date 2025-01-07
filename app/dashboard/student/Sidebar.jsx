"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  MessageSquare,
  Video,
  ActivitySquare,
  User2,
  TrendingUp,
  Calendar,
  Settings,
  GraduationCap,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard/student'
    },
    {
      icon: BookOpen,
      label: 'My Courses',
      href: '/dashboard/student/courses'
    },
    { icon: Calendar, label: 'Event', href: '/dashboard/student/events' },
    
    // {
    //   icon: FileText,
    //   label: 'Assignments',
    //   href: '/dashboard/student/assignments'
    // },
    // {
    //   icon: MessageSquare,
    //   label: 'Discussions',
    //   href: '/dashboard/student/discussions'
    // },
    {
      icon: Video,
      label: 'Live Sessions',
      href: '/dashboard/student/live'
    },
    // {
    //   icon: ActivitySquare,
    //   label: 'Performance',
    //   href: '/dashboard/student/performance'
    // },
    // {
    //   icon: Calendar,
    //   label: 'Schedule',
    //   href: '/dashboard/student/schedule'
    // },
    // {
    //   icon: GraduationCap,
    //   label: 'Progress',
    //   href: '/dashboard/student/progress'
    // },
    {
      icon: User2,
      label: 'Profile',
      href: '/dashboard/student/profile'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard/student/settings'
    },
  ];

  return (
<div className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* Navigation Menu */}
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

      {/* User Profile Section */}
      <div className="p-4 border-t">
        <Link
          href="/dashboard/student/profile"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-secondary"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <User2 className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Student Name</p>
            <p className="text-xs text-muted-foreground truncate">student@example.com</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;