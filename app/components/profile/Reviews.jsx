// components/profile/Reviews.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Star } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";


const reviews = [
  {
    id: 1,
    rating: 5,
    content: "Excellent teaching style! Very clear explanations and helpful with questions.",
    student: {
      name: "Alex Chen",
      avatar: "/placeholders/course-1.jpeg",
      course: "Advanced Web Development",
      date: "2024-10-25",
    },
  },
  {
    id: 2,
    rating: 4,
    content: "Great course content and structure. Would recommend to other students.",
    student: {
      name: "Sarah Johnson",
      avatar: "/placeholders/course-1.jpeg",
      course: "UI/UX Design Fundamentals",
      date: "2024-10-20",
    },
  },
  {
    id: 3,
    rating: 5,
    content: "Incredibly knowledgeable instructor with real-world examples.",
    student: {
      name: "Michael Brown",
      avatar: "/placeholders/course-1.jpeg",
      course: "Data Structures & Algorithms",
      date: "2024-10-15",
    },
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const averageRating = (
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Reviews</CardTitle>
            <Badge variant="secondary">
              {averageRating} / 5.0
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{averageRating}</div>
            <div className="space-y-1">
              <StarRating rating={Number(averageRating)} />
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={review.student.avatar} />
                      <AvatarFallback>{review.student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.student.course}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{review.content}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Reviewed on {new Date(review.student.date).toLocaleDateString()}
                  </p>
                  <Badge variant="outline">Verified Student</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center">
        <Button variant="outline">Load More Reviews</Button>
      </div>
    </div>
  );
}
