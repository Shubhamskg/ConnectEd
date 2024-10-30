
import { Inter } from 'next/font/google';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ConnectEd Learning Platform',
  description: 'Changing the way we learn and teach online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />

        <main >{children}</main>
        <Footer />

      </body>
    </html>
  );
}