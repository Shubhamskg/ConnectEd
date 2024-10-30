// components/LiveClasses.jsx
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function LiveClasses() {
  const upcomingClasses = [
    {
      title: "Introduction to Web Development",
      teacher: "Sarah Johnson",
      time: "10:00 AM EST",
      date: "Tomorrow",
    },
    {
      title: "Advanced Mathematics",
      teacher: "Dr. Michael Chen",
      time: "2:00 PM EST",
      date: "Today",
    },
    {
      title: "Digital Marketing Fundamentals",
      teacher: "Emily Rodriguez",
      time: "11:30 AM EST",
      date: "Today",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Live Classes Happening Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingClasses.map((class_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{class_.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">by {class_.teacher}</p>
                <p className="text-sm font-medium mt-2">
                  {class_.date} at {class_.time}
                </p>
                <Button className="w-full mt-4">Join Class</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}