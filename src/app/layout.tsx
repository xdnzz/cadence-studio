import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Cadence Studio | Real-Time Meeting Intelligence & Agentic Studio',
  description:
    'High-performance meeting intelligence workspace featuring decoupled 60 FPS audio waveform scrubbing, bidirectional word-level transcript synchronization, and an agentic post-meeting automation canvas.',
  keywords: [
    'Meeting Intelligence',
    'Audio Waveform',
    'Canvas API',
    'Web Audio API',
    'Speech-to-Text',
    'AI Workflows',
    'Next.js 15',
    'React 19',
    'TypeScript',
  ],
  authors: [{ name: 'Danilo Diniz', url: 'https://github.com/xdnzz' }],
  creator: 'Danilo Diniz',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cadence-studio.vercel.app',
    title: 'Cadence Studio | Real-Time Meeting Intelligence',
    description:
      'Decoupled 60 FPS waveform scrubbing, bidirectional transcript synchronization, and agentic meeting workflows.',
    siteName: 'Cadence Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cadence Studio | Real-Time Meeting Intelligence',
    description:
      'Decoupled 60 FPS waveform scrubbing, bidirectional transcript synchronization, and agentic meeting workflows.',
    creator: '@xdnzz',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-canvas font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}