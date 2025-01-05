"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/components/auth/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Calendar,
  Play,
  Clock,
  AlertCircle
} from "lucide-react";



const initialStreamState = {
  title: '',
  description: '',
  courseId: '',
  scheduledFor: '',
  duration: 60
};
export default function LivestreamPage() {
  const { user, loading } = useAuth('teacher');
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newStream, setNewStream] = useState(initialStreamState);
  const [hasPermissions, setHasPermissions] = useState(null);

    // Add permission check function
    const checkMediaPermissions = useCallback(async () => {
      try {
        // First check if the permissions are already granted
        const permissions = await navigator.permissions.query({ name: 'camera' });
        if (permissions.state === 'granted') {
          setHasPermissions(true);
          return true;
        }
  
        // If not granted, request permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // Clean up test stream
        stream.getTracks().forEach(track => track.stop());
        
        setHasPermissions(true);
        return true;
      } catch (error) {
        setHasPermissions(false);
        return false;
      }
    }, []);

  // Memoize API endpoints
  const API_ENDPOINTS = useMemo(() => ({
    livestreams: '/api/teacher/livestreams',
    courses: '/api/teacher/courses',
    startStream: '/api/teacher/livestreams/start',
    stopStream: '/api/teacher/livestreams/stop',
    scheduleStream: '/api/teacher/livestreams/schedule'
  }), []);

  // Memoize fetch options
  const fetchOptions = useMemo(() => ({
    credentials: 'include'
  }), []);

  // // Memoized fetch function
  const fetchData = useCallback(async () => {
    try {
      const [streamsRes, coursesRes] = await Promise.all([
        fetch(API_ENDPOINTS.livestreams, fetchOptions),
        fetch(API_ENDPOINTS.courses, fetchOptions)
      ]);

      if (!streamsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [streamsData, coursesData] = await Promise.all([
        streamsRes.json(),
        coursesRes.json()
      ]);
      console.log("coursedata",coursesData)
      setStreams(streamsData);
      setCourses(coursesData.courses);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [API_ENDPOINTS, fetchOptions, toast]);

  // Initial data fetch - only run when auth state changes
  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      fetchData();
    }
  }, [user?.role, loading]);

  // Memoize form update handler
  const handleStreamUpdate = useCallback((field, value) => {
    setNewStream(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Memoize stream control functions
  const startStream = useCallback(async () => {
    try {
      // Check permissions first
      const hasAccess = await checkMediaPermissions();
      if (!hasAccess) {
        toast({
          title: "Permission Required",
          description: "Please allow access to camera and microphone to start streaming.",
          variant: "destructive"
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      const response = await fetch(API_ENDPOINTS.startStream, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...fetchOptions,
        body: JSON.stringify({
          title: newStream.title,
          description: newStream.description,
          courseId: newStream.courseId
        })
      });

      if (!response.ok) throw new Error('Failed to start stream');

      await response.json();
      setIsLive(true);
      toast({
        title: "Success",
        description: "Livestream started successfully!"
      });
    } catch (error) {
      console.error('Error starting stream:', error);
      let errorMessage = "Failed to start stream. ";
      
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow camera and microphone access in your browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera or microphone found.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera or microphone is already in use.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [API_ENDPOINTS, fetchOptions, newStream, toast, checkMediaPermissions]);

  // Add permission warning alert when permissions are denied
  const renderPermissionAlert = useMemo(() => {
    if (hasPermissions === false) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera and microphone access in your browser settings to start streaming.
            You can usually find this in the site settings or by clicking the camera icon in your browser&apos;s address bar.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }, [hasPermissions]);

  const stopStream = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const response = await fetch(API_ENDPOINTS.stopStream, {
        method: 'POST',
        ...fetchOptions
      });

      if (!response.ok) throw new Error('Failed to stop stream');

      setIsLive(false);
      toast({
        title: "Success",
        description: "Livestream ended successfully"
      });
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast({
        title: "Error",
        description: "Failed to stop stream",
        variant: "destructive"
      });
    }
  }, [API_ENDPOINTS, fetchOptions, toast]);

  // Memoize media toggle handlers
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(!videoTrack.enabled);
      }
    }
  }, []);

  // Memoize schedule handler
  const handleStreamSchedule = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.scheduleStream, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...fetchOptions,
        body: JSON.stringify(newStream)
      });

      if (!response.ok) throw new Error('Failed to schedule stream');

      toast({
        title: "Success",
        description: "Livestream scheduled successfully"
      });

      setNewStream(initialStreamState);
      fetchData();
    } catch (error) {
      console.error('Error scheduling stream:', error);
      toast({
        title: "Error",
        description: "Failed to schedule stream",
        variant: "destructive"
      });
    }
  }, [API_ENDPOINTS, fetchOptions, newStream, toast, fetchData]);

  // Memoize the streams list rendering
  const renderStreams = useMemo(() => {
    if (streams.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-4">
          No upcoming streams scheduled
        </p>
      );
    }

    return streams.map(stream => (
      <div
        key={stream._id}
        className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg"
      >
        <div>
          <h4 className="font-medium">{stream.title}</h4>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(stream.scheduledFor).toLocaleDateString()}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{stream.duration} mins</span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/dashboard/teacher/livestream/${stream._id}`)}
        >
          <Play className="h-4 w-4 mr-2" />
          Start
        </Button>
      </div>
    ));
  }, [streams, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="grid gap-6 md:grid-cols-1">
        {/* Livestream Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Go Live</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {renderPermissionAlert}
                {!isLive && (
                  <>
                    <Input
                      placeholder="Stream Title"
                      value={newStream.title}
                      onChange={(e) => handleStreamUpdate('title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Stream Description"
                      value={newStream.description}
                      onChange={(e) => handleStreamUpdate('description', e.target.value)}
                    />
                    <Select
                      value={newStream.courseId}
                      onValueChange={(value) => handleStreamUpdate('courseId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full aspect-video"
                  />
                  {!isLive && !streamRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                      <div className="text-center text-white">
                        <Camera className="mx-auto h-12 w-12 mb-2" />
                        <p>Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    size="lg"
                    variant={isLive ? "destructive" : "default"}
                    onClick={isLive ? stopStream : startStream}
                  >
                    {isLive ? (
                      <>Stop Stream</>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Stream
                      </>
                    )}
                  </Button>
                  {isLive && (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={toggleAudio}
                      >
                        {isMuted ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={toggleVideo}
                      >
                        {!isVideoEnabled ? (
                          <VideoOff className="h-4 w-4" />
                        ) : (
                          <Video className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isLive && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>You are live!</AlertTitle>
              <AlertDescription>
                Share your screen and start teaching. Students will be able to join your stream.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Schedule Section */}
        {/* <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStreamSchedule} className="space-y-4">
                <Input
                  placeholder="Stream Title"
                  value={newStream.title}
                  onChange={(e) => handleStreamUpdate('title', e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Stream Description"
                  value={newStream.description}
                  onChange={(e) => handleStreamUpdate('description', e.target.value)}
                  required
                />
                <Select
                  value={newStream.courseId}
                  onValueChange={(value) => handleStreamUpdate('courseId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="datetime-local"
                    value={newStream.scheduledFor}
                    onChange={(e) => handleStreamUpdate('scheduledFor', e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={newStream.duration}
                    onChange={(e) => handleStreamUpdate('duration', parseInt(e.target.value))}
                    min="15"
                    max="240"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Stream
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderStreams}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}