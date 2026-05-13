import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--bg-2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-sm font-bold"
                style={{ background: 'var(--accent)', color: 'var(--accent-deep)' }}
              >
                TDW
              </div>
              <span className="font-display text-xl" style={{ color: 'var(--fg-0)' }}>
                Tour de Wognum
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-3)' }}>
              Het officiële wielerspel van Wognum voor de Tour de France 2026. Strijd mee voor de mooiste truien!
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
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
                  className="block text-sm transition-colors"
                  style={{ color: 'var(--fg-3)' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Jersey guide */}
          <div>
            <div className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              De Zes Truien
            </div>
            <div className="space-y-2">
              {[
                { color: '#FFD700', label: 'Gele Trui — Algemeen Klassement' },
                { color: '#00A651', label: 'Groene Trui — Sprintklassement' },
                { color: '#E2001A', label: 'Bolletjestrui — Bergklassement' },
                { color: '#E8E8E8', label: 'Witte Trui — Jongerenklassement' },
                { color: '#0055A4', label: 'Blauwe Trui — Dagwinnaar' },
                { color: '#CC0000', label: 'Rode Lantaarn — Laatste plek' },
              ].map((j) => (
                <div key={j.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: j.color }} />
                  <span className="text-xs" style={{ color: 'var(--fg-3)' }}>{j.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--bg-2)' }}
        >
          <p className="text-xs" style={{ color: 'var(--fg-3)' }}>
            © 2026 Tour de Wognum · Een initiatief van het dorp Wognum
          </p>
          <div className="flex gap-1.5 items-center">
            {[
              { c: '#FFD700' }, { c: '#00A651' }, { c: '#E2001A' },
              { c: '#E8E8E8' }, { c: '#0055A4' }, { c: '#CC0000' },
            ].map((j, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: j.c }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
