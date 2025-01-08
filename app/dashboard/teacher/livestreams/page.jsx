// dashboard/teacher/livestreams/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/calendar/Calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, Calendar as CalendarIcon, PlusCircle } from "lucide-react";

export default function TeacherLivestreamsPage() {
  const { user, loading } = useAuth("teacher");
  const router = useRouter();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [scheduledStreams, setScheduledStreams] = useState([]);
  const [showNewStreamDialog, setShowNewStreamDialog] = useState(false);
  const [newStream, setNewStream] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledFor: null,
    settings: {
      isChatEnabled: true,
      isQuestionsEnabled: true,
      allowReplays: true,
      allowScreenShare: true,
    },
  });

  useEffect(() => {
    if (!loading && user?.role === "teacher") {
      // Fetch courses
      fetch("/api/teacher/courses")
        .then((res) => res.json())
        .then((data) => setCourses(data.courses))
        .catch(console.error);

      // Fetch scheduled streams
      fetch("/api/teacher/livestreams/scheduled")
        .then((res) => res.json())
        .then((data) => setScheduledStreams(data.streams))
        .catch(console.error);
    }
  }, [user?.role, loading]);

  const handleStreamCreate = async (isScheduled = false) => {
    try {
      const endpoint = isScheduled
        ? "/api/teacher/livestreams/schedule"
        : "/api/teacher/livestreams/start";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStream),
      });

      if (!response.ok) throw new Error("Failed to create stream");

      const data = await response.json();

      toast({
        title: "Success",
        description: isScheduled
          ? "Class scheduled successfully"
          : "Starting livestream...",
      });

      setShowNewStreamDialog(false);

      if (!isScheduled) {
        router.push(`/dashboard/teacher/livestreams/${data.livestreamId}`);
      } else {
        // Refresh scheduled streams
        const scheduledResponse = await fetch("/api/teacher/livestreams/scheduled");
        const scheduledData = await scheduledResponse.json();
        setScheduledStreams(scheduledData.streams);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== "teacher") return null;

  return (
    <div className="container mx-auto p-6 space-y-6 overflow-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Classes</h1>
        <Button onClick={() => setShowNewStreamDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Live Class
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>
              Your scheduled live classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledStreams.map((stream) => (
                    <TableRow key={stream._id}>
                      <TableCell>{stream.title}</TableCell>
                      <TableCell>
                        {courses.find((c) => c._id === stream.courseId)?.title}
                      </TableCell>
                      <TableCell>
                        {new Date(stream.scheduledFor).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/teacher/livestreams/${stream._id}`);
                          }}
                        >
                          Start
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Past Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Past Classes</CardTitle>
            <CardDescription>
              Review and manage your previous live classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Past streams will be populated here */}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* New Stream Dialog */}
      <Dialog open={showNewStreamDialog} onOpenChange={setShowNewStreamDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Live Class</DialogTitle>
            <DialogDescription>
              Fill in the details to start a new live class or schedule one for later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 h-20 py-4">
            <Input
              placeholder="Class Title"
              value={newStream.title}
              onChange={(e) =>
                setNewStream((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <Textarea
              placeholder="Class Description"
              value={newStream.description}
              onChange={(e) =>
                setNewStream((prev) => ({ ...prev, description: e.target.value }))
              }
            />

            <Select
              value={newStream.courseId}
              onValueChange={(value) =>
                setNewStream((prev) => ({ ...prev, courseId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Schedule for later?</h4>
              <Calendar
                mode="single"
                selected={newStream.scheduledFor}
                onSelect={(date) =>
                  setNewStream((prev) => ({ ...prev, scheduledFor: date }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewStreamDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleStreamCreate(!!newStream.scheduledFor)}>
              {newStream.scheduledFor ? "Schedule Class" : "Start Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
