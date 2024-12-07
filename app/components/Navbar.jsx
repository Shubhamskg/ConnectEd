// components/Navbar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/components/Notifications/NotificationContext";
import { NotificationDropdown } from "@/app/components/Notifications/NotificationDropdown";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  User,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Layout,
  FileText,
  MessageSquare,
  BarChart,
  Clock,
  Search,
  Video,
  Award,
  Bookmark,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "Dentistry", href: "/courses/dentistry" },
  ];

  const getNavItems = () => {
    if (user?.role === 'teacher') {
      return [
        { 
          label: "Dashboard", 
          icon: Layout, 
          href: "/dashboard/teacher",
          badge: "New"
        },
        { 
          label: "My Courses", 
          icon: BookOpen, 
          href: "/dashboard/teacher/courses"
        },
        { 
          label: "Students", 
          icon: GraduationCap, 
          href: "/dashboard/teacher/students",
          badge: user?.newStudentsCount > 0 ? `${user.newStudentsCount} new` : null
        },
        { 
          label: "Earnings", 
          icon: BarChart, 
          href: "/dashboard/teacher/earnings"
        },
      ];
    }
    return [
      { 
        label: "My Learning", 
        icon: BookOpen, 
        href: "/dashboard/student"
      },
      { 
        label: "Assignments", 
        icon: FileText, 
        href: "/dashboard/student/assignments",
        badge: user?.pendingAssignmentsCount > 0 ? `${user.pendingAssignmentsCount} due` : null
      },
      { 
        label: "Discussions", 
        icon: MessageSquare, 
        href: "/dashboard/student/discussions"
      },
      { 
        label: "Schedule", 
        icon: Clock, 
        href: "/dashboard/student/schedule"
      },
    ];
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        ${isScrolled ? "shadow-sm" : ""}`}
    >
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4">
          <div className="container mx-auto space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Search courses..." 
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                onClick={() => setIsMobileSearchOpen(false)}
              >
                Cancel
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recent Searches
              </h3>
              <div className="space-y-1">
                {['Dental Anatomy', 'Clinical Procedures'].map((search) => (
                  <Button
                    key={search}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#3b82f6]">ConnectEd</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Categories</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categories.map((category) => (
                <DropdownMenuItem key={category.name}>
                  <Link href={category.href} className="w-full">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/request-category" className="flex items-center w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Request New Category
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" asChild>
            <Link href="/courses">All Courses</Link>
          </Button>

          {!user && (
            <Button variant="ghost" asChild>
              <Link href="/auth/teacher/signup">Become a Teacher</Link>
            </Button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              <NotificationDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getNavItems().map((item) => (
                    <DropdownMenuItem key={item.label}>
                      <Link href={item.href} className="flex items-center w-full">
                        <item.icon className="h-4 w-4 mr-2" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard/settings" className="flex items-center w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push('/auth/student/login')}>
                Log In
              </Button>
              <Button 
                className="bg-[#3b82f6] hover:bg-[#2563eb]"
                onClick={() => router.push('/auth/student/signup')}
              >
                Sign Up
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {getNavItems().map((item) => (
                        <Button
                          key={item.label}
                          variant="ghost"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                            {item.badge && (
                              <Badge variant="secondary" className="ml-2">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </Button>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/dashboard/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Link href="/courses/dentistry" className="block py-2">
                        Dentistry Courses
                      </Link>
                      <Link href="/courses" className="block py-2">
                        All Courses
                      </Link>
                      <Link href="/auth/teacher/signup" className="block py-2">
                        Become a Teacher
                      </Link>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/auth/student/login')}
                      >
                        Log In
                      </Button>
                      <Button
                        className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
                        onClick={() => router.push('/auth/student/signup')}
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}