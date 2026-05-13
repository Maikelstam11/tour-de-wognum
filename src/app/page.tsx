import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import JerseyIcon from '@/components/JerseyIcon';
import { db } from '@/db';
import { stages, participants } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { stageTypeLabel, stageTypeColor } from '@/lib/scoring';
import { formatShortDate } from '@/lib/utils';

async function getHomeData() {
  try {
    const [allStages, participantCount] = await Promise.all([
      db.select().from(stages).orderBy(stages.stageNumber),
      db.select({ count: sql<number>`count(*)` }).from(participants),
    ]);
    return {
      stages: allStages,
      participantCount: Number(participantCount[0]?.count ?? 0),
    };
  } catch {
    return { stages: [], participantCount: 0 };
  }
}

const jerseys = [
  { type: 'yellow' as const, label: 'Gele Trui', sub: 'Algemeen Klassement', color: '#FFD700' },
  { type: 'green' as const, label: 'Groene Trui', sub: 'Sprintklassement', color: '#00A651' },
  { type: 'polka' as const, label: 'Bolletjestrui', sub: 'Bergklassement', color: '#E2001A' },
  { type: 'white' as const, label: 'Witte Trui', sub: 'Jongeren', color: '#E8E8E8' },
  { type: 'blue' as const, label: 'Blauwe Trui', sub: 'Dagwinnaar', color: '#0055A4' },
  { type: 'red_lantern' as const, label: 'Rode Lantaarn', sub: 'Laatste plek', color: '#CC0000' },
];

const howItWorks = [
  { icon: '🚴', title: 'Kies 20 renners', desc: 'Stel jouw droomploeg samen uit alle 184 Tour-deelnemers.' },
  { icon: '⭐', title: 'Kies een kopman', desc: 'Jouw kopman scoort dubbel. Kies verstandig!' },
  { icon: '🏆', title: 'Voorspel de top 5', desc: 'Voorspel de eindwinnaar en top 5 voor bonuspunten.' },
  { icon: '💰', title: 'Strijd om de pot', desc: '€10 inleg, de beste wielerfanaat wint alles.' },
];

export default async function HomePage() {
  const { stages: allStages, participantCount } = await getHomeData();
  const upcomingStages = allStages.filter(s => s.status !== 'completed').slice(0, 5);
  const activeStage = allStages.find(s => s.status === 'active');
  const completedStages = allStages.filter(s => s.status === 'completed').length;

  return (
    <div>
      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
        style={{ background: 'var(--bg-0)' }}
      >
        {/* Accent glow blobs */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(217,255,63,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(217,255,63,0.04), transparent)',
            clipPath: 'polygon(0 100%, 8% 50%, 18% 72%, 28% 22%, 38% 58%, 48% 8%, 58% 52%, 68% 18%, 78% 48%, 88% 28%, 100% 42%, 100% 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{
              background: 'rgba(217,255,63,0.12)',
              border: '1px solid rgba(217,255,63,0.25)',
              color: 'var(--accent)',
            }}
          >
            Tour de France 2026 · 4 juli – 26 juli
          </div>

          <h1 className="font-display leading-none mb-6" style={{ fontSize: 'clamp(4rem, 12vw, 9rem)' }}>
            <span style={{ color: 'var(--accent)' }}>Tour de</span>
            <br />
            <span style={{ color: 'var(--fg-0)' }}>Wognum</span>
          </h1>

          <p className="text-lg sm:text-xl mb-6 max-w-xl mx-auto" style={{ color: 'var(--fg-3)' }}>
            Het officiële wielerspel van Wognum voor de Tour de France 2026
          </p>

          {participantCount > 0 && (
            <p className="text-sm mb-8" style={{ color: 'var(--fg-3)' }}>
              <span className="font-bold" style={{ color: 'var(--fg-0)' }}>{participantCount}</span> wielerfanaten doen al mee
            </p>
          )}

          {/* Countdown */}
          <div className="mb-10">
            <div
              className="text-xs uppercase tracking-widest mb-3 font-bold"
              style={{ color: 'var(--fg-3)' }}
            >
              Start over
            </div>
            <CountdownTimer />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/meedoen"
              className="px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-deep)',
                boxShadow: '0 0 40px rgba(217,255,63,0.25)',
              }}
            >
              🏆 Doe mee aan de poule
            </Link>
            <Link
              href="/etappes"
              className="px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--bg-3)',
                color: 'var(--fg-0)',
                border: '1px solid var(--line-2)',
              }}
            >
              📍 Bekijk de etappes
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>Scroll</div>
          <div className="w-px h-8" style={{ background: 'var(--fg-3)' }} />
        </div>
      </section>

      {/* LIVE BANNER */}
      {activeStage && (
        <section
          className="py-3"
          style={{
            background: 'rgba(217,255,63,0.06)',
            borderTop: '1px solid rgba(217,255,63,0.15)',
            borderBottom: '1px solid rgba(217,255,63,0.15)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="live-badge">LIVE</span>
              <span className="font-bold text-sm" style={{ color: 'var(--fg-0)' }}>
                Etappe {activeStage.stageNumber}
              </span>
              <span className="text-sm" style={{ color: 'var(--fg-3)' }}>
                {activeStage.startLocation} → {activeStage.finishLocation}
              </span>
            </div>
            <Link
              href={`/etappes/${activeStage.stageNumber}`}
              className="text-xs font-bold hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Volg live →
            </Link>
          </div>
        </section>
      )}

      {/* STATS ROW */}
      {allStages.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: allStages.length, label: 'Etappes', unit: '' },
                { value: Math.round(allStages.reduce((s, e) => s + e.distanceKm, 0)).toLocaleString('nl-NL'), label: 'Totaal', unit: 'km' },
                { value: completedStages, label: 'Gereden', unit: '' },
                { value: participantCount, label: 'Deelnemers', unit: '' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card p-5 text-center"
                >
                  <div className="font-display text-3xl sm:text-4xl mb-1" style={{ color: 'var(--accent)' }}>
                    {stat.value}
                    {stat.unit && <span className="text-lg ml-1" style={{ color: 'var(--fg-3)' }}>{stat.unit}</span>}
                  </div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow mb-2">Het Spel</div>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--fg-0)' }}>Hoe werkt het?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorks.map((item, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="font-bold text-base mb-2" style={{ color: 'var(--fg-0)' }}>{item.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-3)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIX JERSEYS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-0)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow mb-2">Klassementen</div>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--fg-0)' }}>De Zes Truien</h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--fg-3)' }}>
              Strijd voor elk van de zes klassementen — elk met zijn eigen trui
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {jerseys.map((jersey) => (
              <Link key={jersey.type} href="/klassementen" className="card p-5 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
                <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                  <JerseyIcon type={jersey.type} size={52} />
                </div>
                <div className="font-bold text-sm leading-tight mb-1" style={{ color: 'var(--fg-0)' }}>{jersey.label}</div>
                <div className="text-xs" style={{ color: jersey.type === 'white' ? 'var(--fg-3)' : jersey.color }}>{jersey.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING STAGES */}
      {upcomingStages.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="eyebrow mb-2">Aankomend</div>
                <h2 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--fg-0)' }}>Volgende Etappes</h2>
              </div>
              <Link href="/etappes" className="hidden sm:block text-sm font-bold hover:underline" style={{ color: 'var(--accent)' }}>
                Alle etappes →
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingStages.map((stage) => {
                const typeColor = stageTypeColor[stage.type] ?? 'var(--fg-3)';
                return (
                  <Link key={stage.id} href={`/etappes/${stage.stageNumber}`}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:border-opacity-30"
                      style={{ background: 'var(--bg-2)', borderColor: 'var(--line)' }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-lg flex-shrink-0"
                        style={{ background: `${typeColor}18`, border: `1px solid ${typeColor}35`, color: typeColor }}
                      >
                        {stage.stageNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate" style={{ color: 'var(--fg-0)' }}>
                          {stage.startLocation} → {stage.finishLocation}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>
                          {formatShortDate(stage.date)} · {Number(stage.distanceKm).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km
                          {stage.elevationMeters > 0 ? ` · ${stage.elevationMeters.toLocaleString('nl-NL')} hm` : ''}
                        </div>
                      </div>
                      <div
                        className="text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0"
                        style={{ background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}
                      >
                        {stageTypeLabel[stage.type]}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: 'var(--bg-0)', borderTop: '1px solid var(--line)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-6xl mb-4" style={{ color: 'var(--fg-0)' }}>
            Klaar om mee te doen?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--fg-3)' }}>
            Schrijf je in vóór de start van de Tour en maak kans op de pot! Inschrijven kost maar €10.
          </p>
          <Link
            href="/meedoen"
            className="inline-block px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-deep)',
              boxShadow: '0 4px 32px rgba(217,255,63,0.25)',
            }}
          >
            🚴 Schrijf je in!
          </Link>
        </div>
      </section>
    </div>
  );
}
