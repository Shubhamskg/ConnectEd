// components/Hero.jsx
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Search,
  GraduationCap,
  Users,
  Globe,
  PlayCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function Hero() {
  const stats = [
    { label: "Active Learners", value: "50K+" },
    { label: "Expert Teachers", value: "1,200+" },
    { label: "Online Courses", value: "2,500+" },
    { label: "Success Rate", value: "95%" },
  ];

  const popularTopics = [
    "Web Development",
    "Data Science",
    "Digital Marketing",
    "Business",
    "Design",
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "Expert-Led Learning",
      description: "Learn from industry professionals",
    },
    {
      icon: Users,
      title: "Interactive Community",
      description: "Collaborate with peer learners",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Learn anytime, anywhere",
    },
  ];

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Main Hero Section */}
      <div className="relative">
        <div className="container px-4 py-16 md:py-24 mx-auto">
          {/* Top Badge */}
          <div className="flex justify-center mb-8">
            <Badge
              variant="secondary"
              className="px-4 py-1 text-sm bg-secondary/50 hover:bg-secondary/60"
            >
              🎉 Join over 50,000 learners worldwide
            </Badge>
          </div>

          {/* Main Content */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform Your Future with{" "}
              <span className="text-primary">Expert-Led</span> Learning
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Access world-class education from anywhere. Learn at your own pace
              and achieve your goals with our comprehensive online courses.
            </p>

            {/* Search and CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for courses..."
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" className="h-12">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Popular Topics */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <span className="text-sm text-muted-foreground">
                Popular Topics:
              </span>
              {popularTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/courses?topic=${topic.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-primary hover:underline"
                >
                  {topic}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <span className="text-muted-foreground">
                Trusted by leading companies worldwide
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 opacity-50">
              {/* Replace with actual company logos */}
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="h-8 w-24 bg-foreground/10 rounded"
                />
              ))}
            </div>
          </div>

          {/* Demo Video Button */}
          <div className="absolute bottom-4 right-4">
            <Button variant="outline" size="lg" className="rounded-full">
              <PlayCircle className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Background Gradient Effects */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/10 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-secondary/10 rounded-full filter blur-3xl opacity-30" />
    </div>
  );
}

