// app/dashboard/layout.js
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";

export default async function DashboardRootLayout({ children, params }) {
  // Determine userType based on URL or auth state
  const paramsSlug = await params
  const userType =  paramsSlug.slug?.[0] === 'teacher' ? 'teacher' : 'student';
  console.log('User Type:', paramsSlug);
  
  return <DashboardLayout userType={'student'}>{children}</DashboardLayout>;
}