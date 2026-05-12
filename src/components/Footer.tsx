import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'rgba(15, 14, 23, 0.95)', borderTop: '1px solid var(--tour-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="font-display text-2xl mb-2" style={{ color: 'var(--tour-yellow)' }}>
              Tour de Wognum
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--tour-text-muted)' }}>
              Het officiele wielerspel van Wognum voor de Tour de France 2026.
              Strijd mee voor de mooiste truien!
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
              Navigatie
            </div>
            <div className="space-y-2">
              {[
                { href: '/etappes', label: 'Etappes' },
                { href: '/renners', label: 'Renners & Ploegen' },
                { href: '/klassementen', label: 'Klassementen' },
                { href: '/spelregels', label: 'Spelregels' },
                { href: '/meedoen', label: 'Aanmelden' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-sm transition-colors hover:text-white"
                  style={{ color: 'var(--tour-text-muted)' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Jersey guide */}
          <div>
            <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
              De Zes Truien
            </div>
            <div className="space-y-2">
              {[
                { color: '#FFD700', label: 'Gele Trui — Algemeen Klassement' },
                { color: '#00A651', label: 'Groene Trui — Sprintklassement' },
                { color: '#E2001A', label: 'Bolletjestrui — Bergklassement' },
                { color: '#FFFFFF', label: 'Witte Trui — Jongerenklassement' },
                { color: '#0055A4', label: 'Blauwe Trui — Dagwinnaar' },
                { color: '#CC0000', label: 'Rode Lantaarn — Laatste plek' },
              ].map((j) => (
                <div key={j.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: j.color }} />
                  <span className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>{j.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--tour-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
            © 2026 Tour de Wognum · Een initiatief van het dorp Wognum
          </p>
          <div className="flex gap-2">
            {['🟡', '🟢', '🔴', '⚪', '🔵', '🔴'].map((e, i) => (
              <span key={i} className="text-lg">{e}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
