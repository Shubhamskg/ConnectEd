// app/page.js
import { Hero } from '@/app/components/Hero';
import { Features } from '@/app/components/Features';
import { LiveClasses } from '@/app/components/LiveClasses';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export default function Home() {
  return (
    <>
    <Navbar/>
      <Hero />
      <Features />
      <LiveClasses />
      <Footer/>
    </>
  );
}