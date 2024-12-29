// app/api/test-email/route.js
import { NextResponse } from 'next/server';
import { testEmailConfiguration } from '@/lib/email';

export async function GET() {
  const result = await testEmailConfiguration();
  
  if (result.success) {
    return NextResponse.json({ message: 'Email configuration is valid' });
  }

  return NextResponse.json(
    { message: 'Email configuration failed', error: result.error },
    { status: 500 }
  );
}