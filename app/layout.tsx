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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
      </head>
      <body className={`${inter.className} bg-background text-text min-h-screen flex flex-col`}>
        <ThemeToggle />
        <div className="flex-1">{children}</div>
        <footer className="text-center py-4 text-micro text-muted mt-auto space-y-1">
          <p>Session details may change — always check sxsw.com for the latest.</p>
          {process.env.NEXT_PUBLIC_BUILD_SHA && <p>{process.env.NEXT_PUBLIC_BUILD_SHA}</p>}
        </footer>
      </body>
    </html>
  )
}
