// app/teachers/page.js
import { Button } from '@/components/ui/button';

export default function TeachersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Enhance your teaching experience
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Whether you're teaching a class or managing an entire curriculum,
            we're here to support you.
          </p>
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
            Become a Teacher
          </Button>
        </div>
      </div>
    </div>
  );
}