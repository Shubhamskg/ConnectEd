// app/courses/page.jsx
"use client";

import { useState } from "react";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseSearch } from "@/components/courses/CourseSearch";
import { Button } from "@/components/ui/button";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CoursesPage() {
  const [view, setView] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover courses to enhance your skills and advance your career
        </p>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <CourseSearch />
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile Filters */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <CourseFilters />
            </SheetContent>
          </Sheet>

          {/* View Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <CourseFilters />
        </div>

        {/* Course Grid */}
        <div className="lg:col-span-3">
          <CourseGrid view={view} />
        </div>
      </div>
    </div>
  );
}