import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VISIEN — Vision Inspired by Story and Idea | Every Nation',
  description: 'AI-guided client discovery and app-planning platform by Every Nation GG. Turn your idea into a production-ready application blueprint.',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VISIEN',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="visien-ambient-glow" aria-hidden="true" />
        <main>{children}</main>
      </body>
    </html>
  );
}
