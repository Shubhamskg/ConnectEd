// components/Footer.jsx
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  InstagramIcon,
  YoutubeIcon,
  Mail,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
      { name: 'Impact', href: '/impact' },
    ],
    teach: [
      { name: 'Become a Teacher', href: '/teach' },
      { name: 'Teacher Resources', href: '/resources' },
      { name: 'Teaching Guidelines', href: '/guidelines' },
      { name: 'Partner Program', href: '/partner-program' },
      { name: 'Teacher Forum', href: '/forum' },
    ],
    learn: [
      { name: 'All Courses', href: '/courses' },
      { name: 'Free Certificates', href: '/certificates' },
      { name: 'Student Support', href: '/support' },
      { name: 'Success Stories', href: '/success-stories' },
      { name: 'Scholarships', href: '/scholarships' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  };

  const socialLinks = [
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
    { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
    { icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="w-full bg-background border-t">
      <div className="container px-4 py-12 mx-auto">
        {/* Newsletter Section */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12 pb-12 border-b">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Join our learning community
            </h3>
            <p className="text-muted-foreground">
              Get updates on new courses, teaching tips, and learning resources delivered to your inbox.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="max-w-sm"
            />
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Teach</h4>
            <ul className="space-y-2">
              {footerLinks.teach.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="font-bold text-xl">
                ConnectEd
              </Link>
              <span className="text-sm text-muted-foreground">
                © {currentYear} ConnectEd Learning. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              🌎 Available in multiple languages. Learn from anywhere in the world.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}