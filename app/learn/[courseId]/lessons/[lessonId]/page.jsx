"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Menu,
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen,
  FileText,
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  Star,
  MoreVertical,
  Forward,
  UserCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactPlayer from 'react-player';
import { use } from 'react';

const LessonCard = ({ lesson, isActive, isCompleted, progress, onClick }) => {
  const duration = Math.ceil(lesson.duration / 60);
  const currentProgress = progress[lesson._id]?.progress || 0;

  return (
    <Card 
      className={`mb-2 transition-all hover:shadow-md ${
        isActive ? 'border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : isActive ? (
            <Play className="h-5 w-5 text-primary flex-shrink-0" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{duration} min</span>
              {!isCompleted && currentProgress > 0 && (
                <Badge variant="outline" className="ml-auto">
                  {Math.round(currentProgress)}% Complete
                </Badge>
              )}
            </div>
          </div>
          {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
        </div>
        {!isCompleted && currentProgress > 0 && (
          <Progress value={currentProgress} className="h-1 mt-2" />
        )}
      </CardContent>
    </Card>
  );
};

const CourseNavigation = ({ sections, currentLessonId, progress, onSelectLesson }) => {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="p-4 space-y-6">
        {sections.map((section, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Section {index + 1}
                </span>
                <h3 className="font-semibold text-sm">{section.title}</h3>
              </div>
              <Badge variant="secondary">
                {section.lessons.filter(l => progress[l._id]?.completed).length}/{section.lessons.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {section.lessons.map((lesson) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  isActive={lesson._id === currentLessonId}
                  isCompleted={progress[lesson._id]?.completed}
                  progress={progress}
                  onClick={() => onSelectLesson(lesson._id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

const VideoPlayer = ({ lesson, onProgress, onComplete }) => {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handleProgress = (state) => {
    const percentage = (state.playedSeconds / state.duration) * 100;
    setProgress(percentage);
    onProgress(percentage, state.playedSeconds);
  };

  const handleEnded = () => {
    setPlaying(false);
    onComplete();
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={lesson.videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          controls={true}
          volume={volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onEnded={handleEnded}
          progressInterval={1000}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                onContextMenu: e => e.preventDefault()
              }
            }
          }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
};

const LessonInfo = ({ lesson, course }) => {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-muted-foreground mt-1">{course.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bookmark</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download Resources
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Forward className="h-4 w-4 mr-2" />
                Skip Lesson
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator className="my-4" />
      <p className="text-sm text-muted-foreground">{lesson.description}</p>
    </div>
  );
};

export default function LearningInterface({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {courseId} = use(params);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, progressRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/student/courses/${courseId}/progress`),
      ]);
  
      if (!courseRes.ok || !progressRes.ok) {
        throw new Error('Failed to fetch course data');
      }
  
      const [courseData, progressData] = await Promise.all([
        courseRes.json(),
        progressRes.json(),
      ]);
  
      setCourse(courseData.course);
      setProgress(progressData.progress);
  
      const firstIncomplete = findFirstIncompleteLesson(
        courseData.course.sections,
        progressData.progress
      );
      if (firstIncomplete) {
        const currentLessonData = courseData.course.sections
          .flatMap((section) => section.lessons)
          .find((lesson) => lesson._id === firstIncomplete);
  
        setCurrentLesson(currentLessonData);
        router.replace(`/learn/${courseId}/lessons/${firstIncomplete}`);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteLesson = (sections, progress) => {
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (!progress[lesson._id]?.completed) {
          return lesson._id;
        }
      }
    }
    return sections[0]?.lessons[0]?._id;
  };

  const handleLessonSelect = (lessonId) => {
    const lesson = course.sections
      .flatMap((section) => section.lessons)
      .find((lesson) => lesson._id === lessonId);
    setCurrentLesson(lesson);
    router.push(`/learn/${courseId}/lessons/${lessonId}`);
    setIsSidebarOpen(false);
  };

  const handleLessonProgress = async (percentage, watchTime) => {
    try {
      const response = await fetch(`/api/student/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson._id,
          progress: percentage,
          watchTime
        })
      });

      if (!response.ok) throw new Error('Failed to update progress');

      const data = await response.json();
      setProgress(data.progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update progress",
      });
    }
  };

  const handleLessonComplete = async () => {
    try {
      const response = await fetch(`/api/student/courses/${courseId}/complete-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: currentLesson._id })
      });

      if (!response.ok) throw new Error('Failed to complete lesson');

      const data = await response.json();
      setProgress(data.progress);

      toast({
        title: "Lesson Completed! 🎉",
        description: "Moving to the next lesson...",
      });

      const nextLesson = findNextLesson(course.sections, currentLesson._id);
      if (nextLesson) {
        handleLessonSelect(nextLesson);
      } else {
        toast({
          title: "Course Completed! 🎓",
          description: "Congratulations on finishing the course!",
        });
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete lesson",
      });
    }
  };

  const findNextLesson = (sections, currentLessonId) => {
    let found = false;
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (found) return lesson._id;
        if (lesson._id === currentLessonId) found = true;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Course</h1>
        <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress(progress, course.sections);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex md:flex-col md:w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="h-6 w-6" />
            <h2 className="font-semibold truncate">{course.title}</h2>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(overallProgress)}% Complete
          </p>
        </div>
        <CourseNavigation
          sections={course.sections}
          currentLessonId={currentLesson?._id}
          progress={progress}
          onSelectLesson={handleLessonSelect}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle>
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5" />
                          {course.title}
                        </div>
                      </SheetTitle>
                      <Progress value={overallProgress} className="h-2 mt-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {Math.round(overallProgress)}% Complete
                      </p>
                    </SheetHeader>
                    <CourseNavigation
                      sections={course.sections}
                      currentLessonId={currentLesson?._id}
                      progress={progress}
                      onSelectLesson={handleLessonSelect}
                    />
                    <SheetFooter className="p-4 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/dashboard')}
                      >
                        Back to Dashboard
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
              {currentLesson && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{currentLesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.sections.find(s => 
                      s.lessons.some(l => l._id === currentLesson._id)
                    )?.title}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <BookOpen className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Course Materials</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notes</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Discussion</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* Main content area */}
        {currentLesson && (
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl py-6">
              <VideoPlayer
                lesson={currentLesson}
                onProgress={handleLessonProgress}
                onComplete={handleLessonComplete}
              />
              <LessonInfo lesson={currentLesson} course={course} />

              {/* Resources Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Lesson Resources</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentLesson.resources?.map((resource, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{resource.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {resource.type} • {resource.size}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Next Lesson Preview */}
              {findNextLesson(course.sections, currentLesson._id) && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">Up Next</h2>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-24 bg-muted rounded-md flex items-center justify-center">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">
                            {course.sections
                              .flatMap(s => s.lessons)
                              .find(l => l._id === findNextLesson(course.sections, currentLesson._id))
                              ?.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Continue your learning journey with the next lesson
                          </p>
                          <Button 
                            className="mt-2"
                            onClick={() => handleLessonSelect(findNextLesson(course.sections, currentLesson._id))}
                          >
                            Start Next Lesson
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

function calculateOverallProgress(progress, sections) {
  const totalLessons = sections.reduce(
    (sum, section) => sum + section.lessons.length,
    0
  );
  const completedLessons = Object.values(progress).filter(p => p.completed).length;
  return (completedLessons / totalLessons) * 100;
}