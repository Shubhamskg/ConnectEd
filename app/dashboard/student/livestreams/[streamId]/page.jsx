// app/dashboard/student/livestream/[streamId]/page.js
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/auth/useAuth';
import { useToast } from "@/components/ui/use-toast";
import WebRTCService from "@/lib/services/webrtc";
import { StreamGridLayout } from "@/components/livestream/StreamGridLayout";
import { MeetingInfo } from "@/components/livestream/MeetingInfo";
import { MeetControls } from "@/components/livestream/MeetControls";
import { ParticipantsSidebar } from "@/components/livestream/ParticipantsSidebar";
import { ChatSidebar } from "@/components/livestream/ChatSidebar";
import RecordingIndicator from "@/components/livestream/RecordingIndicator";
import { SettingsDialog } from "@/components/livestream/SettingsDialog";
import { ConnectionQuality } from "@/components/livestream/ConnectionQuality";
import { useKeyboardShortcuts } from "@/components/livestream/KeyboardShortcuts";
import { ActiveSpeakerProvider, useActiveSpeaker } from "@/components/livestream/ActiveSpeakerContext";
import { MeetingTimer } from "@/components/livestream/MeetingTimer";
import { use } from "react";

function LivestreamContent({ streamId, user }) {
  const router = useRouter();
  const { toast } = useToast();
  const webrtcRef = useRef(null);
  const activeSpeaker = useActiveSpeaker();

  // State management
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [layout, setLayout] = useState('grid'); // 'grid', 'spotlight', 'presentation'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [focusedParticipant, setFocusedParticipant] = useState(null);

  // Initialize WebRTC and join meeting
  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // Initialize WebRTC service
        webrtcRef.current = new WebRTCService(streamId, user.id, false);
        webrtcRef.current.onParticipantJoined = handleParticipantJoined;
        webrtcRef.current.onParticipantLeft = handleParticipantLeft;
        webrtcRef.current.onActiveSpeakerChanged = handleActiveSpeakerChange;
        webrtcRef.current.onConnectionQualityChanged = handleConnectionQualityChange;

        // Initialize local media
        await webrtcRef.current.initialize();

        // Join meeting
        await joinMeeting();
        
      } catch (error) {
        console.error('Error initializing meeting:', error);
        toast({
          title: "Error",
          description: "Failed to join the meeting",
          variant: "destructive"
        });
      }
    };

    initializeMeeting();
    fetchMeetingDetails();

    // Cleanup on unmount
    return () => {
      if (webrtcRef.current) {
        // leaveMeeting();
      }
    };
  }, [streamId]);

  // Meeting initialization
  const fetchMeetingDetails = async () => {
    try {
      const response = await fetch(`/api/student/livestreams/${streamId}`);
      if (!response.ok) throw new Error('Failed to fetch meeting details');
      
      const data = await response.json();
      setMeetingDetails(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load meeting details",
        variant: "destructive"
      });
    }
  };

  const joinMeeting = async () => {
    try {
      const response = await fetch(`/api/student/livestreams/${streamId}/join`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to join meeting');

      setIsConnected(true);
      startActivityHeartbeat();
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw error;
    }
  };

  const leaveMeeting = async () => {
    try {
      await fetch(`/api/student/livestreams/${streamId}/leave`, {
        method: 'POST'
      });

      webrtcRef.current?.disconnect();
      router.push('/dashboard/student');
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  };

  // Activity monitoring
  const startActivityHeartbeat = () => {
    const interval = setInterval(async () => {
      try {
        await fetch(`/api/student/livestreams/${streamId}/heartbeat`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  // Participant handlers
  const handleParticipantJoined = useCallback((participant) => {
    setParticipants(prev => [...prev, participant]);
  }, []);

  const handleParticipantLeft = useCallback((participantId) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  }, []);

  const handleActiveSpeakerChange = useCallback((participantId) => {
    if (participantId && layout === 'spotlight') {
      setFocusedParticipant(participantId);
    }
  }, [layout]);

  const handleConnectionQualityChange = useCallback((quality) => {
    setConnectionQuality(quality);
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

  const toggleHand = useCallback(async () => {
    try {
      const response = await fetch(`/api/student/livestreams/${streamId}/hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raised: !isHandRaised })
      });

      if (!response.ok) throw new Error('Failed to toggle hand');

      setIsHandRaised(!isHandRaised);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to raise/lower hand",
        variant: "destructive"
      });
    }
  }, [streamId, isHandRaised, toast]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    handlers: {
      toggleAudio,
      toggleVideo,
      toggleHand,
      toggleChat: () => setIsChatOpen(prev => !prev),
      toggleParticipants: () => setIsParticipantsOpen(prev => !prev),
      showEndDialog: () => setShowEndDialog(true)
    }
  });

  return (
    <div className="relative h-screen bg-black">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/50 z-10">
        <div className="flex items-center justify-between h-full px-4">
          <MeetingInfo
            title={meetingDetails?.title}
            participants={participants}
            isRecording={meetingDetails?.isRecording}
            meetingLink={meetingDetails?.joinUrl}
          />
          <div className="flex items-center space-x-4">
            <MeetingTimer startTime={meetingDetails?.startedAt} />
            <ConnectionQuality quality={connectionQuality} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-full pt-16 pb-20">
        <StreamGridLayout
          participants={participants}
          layout={layout}
          activeSpeaker={activeSpeaker}
          focusedParticipant={focusedParticipant}
          localParticipant={{
            id: user.id,
            stream: webrtcRef.current?.localStream,
            isMuted,
            isVideoEnabled
          }}
        />
      </div>

      {/* Controls Bar */}
      <MeetControls
        className="absolute bottom-0 left-0 right-0 h-20 bg-black/90"
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleHand={toggleHand}
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
        currentUserId={user.id}
      />

      <ParticipantsSidebar
        streamId={streamId}
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        participants={participants}
        activeSpeaker={activeSpeaker}
      />

      {/* Dialogs */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        webrtcService={webrtcRef.current}
      />

      {/* End Meeting Dialog */}
      <Dialog 
        open={showEndDialog} 
        onOpenChange={setShowEndDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave the meeting? You can rejoin later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={leaveMeeting}
            >
              Leave Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl">Connecting to meeting...</p>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {meetingDetails?.isRecording && <RecordingIndicator />}
    </div>
  );
}

export default function StudentLivestreamPage({ params }) {
  const { streamId } =use(params);
  const { user, loading } = useAuth('student');

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
    <ActiveSpeakerProvider>
      <LivestreamContent streamId={streamId} user={user} />
    </ActiveSpeakerProvider>
  );
}