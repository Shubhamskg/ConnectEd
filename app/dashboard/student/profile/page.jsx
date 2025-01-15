"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileEditForm from "@/components/ProfileEditForm";

// Extended schema for profile-specific fields
const INITIAL_PROFILE_STATE = {
  id: '',
  name: '',
  email: '',
  profile: {
    avatar: null,
    bio: '',
    location: '',
    website: '',
    education: [],
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: ''
    }
  },
  verified: false,
  createdAt: null,
  updatedAt: null
};

export default function StudentProfilePage() {
  const [student, setStudent] = useState(INITIAL_PROFILE_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Helper function to generate initials from name with null checks
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch('/api/student/profile', {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/student/login');
            return;
          }
          throw new Error(`Failed to fetch student data: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform the MongoDB data to match our frontend needs
        const transformedData = {
          id: data?._id || '',
          name: data?.name || 'Anonymous Student',
          email: data?.email || '',
          profile: {
            avatar: data?.profile?.avatar || null,
            bio: data?.profile?.bio || 'No bio provided',
            location: data?.profile?.location || 'Not specified',
            website: data?.profile?.website || '',
            education: Array.isArray(data?.profile?.education) ? data.profile.education : [],
            skills: Array.isArray(data?.profile?.skills) ? data.profile.skills : [],
            socialLinks: {
              linkedin: data?.profile?.socialLinks?.linkedin || '',
              github: data?.profile?.socialLinks?.github || '',
              twitter: data?.profile?.socialLinks?.twitter || ''
            }
          },
          verified: data?.verified || false,
          createdAt: data?.createdAt ? new Date(data.createdAt) : null,
          updatedAt: data?.updatedAt ? new Date(data.updatedAt) : null
        };

        setStudent(transformedData);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [router]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: updatedData.name,
          profile: {
            bio: updatedData.profile.bio,
            location: updatedData.profile.location,
            website: updatedData.profile.website,
            socialLinks: updatedData.profile.socialLinks
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setStudent(prev => ({
        ...prev,
        ...data,
        profile: {
          ...prev.profile,
          ...data.profile
        }
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      throw new Error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="space-y-8 p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profileData = {
    ...student,
    initials: getInitials(student.name),
    role: 'student'
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader 
  user={profileData} 
  isEditable={true} 
  onUpdate={handleProfileUpdate}
  EditForm={ProfileEditForm} 
/>
      <div className="py-8">
        <ProfileTabs 
          user={profileData} 
          isEditable={true}
          onUpdateEducation={async (educationData) => {
            try {
              const response = await fetch('/api/student/profile/education', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  profile: {
                    education: educationData
                  }
                })
              });

              if (!response.ok) {
                throw new Error('Failed to update education');
              }

              const data = await response.json();
              setStudent(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  education: data.profile.education
                }
              }));
            } catch (err) {
              console.error('Error updating education:', err);
              throw new Error('Failed to update education');
            }
          }}
          onUpdateSkills={async (skillsData) => {
            try {
              const response = await fetch('/api/student/profile/skills', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  profile: {
                    skills: skillsData
                  }
                })
              });

              if (!response.ok) {
                throw new Error('Failed to update skills');
              }

              const data = await response.json();
              setStudent(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  skills: data.profile.skills
                }
              }));
            } catch (err) {
              console.error('Error updating skills:', err);
              throw new Error('Failed to update skills');
            }
          }}
        />
      </div>
    </div>
  );
}