// app/layout.jsx
import './globals.scss'
import { Inter } from 'next/font/google'
import { cn } from './lib/utils'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './components/Notifications/NotificationContext'

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
         <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}