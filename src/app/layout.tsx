import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web Bucin',
  description: 'Roadmap execution starter for Web Bucin project.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
