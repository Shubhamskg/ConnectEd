// app/auth/layout.js
export const metadata = {
    title: {
      default: 'Authentication - ConnectEd',
      template: '%s | ConnectEd',
    },
    description: 'Authentication pages for ConnectEd learning platform',
  };
  
  import Link from "next/link";
  import { Button } from "@/app/components/ui/button";
import { Navbar } from "../components/Navbar";
  
  export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen bg-background">
      <Navbar/>
        <main className="container flex min-h-screen flex-col items-center justify-center">
          {children}
        </main>
  
      </div>
    );
  }