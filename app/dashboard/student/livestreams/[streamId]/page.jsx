"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/auth/useAuth';
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Settings,
  Hand,
  PhoneOff,
  PictureInPicture,
  MonitorUp,
  Volume2,
  VolumeX
} from "lucide-react";
import ChatBox from "@/components/livestream/ChatBox";
import ParticipantsList from "@/components/livestream/ParticipantsList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { use } from "react";

export default function StudentLivestreamPage({ params }) {
  const { streamId } =use(params)
  const { user, loading } = useAuth('student');
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef(null);
  const mainVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  
  const [livestream, setLivestream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isTeacherAudioMuted, setIsTeacherAudioMuted] = useState(false);

  // Video controls
  const toggleAudio = useCallback(async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(!videoTrack.enabled);
      }
    }
  }, []);

  const toggleHand = useCallback(async () => {
    try {
      const response = await fetch(`/api/student/livestreams/${streamId}/hand`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to toggle hand');

      setIsHandRaised(!isHandRaised);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to raise hand",
        variant: "destructive"
      });
    }
  }, [streamId, isHandRaised, toast]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainVideoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleTeacherAudio = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = !mainVideoRef.current.muted;
      setIsTeacherAudioMuted(!isTeacherAudioMuted);
    }
  };

  // Join livestream
  const joinLivestream = useCallback(async () => {
    try {
      const response = await fetch(`/api/student/livestreams/${streamId}/join`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to join livestream');

      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Set up peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnection.ontrack = (event) => {
        if (mainVideoRef.current) {
          mainVideoRef.current.srcObject = event.streams[0];
        }
      };

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnectionRef.current = peerConnection;
      setIsConnected(true);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to join livestream",
        variant: "destructive"
      });
    }
  }, [streamId, toast]);

  // Initial setup
  useEffect(() => {
    if (!loading && user?.role === 'student') {
      joinLivestream();

      return () => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }
      };
    }
  }, [user?.role, loading, joinLivestream]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="relative h-screen bg-black">
      {/* Main Video Container */}
      <div className="relative w-full h-full">
        <video
          ref={mainVideoRef}
          autoPlay
          playsInline
          className={cn(
            "w-full h-full object-contain transform transition-transform",
            { "cursor-zoom-out": zoomLevel > 1 }
          )}
          style={{ transform: `scale(${zoomLevel})` }}
        />

        {/* Self Video */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-move">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <Video className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleAudio}
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleVideo}
                  >
                    {!isVideoEnabled ? (
                      <VideoOff className="h-5 w-5" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isVideoEnabled ? "Stop Video" : "Start Video"}
                </TooltipContent>
              </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleTeacherAudio}
                  >
                    {isTeacherAudioMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isTeacherAudioMuted ? "Unmute Teacher" : "Mute Teacher"}
                </TooltipContent>
              </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isHandRaised ? "secondary" : "ghost"}
                    size="icon"
                    className={cn("hover:bg-white/20", {
                      "text-white": !isHandRaised,
                      "text-yellow-400": isHandRaised
                    })}
                    onClick={toggleHand}
                  >
                    <Hand className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isHandRaised ? "Lower Hand" : "Raise Hand"}
                </TooltipContent>
              </Tooltip>
              </TooltipProvider>

              <Sheet open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Participants</SheetTitle>
                  </SheetHeader>
                  <ParticipantsList
                    streamId={streamId}
                    isTeacher={false}
                  />
                </SheetContent>
              </Sheet>

              <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Chat</SheetTitle>
                  </SheetHeader>
                  <ChatBox
                    streamId={streamId}
                    isTeacher={false}
                    currentUserId={user.id}
                  />
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PictureInPicture className="h-4 w-4 mr-2" />
                    Picture in Picture
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MonitorUp className="h-4 w-4 mr-2" />
                    Share Screen
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Leave Meeting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
          </div>
        </div>

        {/* Status Messages */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-xl font-medium">Connecting to stream...</p>
            </div>
          </div>
        )}

        {isScreenShared && (
          <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg">
            <p className="text-sm flex items-center">
              <MonitorUp className="h-4 w-4 mr-2" />
              {livestream?.teacherName} is sharing their screen
            </p>
          </div>
        )}
      </div>

      {/* Picture in Picture button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        onClick={async () => {
          try {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture();
            } else if (mainVideoRef.current) {
              await mainVideoRef.current.requestPictureInPicture();
            }
          } catch (error) {
            console.error('PiP error:', error);
            toast({
              title: "Error",
              description: "Picture in Picture not supported",
              variant: "destructive"
            });
          }
        }}
      >
        <PictureInPicture className="h-5 w-5" />
      </Button>

      {/* Leave Meeting Confirmation Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="absolute top-4 left-4"
            onClick={() => setShowLeaveDialog(true)}
          >
            Leave Meeting
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave the meeting? You can rejoin later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                try {
                  await fetch(`/api/student/livestreams/${streamId}/leave`, {
                    method: 'POST'
                  });

                  // Clean up streams
                  if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => track.stop());
                  }
                  if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                  }

                  router.push('/dashboard/student');
                } catch (error) {
                  console.error('Error leaving stream:', error);
                  toast({
                    title: "Error",
                    description: "Failed to leave stream properly",
                    variant: "destructive"
                  });
                }
              }}
            >
              Leave Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Meeting Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Audio</h3>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {/* Microphone options will be populated dynamically */}
                </SelectContent>
              </Select>

              <h3 className="text-sm font-medium">Video</h3>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {/* Camera options will be populated dynamically */}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mirror my video</span>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable noise cancellation</span>
                <Switch />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Reset to Default</Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}