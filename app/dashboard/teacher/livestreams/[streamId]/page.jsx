// dashboard/teacher/livestreams/[streamId]/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {cn} from "@/lib/utils"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import ChatBox from "@/components/livestream/ChatBox";
import ParticipantsList from "@/components/livestream/ParticipantsList";
import { use } from "react";

export default function TeacherLivestreamPage({ params }) {
  const { streamId } =use(params);
  const { user, loading } = useAuth('teacher');
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef(null);
  const mainVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [participantHandRaised, setParticipantHandRaised] = useState([]);

  // Start stream setup
  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      startStream();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user?.role, loading]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsLive(true);
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start stream",
        variant: "destructive"
      });
    }
  };

  // Media controls
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (streamRef.current) {
          const videoTrack = await navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => stream.getVideoTracks()[0]);
          streamRef.current.getVideoTracks()[0].replaceTrack(videoTrack);
        }
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (streamRef.current) {
          streamRef.current.getVideoTracks()[0].replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };
      }
      
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to toggle screen sharing",
        variant: "destructive"
      });
    }
  };

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
      setIsFullscreen(false)
    }
};

// End stream handling
const handleEndStream = async () => {
  try {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const response = await fetch(`/api/teacher/livestreams/${streamId}/end`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to end stream');

    router.push('/dashboard/teacher/livestreams');
    toast({
      title: "Success",
      description: "Livestream ended successfully"
    });
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Error",
      description: "Failed to end stream properly",
      variant: "destructive"
    });
  }
};

// Participant management
const handleParticipantAction = async (participantId, action) => {
  try {
    const response = await fetch(`/api/teacher/livestreams/${streamId}/participants/${participantId}/${action}`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error(`Failed to ${action} participant`);

    toast({
      title: "Success",
      description: `Participant ${action} successfully`
    });
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
};

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
          {/* Left Controls */}
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
                <TooltipContent>
                  {isMuted ? "Unmute Microphone" : "Mute Microphone"}
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
                  {isVideoEnabled ? "Stop Camera" : "Start Camera"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("text-white hover:bg-white/20", {
                      "bg-blue-500/50": isScreenSharing
                    })}
                    onClick={toggleScreenShare}
                  >
                    <MonitorUp className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
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
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
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
                  isTeacher={true}
                  onParticipantAction={handleParticipantAction}
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
                  isTeacher={true}
                  currentUserId={user.id}
                />
              </SheetContent>
            </Sheet>

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
                <DropdownMenuItem onSelect={() => setShowLeaveDialog(true)}>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Meeting
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PictureInPicture className="h-4 w-4 mr-2" />
                  Picture in Picture
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>

    {/* Leave Meeting Dialog */}
    <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Meeting</DialogTitle>
          <DialogDescription>
            Are you sure you want to end the meeting for all participants?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleEndStream}>
            End Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
}