// app/auth/teacher/login/page.jsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { GraduationCap } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      router.push("/dashboard/teacher");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {searchParams.get("success") && (
        <Alert className="mb-4 bg-green-50 text-green-700">
          <AlertDescription>{searchParams.get("success")}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link 
            href="/auth/teacher/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
}

export default function TeacherLogin() {
  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          {/* <div className="flex items-center gap-2 text-blue-600">
            <GraduationCap className="h-8 w-8" />
            <span className="text-2xl font-bold">ConnectEd</span>
          </div> */}
          <CardTitle className="text-2xl">Teacher Login</CardTitle>
          <CardDescription>
            Access your teaching dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          }>
            <LoginForm />
          </Suspense>
          <div className="mt-4 text-center text-sm">
            Want to start teaching?{" "}
            <Link href="/auth/teacher/signup" className="text-blue-600 hover:underline">
              Create teacher account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}