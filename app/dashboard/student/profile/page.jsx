// app/dashboard/student/profile/page.jsx
import { ProfileHeader } from "@/app/components/profile/ProfileHeader";
import { ProfileTabs } from "@/app/components/profile/ProfileTabs";

const studentData = {
  id: 1,
  name: "Alex Chen",
  role: "student",
  email: "alex.c@connected.edu",
  avatar: "/avatars/alex.jpg",
  initials: "AC",
  location: "San Francisco, USA",
  website: "https://alexchen.dev",
  bio: "Aspiring full-stack developer passionate about creating innovative web applications. Currently focused on mastering React and Node.js.",
  skills: ["JavaScript", "React", "HTML/CSS", "Git"],
};

export default function StudentProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader user={studentData} isEditable={true} />
      <div className="py-8">
        <ProfileTabs user={studentData} isEditable={true} />
      </div>
    </div>
  );
}