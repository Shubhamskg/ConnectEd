// app/dashboard/student/livestreams/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Play,
  Users,
  Book,
  Radio,
  Activity
} from "lucide-react";
import { useAuth } from '@/components/auth/useAuth';

export default function LivestreamListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth('student');
  
  const [activeLivestreams, setActiveLivestreams] = useState([]);
  const [scheduledLivestreams, setScheduledLivestreams] = useState([]);
  const [activeTab, setActiveTab] = useState('live');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch livestreams
  useEffect(() => {
    const fetchLivestreams = async () => {
      try {
        const response = await fetch('/api/student/livestreams');
        if (!response.ok) throw new Error('Failed to fetch livestreams');

        const data = await response.json();
        
        // Separate active and scheduled streams
        setActiveLivestreams(data.filter(stream => stream.status === 'live'));
        setScheduledLivestreams(data.filter(stream => stream.status === 'scheduled'));
        
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load livestreams",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user?.role === 'student') {
      fetchLivestreams();
    }
  }, [user?.role, loading, toast]);

  // Join livestream
  const handleJoinStream = (streamId) => {
    router.push(`/dashboard/student/livestreams/${streamId}`);
  };

  if (loading || isLoading) {
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
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Live Classes</h1>
          <Badge variant="outline" className="px-3 py-1">
            <Radio className="w-4 h-4 mr-2 text-red-500" />
            <span className="flex items-center">
              {activeLivestreams.length} Live Now
              <Activity className="w-3 h-3 ml-2 text-red-500 animate-pulse" />
            </span>
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="live" className="flex items-center">
              <Radio className="w-4 h-4 mr-2 text-red-500" />
              Live Now
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {activeLivestreams.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center text-muted-foreground">
                    <Radio className="w-12 h-12 mb-3 mx-auto opacity-50" />
                    <p>No live classes currently in progress</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeLivestreams.map((stream) => (
                  <Card key={stream._id} className="hover:bg-secondary/5 transition-colors">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                          {stream.title}
                        </div>
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Book className="w-4 h-4 mr-1" />
                        {stream.courseName || 'Open Session'}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {stream.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {stream.attendees?.length || 0}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {Math.round((new Date() - new Date(stream.startedAt)) / 1000 / 60)}m
                          </div>
                        </div>
                        
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => handleJoinStream(stream._id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Join Stream
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled">
            {scheduledLivestreams.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mb-3 mx-auto opacity-50" />
                    <p>No upcoming classes scheduled</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {scheduledLivestreams.map((stream) => (
                  <Card key={stream._id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{stream.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(stream.scheduledFor).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(stream.scheduledFor).toLocaleTimeString()}
                            </div>
                            <div className="flex items-center">
                              <Book className="w-4 h-4 mr-1" />
                              {stream.courseName || 'Open Session'}
                            </div>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const event = {
                              title: stream.title,
                              description: stream.description,
                              start: new Date(stream.scheduledFor),
                              duration: stream.duration
                            };
                            // Implement calendar integration
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Add to Calendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}