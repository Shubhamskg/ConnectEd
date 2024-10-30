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
  
  export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simplified Header */}
        <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">ConnectEd</span>
            </Link>
          </div>
        </header>
  
        {/* Main Content */}
        <main className="container flex min-h-screen flex-col items-center justify-center">
          {children}
        </main>
  
        {/* Simplified Footer */}
        <footer className="fixed bottom-0 w-full border-t bg-background py-4">
          <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ConnectEd. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                Privacy
              </Link>
              <Link href="/help" className="text-sm text-muted-foreground hover:underline">
                Help
              </Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }