'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/etappes', label: 'Etappes' },
  { href: '/renners', label: 'Renners' },
  { href: '/klassementen', label: 'Klassementen' },
  { href: '/spelregels', label: 'Spelregels' },
  { href: '/meedoen', label: 'Meedoen', highlight: true },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      {/* Gekleurde top-balk */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{ background: 'linear-gradient(90deg, #E8B800 0%, #CC0015 50%, #0055A4 100%)' }}
      />

      <nav
        className="fixed top-1 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--tour-border)',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-display text-black text-lg font-bold"
                  style={{ background: 'var(--tour-yellow)' }}
                >
                  TW
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: 'var(--tour-red)' }}
                />
              </div>
              <div>
                <div className="font-display text-lg leading-none" style={{ color: 'var(--tour-text)' }}>
                  Tour de Wognum
                </div>
                <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                  Wielerspel 2026
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      link.highlight ? 'text-black font-bold ml-2' : ''
                    }`}
                    style={
                      link.highlight
                        ? { background: 'var(--tour-yellow)' }
                        : isActive
                        ? { background: 'var(--tour-yellow-light)', color: 'var(--tour-yellow-dark)', fontWeight: 600 }
                        : { color: 'var(--tour-text-muted)' }
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--tour-text-muted)' }}
              aria-label="Menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ background: 'white', borderTop: '1px solid var(--tour-border)' }}
        >
          <div className="px-4 pb-4 pt-2 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    link.highlight ? 'text-center font-bold text-black' : ''
                  }`}
                  style={
                    link.highlight
                      ? { background: 'var(--tour-yellow)' }
                      : isActive
                      ? { background: 'var(--tour-yellow-light)', color: 'var(--tour-yellow-dark)' }
                      : { color: 'var(--tour-text-muted)' }
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
