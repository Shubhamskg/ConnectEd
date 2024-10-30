// // app/layout.js
// import './globals.scss';
// import { Inter } from 'next/font/google';
// import { Navbar } from '@/app/components/Navbar';
// import { Footer } from '@/app/components/Footer';
// import Providers from "./providers";

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'ConnectEd Learning Platform',
//   description: 'Changing the way we learn and teach online',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {/* <Navbar /> */}
//         <Providers>

//         <main className="min-h-screen">{children}</main>
        
//         </Providers>
//         {/* <Footer/> */}

//       </body>
//     </html>
//   );
// }
// app/layout.jsx
import './globals.scss'
import { Inter } from 'next/font/google'
import { cn } from '@/app/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ConnectEd Learning Platform',
  description: 'Transform your future with expert-led learning',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased"
      )}>
        {children}
      </body>
    </html>
  )
}