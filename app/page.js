import { MainLayout } from '@/app/components/MainLayout';
import { Hero } from '@/app/components/Hero';
import { FeaturedCourses } from '@/app/components/FeaturedCourses';
import { LiveClasses } from '@/app/components/LiveClasses';
import { HowItWorks } from '@/app/components/HowItWorks';
import { TeacherCTA } from '@/app/components/TeacherCTA';
import { Pricing } from '@/app/components/Pricing';
import { FAQ } from '@/app/components/FAQ';
import { CTASection } from '@/app/components/CTASection';
import { Newsletter } from '@/app/components/Newsletter';
import { Stats } from '@/app/components/Stats';

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <Stats />
      <FeaturedCourses />
      <LiveClasses />
      <HowItWorks />
      <TeacherCTA />
      <Pricing />
      <FAQ />
      <Newsletter />
      <CTASection />
    </MainLayout>
  );
}