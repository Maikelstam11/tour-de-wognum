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
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(15, 14, 23, 0.97)'
            : 'rgba(15, 14, 23, 0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(42, 40, 80, 0.8)' : 'none',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
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
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ background: 'var(--tour-red)' }}
                />
              </div>
              <div>
                <div
                  className="font-display text-lg leading-none"
                  style={{ color: 'var(--tour-yellow)' }}
                >
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
                      link.highlight
                        ? 'text-black font-bold ml-2'
                        : isActive
                        ? 'text-white'
                        : 'hover:text-white'
                    }`}
                    style={
                      link.highlight
                        ? { background: 'var(--tour-yellow)' }
                        : isActive
                        ? { background: 'rgba(255,215,0,0.15)', color: 'var(--tour-yellow)' }
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
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ background: 'rgba(15, 14, 23, 0.98)' }}
        >
          <div className="px-4 pb-4 space-y-1">
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
                      ? { background: 'rgba(255,215,0,0.15)', color: 'var(--tour-yellow)' }
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

      {/* Yellow top bar accent */}
      <div
        className="fixed top-0 left-0 right-0 h-0.5 z-50"
        style={{ background: 'linear-gradient(90deg, var(--tour-yellow), var(--tour-red), var(--tour-blue))' }}
      />
    </>
  );
}
