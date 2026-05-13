import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
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
