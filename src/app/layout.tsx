import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Tour de Wognum 2026 — Het Wielerspel van Wognum',
  description: 'Doe mee aan de Tour de Wognum Poule! Kies je favoriete renners, voorspel de Tour de France 2026 en strijd mee voor de mooiste truien van Wognum.',
  keywords: 'tour de france, wognum, poule, wielerpoule, 2026, wielrennen',
  openGraph: {
    title: 'Tour de Wognum 2026',
    description: 'Het wielerspel van Wognum — doe mee!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
