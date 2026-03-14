import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dall Academy — Pass Your SDLE. First Try.',
  description:
    "Saudi Arabia's first AI-powered SDLE preparation platform. Personalized study plans, smart Q-Bank, full mock exams, and your AI dental tutor.",
  keywords: ['SDLE', 'Saudi Dental Licensing Exam', 'SCFHS', 'Dental exam prep'],
  openGraph: {
    title: 'Dall Academy',
    description: 'Pass Your SDLE. First Try.',
    siteName: 'Dall Academy',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111320',
              color: '#F5F9FB',
              border: '1px solid rgba(74,143,163,0.3)',
              borderRadius: '8px',
            },
            success: {
              iconTheme: { primary: '#4A8FA3', secondary: '#F5F9FB' },
            },
          }}
        />
      </body>
    </html>
  )
}
