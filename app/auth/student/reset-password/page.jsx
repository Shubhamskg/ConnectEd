// app/auth/student/reset-password/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function StudentResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });

  // Verify token on mount
  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(`/api/auth/student/verify-token?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid or expired reset link");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setVerifying(false);
      }
    }

    if (token) {
      verifyToken();
    } else {
      setError("Reset token is missing");
      setVerifying(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/student/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Password has been reset successfully");
      setTimeout(() => {
        router.push("/auth/student/login?success=Password reset successful. Please login with your new password.");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          {/* <div className="flex items-center gap-2 text-[#3b82f6]">
            <GraduationCap className="h-8 w-8" />
            <span className="text-2xl font-bold">ConnectEd</span>
          </div> */}
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="text-center">
                <Link
                  href="/auth/student/forgot-password"
                  className="text-[#3b82f6] hover:underline inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Request new reset link
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <Alert className="bg-green-50 text-green-700">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}