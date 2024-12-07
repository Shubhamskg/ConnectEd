// components/Hero.jsx
"use client"
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  MessageSquarePlus,
  GraduationCap,
  Users,
  Globe,
  PlayCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export function Hero() {
  const stats = [
    { label: "Active Learners", value: "500+" },
    { label: "Expert Teachers", value: "50+" },
    { label: "Online Courses", value: "100+" },
    { label: "Success Rate", value: "95%" },
  ];

  const popularTopics = [
    "Teeth Whitening",
    "Restorative Dentistry",
    "Dental Nursing",
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "CPD Accredited",
      description: "Each hour counts towards your CPD requirements",
    },
    {
      icon: Users,
      title: "Expert-Led Learning",
      description: "Learn from dental professionals",
    },
    {
      icon: Globe,
      title: "Flexible Learning",
      description: "Access courses anytime, anywhere",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div 
        className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/10 rounded-full filter blur-3xl opacity-30"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-secondary/10 rounded-full filter blur-3xl opacity-30"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative">
        <div className="container px-4 py-16 md:py-24 mx-auto">
          {/* Top Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm font-medium">
              🎓 Join our growing community of dental professionals
            </Badge>
          </div>

          {/* Main heading section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Transforming the way you learn online
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Learn at your own pace and gain new skills with different online courses
            </p>

            {/* Search/Request section */}
            <form className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                  onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1 max-w-md">
                <MessageSquarePlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="What do you want to teach or learn?"
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">
                Submit Request
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Popular topics */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <span className="text-sm text-muted-foreground">
                Popular Topics:
              </span>
              {popularTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/courses?topic=${topic.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>

            {/* Statistics */}
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

          {/* Features grid */}
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

          {/* CTA Button */}
          <Button 
            variant="outline" 
            size="lg" 
            className="mx-auto flex items-center hover:bg-primary/5 transition-colors"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            How ConnectEd Works
          </Button>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <span className="text-muted-foreground">
                Trusted by leading dental professionals
              </span>
            </div>
            {/* <div className="flex flex-wrap justify-center gap-8">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="h-12 w-24 bg-muted/30 rounded-lg flex items-center justify-center"
                  aria-label={`Partner logo ${index}`}
                >
                  <span className="text-muted-foreground text-sm">Partner {index}</span>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}