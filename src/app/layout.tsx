import type { Metadata, Viewport } from 'next';
import { Inter, Dancing_Script } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { FilmRoll } from '@/components/layout/FilmRoll';
import { FloatingHearts } from '@/components/overlays/FloatingHearts';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing' });

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
  themeColor: '#FF69B4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="https://img.icons8.com/fluency/48/heart.png" />
        <link rel="apple-touch-icon" href="https://img.icons8.com/fluency/144/heart.png" />
      </head>
      <body className={`${inter.variable} ${dancingScript.variable} font-sans min-h-screen bg-bucin-bg text-bucin-text antialiased scroll-smooth overflow-x-hidden`}>
        <Navbar />
        <FilmRoll />
        <FloatingHearts />
        <main className="relative min-h-screen">{children}</main>
      </body>
    </html>
  );
}
