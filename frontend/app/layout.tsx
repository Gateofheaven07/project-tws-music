import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import QueryProvider from '@/providers/QueryProvider'
import { PlayerBar } from '@/components/PlayerBar'
import { Sidebar } from '@/components/Sidebar'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SoundWave - Music Player',
  description: 'A modern music player inspired by Spotify. Discover, play, and enjoy your favorite music.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  userScalable: false,
  initialScale: 1,
  width: 'device-width',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground flex flex-col h-screen overflow-hidden">
        <QueryProvider>
          <LayoutContent>{children}</LayoutContent>
        </QueryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import { usePathname } from 'next/navigation'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  if (isAuthPage) {
    return <div className="flex-1 overflow-auto">{children}</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Global */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
      
      {/* Player Bar Global */}
      <PlayerBar />
    </div>
  )
}
