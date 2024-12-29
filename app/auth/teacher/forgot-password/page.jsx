// app/auth/teacher/forgot-password/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function TeacherForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/teacher/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      setSuccess("Password reset instructions have been sent to your email");
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          {/* <div className="flex items-center gap-2 text-[#3b82f6]">
            <GraduationCap className="h-8 w-8" />
            <span className="text-2xl font-bold">ConnectEd</span>
          </div> */}
          <CardTitle className="text-2xl">Reset Teacher Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you password reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
              disabled={loading}
            >
              {loading ? "Processing..." : "Send Reset Instructions"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link 
              href="/auth/teacher/login" 
              className="text-[#3b82f6] hover:underline inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}