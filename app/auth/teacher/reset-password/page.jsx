// // app/auth/teacher/reset-password/page.jsx
// "use client";

// import { useState, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { GraduationCap, ArrowLeft } from "lucide-react";

// // Separate form component that uses useSearchParams
// function ResetPasswordForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [formData, setFormData] = useState({
//     password: "",
//     confirmPassword: ""
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     if (formData.password.length < 8) {
//       setError("Password must be at least 8 characters long");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("/api/auth/teacher/reset-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           token,
//           password: formData.password
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to reset password");
//       }

//       setSuccess("Password has been reset successfully");
//       setTimeout(() => {
//         router.push("/auth/teacher/login?success=Password reset successful. Please login with your new password.");
//       }, 2000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <div className="space-y-4">
//         <Alert variant="destructive">
//           <AlertDescription>Reset token is missing</AlertDescription>
//         </Alert>
//         <div className="text-center">
//           <Link
//             href="/auth/teacher/forgot-password"
//             className="text-[#3b82f6] hover:underline inline-flex items-center"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Request new reset link
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//       {success && (
//         <Alert className="bg-green-50 text-green-700">
//           <AlertDescription>{success}</AlertDescription>
//         </Alert>
//       )}
//       <div className="space-y-2">
//         <Label htmlFor="password">New Password</Label>
//         <Input
//           id="password"
//           type="password"
//           required
//           value={formData.password}
//           onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//           placeholder="Enter your new password"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="confirmPassword">Confirm New Password</Label>
//         <Input
//           id="confirmPassword"
//           type="password"
//           required
//           value={formData.confirmPassword}
//           onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//           placeholder="Confirm your new password"
//         />
//       </div>
//       <Button 
//         type="submit" 
//         className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
//         disabled={loading}
//       >
//         {loading ? "Resetting Password..." : "Reset Password"}
//       </Button>
//     </form>
//   );
// }

// // Main page component
// export default function TeacherResetPassword() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
//       <Card className="w-full max-w-lg">
//         <CardHeader className="space-y-1 flex flex-col items-center">
//           <div className="flex items-center gap-2 text-[#3b82f6]">
//             <GraduationCap className="h-8 w-8" />
//             <span className="text-2xl font-bold">ConnectEd</span>
//           </div>
//           <CardTitle className="text-2xl">Reset Your Teacher Password</CardTitle>
//           <CardDescription>
//             Enter your new password below
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Suspense 
//             fallback={
//               <div className="space-y-4">
//                 <div className="h-10 bg-gray-100 rounded animate-pulse" />
//                 <div className="h-10 bg-gray-100 rounded animate-pulse" />
//                 <div className="h-10 bg-gray-100 rounded animate-pulse" />
//               </div>
//             }
//           >
//             <ResetPasswordForm />
//           </Suspense>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// app/auth/teacher/reset-password/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/auth/teacher/login');
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/teacher/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/teacher/login?success=' + encodeURIComponent('Password reset successfully. Please log in with your new password.'));
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-50 text-green-700">
              <AlertDescription>
                Password reset successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}