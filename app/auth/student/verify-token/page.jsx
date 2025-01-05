'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setError('Verification token is missing');
          setStatus('error');
          return;
        }

        console.log('Verifying token:', token); // Debug log

        const response = await fetch(
          `/api/auth/student/verify-token?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        setTimeout(() => {
          router.push('/auth/student/login?success=' + encodeURIComponent(data.message));
        }, 3000);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    verifyToken();
  }, [token, router]);

  const handleResendVerification = () => {
    router.push('/auth/student/login'); // Redirect to login where they can request new verification
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <Alert className="bg-green-50 text-green-700">
            <AlertDescription>
              Email verified successfully! Redirecting to login page...
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Failed to verify email. The verification link may be invalid or expired.'}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleResendVerification}
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyTokenPage() {
  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <Suspense fallback={
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      }>
        <VerificationContent />
      </Suspense>
    </div>
  );
}