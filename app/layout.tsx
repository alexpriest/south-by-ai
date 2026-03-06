import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'South by AI — Your Personalized SXSW 2026 Schedule',
  description: '60-second quiz. Personalized SXSW 2026 schedule built by AI. No more tab overload.',
  openGraph: {
    title: 'South by AI — AI-Powered SXSW Schedule Builder',
    description: '3,700+ sessions. One quiz. Your SXSW schedule, built by AI in seconds.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
      </head>
      <body className={`${inter.className} bg-background text-text min-h-screen`}>
        <ThemeToggle />
        {children}
        <footer className="text-center py-4 text-[10px] text-muted/50">
          {process.env.NEXT_PUBLIC_BUILD_SHA}
        </footer>
      </body>
    </html>
  )
}
