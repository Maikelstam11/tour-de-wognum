'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/etappes', label: 'Etappes' },
  { href: '/renners', label: 'Renners' },
  { href: '/klassementen', label: 'Klassement' },
  { href: '/spelregels', label: 'Spelregels' },
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
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(14,14,20,0.78)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display text-sm font-bold"
                style={{ background: 'var(--accent)', color: 'var(--accent-deep)' }}
              >
                TDW
              </div>
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                style={{ background: '#F43F5E', borderColor: 'var(--bg-0)' }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-base leading-none" style={{ color: 'var(--fg-0)' }}>
                Tour de Wognum
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>
                Wielerspel 2026
              </div>
            </div>
          </Link>

          {/* Desktop center nav — pill container */}
          <div
            className="hidden md:flex items-center gap-0.5 p-1 rounded-2xl"
            style={{ background: 'var(--bg-2)' }}
          >
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
                  style={
                    isActive
                      ? { background: 'var(--bg-3)', color: 'var(--fg-0)', fontWeight: 600 }
                      : { color: 'var(--fg-3)' }
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: meedoen + mobile toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/meedoen"
              className="hidden sm:block px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-105"
              style={{ background: 'var(--accent)', color: 'var(--accent-deep)' }}
            >
              Meedoen
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ background: 'var(--bg-2)', color: 'var(--fg-2)' }}
              aria-label="Menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 rounded bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 rounded bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 rounded bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96' : 'max-h-0'}`}
        style={{ borderTop: menuOpen ? '1px solid var(--bg-2)' : 'none' }}
      >
        <div className="px-4 pb-4 pt-2 space-y-1" style={{ background: 'var(--bg-1)' }}>
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={
                  isActive
                    ? { background: 'var(--bg-3)', color: 'var(--fg-0)', fontWeight: 600 }
                    : { color: 'var(--fg-3)' }
                }
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/meedoen"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-bold text-center mt-2"
            style={{ background: 'var(--accent)', color: 'var(--accent-deep)' }}
          >
            Meedoen
          </Link>
        </div>
      </div>
    </nav>
  );
}
