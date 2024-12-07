// components/FAQ.jsx
"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search, ChevronDown } from "lucide-react";

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      name: "General",
      icon: "🎓",
      faqs: [
        {
          question: "What courses does ConnectEd offer?",
          answer: "ConnectEd offers a wide range of online courses in dental and healthcare fields. Our courses are designed for professionals looking to enhance their skills or for students preparing for careers in these industries.",
        },
        {
          question: "How do live online classes work?",
          answer: "Our live online classes are conducted through a secure video conferencing platform. You'll be able to interact with the instructor and other students in real-time, ask questions, and participate in discussions, just like in a physical classroom.",
        },
      ],
    },
    {
      name: "Accreditation",
      icon: "✅",
      faqs: [
        {
          question: "Are the courses CPD accredited?",
          answer: "Yes, our courses are CPD accredited. Each hour spent learning on the ConnectEd platform counts towards your CPD requirements. The specific accreditations are listed on each course page.",
        },
        {
          question: "How do I get my CPD certificate?",
          answer: "Upon completion of a course, you'll automatically receive your CPD certificate via email. You can also download your certificates at any time from your learner dashboard.",
        },
      ],
    },
    {
      name: "Teaching",
      icon: "👨‍🏫",
      faqs: [
        {
          question: "How do I become a teacher?",
          answer: "To become a teacher, simply click on the 'Start Teaching' button, create your profile, and submit your course proposal. Our team will review it and help you get started. We provide all the tools and support you need.",
        },
        {
          question: "What is the payment structure for teachers?",
          answer: "Teachers keep 85% of their course earnings. ConnectEd takes only a 15% fee when you make a sale. There are no monthly charges or hidden fees. You can track all your earnings in real-time through your dashboard.",
        },
      ],
    },
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about ConnectEd
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-12">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search questions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredCategories.map((category) => (
            <div
              key={category.name}
              className="bg-background rounded-lg shadow-sm border p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-xl font-semibold">{category.name}</h3>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {category.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.name}-${index}`}
                    className="border rounded-lg px-4 transition-all duration-200"
                  >
                    <AccordionTrigger className="text-left hover:no-underline group">
                      <div className="flex items-start justify-between w-full pr-4">
                        <span className="text-sm font-medium">{faq.question}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground transition-all duration-200 overflow-hidden">
                      <div className="pt-2 pb-4">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 text-center bg-white rounded-lg shadow-sm border p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            We're here to help. Our support team is available 24/7 to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline">
              Browse Help Center
            </Button>
            <Button size="lg">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}