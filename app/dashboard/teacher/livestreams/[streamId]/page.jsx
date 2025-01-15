// app/dashboard/teacher/livestream/[streamId]/page.js
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/auth/useAuth';
import { useToast } from "@/components/ui/use-toast";
import WebRTCService from "@/lib/services/webrtc";
import { StreamGridLayout } from "@/components/livestream/StreamGridLayout";
import { MeetControls } from "@/components/livestream/MeetControls";
import { ParticipantsSidebar } from "@/components/livestream/ParticipantsSidebar";
import { ChatSidebar } from "@/components/livestream/ChatSidebar";
import { MeetingInfo } from "@/components/livestream/MeetingInfo";
import  RecordingIndicator  from "@/components/livestream/RecordingIndicator";
import { SettingsDialog } from "@/components/livestream/SettingsDialog";
import { EndMeetingDialog } from "@/components/livestream/EndMeetingDialog";
import { ActiveSpeakerProvider } from "@/components/livestream/ActiveSpeakerContext";
import {
  LayoutPanelTop,
  Grid2x2,
  Presentation,
  MessageSquare,
  Users,
  Settings,
  PhoneOff
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { use } from "react";

export default function TeacherLivestreamPage({ params }) {
  const { streamId } =use(params);
  const { user, loading } = useAuth('teacher');
  const router = useRouter();
  const { toast } = useToast();
  const webrtcRef = useRef(null);
  
  // State management
  const [streamDetails, setStreamDetails] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid', 'spotlight', 'presentation'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Initialize WebRTC service and stream
  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      const initStream = async () => {
        try {
          // Create WebRTC service instance
          webrtcRef.current = new WebRTCService(streamId, user.id, true);
          
          // Set event handlers
          webrtcRef.current.onParticipantJoined = handleParticipantJoined;
          webrtcRef.current.onParticipantLeft = handleParticipantLeft;
          webrtcRef.current.onScreenShare = handleScreenShareChange;

          // Initialize stream
          await webrtcRef.current.initialize();
          setIsLive(true);

        } catch (error) {
          console.error('Error initializing stream:', error);
          toast({
            title: "Error",
            description: "Failed to start stream",
            variant: "destructive"
          });
        }
      };

      initStream();
      fetchStreamDetails();

      // Cleanup
      return () => {
        if (webrtcRef.current) {
          webrtcRef.current.disconnect();
        }
      };
    }
  }, [user?.role, loading, streamId]);

  // Fetch stream details
  const fetchStreamDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/livestreams/${streamId}`);
      if (!response.ok) throw new Error('Failed to fetch stream details');
      
      const data = await response.json();
      setStreamDetails(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load stream details",
        variant: "destructive"
      });
    }
  };

  // Participant handlers
  const handleParticipantJoined = useCallback((participant) => {
    setParticipants(prev => [...prev, participant]);
  }, []);

  const handleParticipantLeft = useCallback((participantId) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  }, []);

  const handleScreenShareChange = useCallback((isSharing) => {
    setIsScreenSharing(isSharing);
    setLayout(isSharing ? 'presentation' : 'grid');
  }, []);

  // Media controls
  const toggleAudio = useCallback(async () => {
    if (webrtcRef.current) {
      const newState = !isMuted;
      await webrtcRef.current.toggleAudio(!newState);
      setIsMuted(newState);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(async () => {
    if (webrtcRef.current) {
      const newState = !isVideoEnabled;
      await webrtcRef.current.toggleVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [isVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing && webrtcRef.current) {
        await webrtcRef.current.startScreenShare();
      } else if (webrtcRef.current) {
        await webrtcRef.current.stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Error",
        description: "Failed to toggle screen sharing",
        variant: "destructive"
      });
    }
  }, [isScreenSharing, toast]);

  // Recording controls
  const toggleRecording = useCallback(async () => {
    try {
      if (!isRecording) {
        await fetch(`/api/teacher/livestreams/${streamId}/recording/start`, {
          method: 'POST'
        });
        setIsRecording(true);
      } else {
        await fetch(`/api/teacher/livestreams/${streamId}/recording/stop`, {
          method: 'POST'
        });
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      toast({
        title: "Error",
        description: "Failed to toggle recording",
        variant: "destructive"
      });
    }
  }, [isRecording, streamId, toast]);

  // End stream handling
  const handleEndStream = async () => {
    try {
      if (webrtcRef.current) {
        webrtcRef.current.disconnect();
      }

      await fetch(`/api/teacher/livestreams/${streamId}/end`, {
        method: 'POST'
      });

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

  // Keyboard shortcuts
  useHotkeys('alt+m', toggleAudio, [toggleAudio]);
  useHotkeys('alt+v', toggleVideo, [toggleVideo]);
  useHotkeys('alt+s', toggleScreenShare, [toggleScreenShare]);
  useHotkeys('alt+r', toggleRecording, [toggleRecording]);
  useHotkeys('alt+c', () => setIsChatOpen(prev => !prev), []);
  useHotkeys('alt+p', () => setIsParticipantsOpen(prev => !prev), []);

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
    <ActiveSpeakerProvider>
      <div className="relative min-h-[600px] p-6 mx-auto mt-10 max-w-7xl bg-black">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-black/50 z-10">
          <MeetingInfo
            title={streamDetails?.title}
            participants={participants}
            isRecording={isRecording}
          />
        </div>

        {/* Main Content */}
        <div className="relative h-full pt-16 pb-20">
          <StreamGridLayout
            participants={participants}
            layout={layout}
            activeSpeaker={activeSpeaker}
            isScreenSharing={isScreenSharing}
          />
        </div>

        {/* Controls Bar */}
        <MeetControls
          className="absolute bottom-0 left-0 right-0 h-20 bg-black/90"
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onToggleRecording={toggleRecording}
          onEndMeeting={() => setShowEndDialog(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          participantCount={participants.length}
          onToggleChat={() => setIsChatOpen(prev => !prev)}
          onToggleParticipants={() => setIsParticipantsOpen(prev => !prev)}
        />

        {/* Sidebars */}
        <ChatSidebar
          streamId={streamId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        <ParticipantsSidebar
          streamId={streamId}
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={participants}
          activeSpeaker={activeSpeaker}
        />

        {/* Modals */}
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          webrtcService={webrtcRef.current}
        />

        <EndMeetingDialog
          isOpen={showEndDialog}
          onClose={() => setShowEndDialog(false)}
          onConfirm={handleEndStream}
        />

        {/* Recording Indicator */}
        {isRecording && <RecordingIndicator />}
      </div>
    </ActiveSpeakerProvider>
  );
}