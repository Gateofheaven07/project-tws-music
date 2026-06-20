import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import QueryProvider from '@/providers/QueryProvider'
import { LayoutContent } from '@/components/LayoutContent'
import { Toaster } from 'sonner'

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning
        className={`${hankenGrotesk.className} antialiased bg-background text-foreground min-h-dvh overflow-x-hidden`}
      >
        <QueryProvider>
          <LayoutContent>{children}</LayoutContent>
        </QueryProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
