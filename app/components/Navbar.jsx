// components/Navbar.jsx
"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";
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
  SheetClose,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Bell,
  BookOpen,
  Graduation,
  Users,
  BarChart,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with your auth state
  const [userRole, setUserRole] = useState(null); // 'student' or 'teacher'
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mock categories - replace with your actual categories
  const categories = [
    { name: "Development", href: "/courses/development" },
    { name: "Business", href: "/courses/business" },
    { name: "Design", href: "/courses/design" },
    { name: "Marketing", href: "/courses/marketing" },
    { name: "IT & Software", href: "/courses/it-software" },
    { name: "Personal Development", href: "/courses/personal-development" },
  ];

  // Mock user menu items
  const userMenuItems = {
    student: [
      { label: "My Learning", icon: BookOpen, href: "/dashboard/student/courses" },
      { label: "My Progress", icon: BarChart, href: "/dashboard/student/progress" },
      { label: "Settings", icon: Settings, href: "/dashboard/student/settings" },
    ],
    teacher: [
      { label: "My Courses", icon: BookOpen, href: "/dashboard/teacher/courses" },
      { label: "Students", icon: Users, href: "/dashboard/teacher/students" },
      { label: "Analytics", icon: BarChart, href: "/dashboard/teacher/analytics" },
      { label: "Settings", icon: Settings, href: "/dashboard/teacher/settings" },
    ],
  };

  // Mock notifications
  const notifications = [
    { id: 1, message: "New course recommendation", time: "1 hour ago" },
    { id: 2, message: "Assignment due tomorrow", time: "2 hours ago" },
    { id: 3, message: "New message from instructor", time: "3 hours ago" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setIsSearchOpen(false);
  };

  const handleLogout = () => {
    // Implement logout logic
    setIsAuthenticated(false);
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignup = () => {
    router.push("/auth/register");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        ${isScrolled ? "shadow-sm" : ""}`}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">ConnectEd</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Categories Dropdown */}
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
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Navigation Links */}
          <Link href="/courses" className="text-foreground/60 hover:text-foreground">
            All Courses
          </Link>
          <Link href="/dashboard/teacher" className="text-foreground/60 hover:text-foreground">
            Teach
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px]">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id}>
                      <div className="flex flex-col space-y-1">
                        <span>{notification.message}</span>
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarImage src="/avatars/user.png" alt="User" />
                      <AvatarFallback>
                        {userRole === "teacher" ? "T" : "S"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems[userRole || "student"].map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem >
                    <Button>
                    <LogOut className="mr-2 h-4 w-4" />
                    <LogoutLink>Log Out</LogoutLink>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" >
              <LoginLink>
                Log In
                </LoginLink>
              </Button>
              <Button >
              <RegisterLink>
                Sign Up
                </RegisterLink>
                </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <SheetClose asChild key={category.name}>
                      <Link
                        href={category.href}
                        className="block px-2 py-1 hover:bg-accent rounded-md"
                      >
                        {category.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <SheetClose asChild>
                  <Link
                    href="/dashboard/teacher"
                    className="block px-2 py-1 hover:bg-accent rounded-md"
                  >
                    Teach on ConnectEd
                  </Link>
                </SheetClose>
                {!isAuthenticated && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogin}
                    >
                      Log In
                    </Button>
                    <Button className="w-full" onClick={handleSignup}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-screen sm:h-[400px]">
          <SheetHeader>
            <SheetTitle>Search Courses</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search for anything..."
                className="pl-10"
                autoFocus
              />
            </div>
          </form>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {["React", "JavaScript", "Python", "Web Development", "Data Science"].map(
                (term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                  >
                    {term}
                  </Badge>
                )
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}