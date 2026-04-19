import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { FilmRoll } from '@/components/layout/FilmRoll';
import { FloatingHearts } from '@/components/overlays/FloatingHearts';

export const metadata: Metadata = {
  title: 'Web Bucin ✨',
  description: 'Ruang spesial untuk merayakan kenangan kita.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Web Bucin',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF69B4', // Ceria (Pink)
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="https://img.icons8.com/fluency/48/heart.png" />
      </head>
      <body className="min-h-screen bg-bucin-bg text-bucin-text antialiased scroll-smooth overflow-x-hidden">
        <Navbar />
        <FilmRoll />
        <FloatingHearts />
        <main className="relative z-0 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
