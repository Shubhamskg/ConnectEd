"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  User2,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    {
      icon: Calendar,
      label: 'Event',
      href: '/dashboard/student/events'
    },
    {
      icon: Video,
      label: 'Live Sessions',
      href: '/dashboard/student/livestreams'
    },
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
    <div 
      className={`relative min-h-screen bg-white border-r shadow-sm transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border rounded-full p-1.5 shadow-md hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Logo Section */}
      {/* <div className="p-4 border-b">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="ml-3 font-bold text-lg">Dashboard</span>
          )}
        </div>
      </div> */}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
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
          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User2 className="h-4 w-4 text-gray-600" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                Student Name
              </p>
              <p className="text-xs text-gray-500 truncate">
                student@example.com
              </p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;