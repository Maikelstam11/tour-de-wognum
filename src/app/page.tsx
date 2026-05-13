import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import JerseyIcon from '@/components/JerseyIcon';
import { db } from '@/db';
import { stages, participants, stageResults } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
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

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(255,215,0,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,85,164,0.08) 0%, transparent 50%), linear-gradient(180deg, #0F0E17 0%, #1A1933 50%, #0D1B35 100%)',
          }}
        />

        {/* Mountain silhouette */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 sm:h-64"
          style={{
            background: 'linear-gradient(to top, rgba(255,215,0,0.08), transparent)',
            clipPath: 'polygon(0 100%, 8% 45%, 18% 70%, 28% 20%, 38% 55%, 48% 5%, 58% 50%, 68% 15%, 78% 45%, 88% 25%, 100% 40%, 100% 100%)',
          }}
        />

        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'var(--tour-yellow)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'var(--tour-blue)', filter: 'blur(80px)' }} />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-condensed font-bold mb-6"
            style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', color: 'var(--tour-yellow)' }}
          >
            🚴 Tour de France 2026 · 4 juli – 26 juli
          </div>

          <h1 className="font-display text-6xl sm:text-8xl lg:text-[120px] leading-none mb-4">
            <span className="text-gradient-yellow">Tour de</span>
            <br />
            <span className="text-white">Wognum</span>
          </h1>

          <p className="text-lg sm:text-xl mb-4 font-condensed" style={{ color: 'var(--tour-text-muted)' }}>
            Het officiële wielerspel van Wognum voor de Tour de France 2026
          </p>

          {participantCount > 0 && (
            <p className="text-sm mb-8" style={{ color: 'var(--tour-text-muted)' }}>
              <span className="font-bold text-white">{participantCount}</span> wielerfanaten doen al mee
            </p>
          )}

          <div className="mb-10">
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--tour-text-muted)' }}>
              Start over
            </div>
            <CountdownTimer />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/meedoen"
              className="px-8 py-4 rounded-xl font-condensed font-bold text-lg text-black transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--tour-yellow)', boxShadow: '0 0 40px rgba(255,215,0,0.3)' }}
            >
              🏆 Doe mee aan de poule!
            </Link>
            <Link
              href="/etappes"
              className="px-8 py-4 rounded-xl font-condensed font-bold text-lg text-white transition-all duration-200 hover:bg-white hover:text-black"
              style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
            >
              📍 Bekijk de etappes
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--tour-text-muted)' }}>Scroll</div>
          <div className="w-px h-8" style={{ background: 'var(--tour-text-muted)' }} />
        </div>
      </section>

      {/* LIVE BANNER */}
      {activeStage && (
        <section className="py-4" style={{ background: 'rgba(232,184,0,0.08)', borderTop: '1px solid rgba(232,184,0,0.25)', borderBottom: '1px solid rgba(232,184,0,0.25)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-condensed font-bold" style={{ color: 'var(--tour-yellow-dark)' }}>LIVE — Etappe {activeStage.stageNumber}</span>
              <span className="font-condensed" style={{ color: 'var(--tour-text)' }}>{activeStage.startLocation} → {activeStage.finishLocation}</span>
            </div>
            <Link href={`/etappes/${activeStage.stageNumber}`} className="text-xs hover:underline" style={{ color: 'var(--tour-yellow-dark)' }}>
              Volg live →
            </Link>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow-dark)' }}>
              Het Spel
            </div>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--tour-text)' }}>Hoe werkt het?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div key={i} className="card-dark p-6 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="font-condensed font-bold text-lg mb-2" style={{ color: 'var(--tour-text)' }}>{item.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--tour-text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIX JERSEYS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-alt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow-dark)' }}>
              Klassementen
            </div>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--tour-text)' }}>De Zes Truien</h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--tour-text-muted)' }}>
              Strijd voor elk van de zes klassementen — elk met zijn eigen trui
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {jerseys.map((jersey) => (
              <Link key={jersey.type} href="/klassementen" className="card-dark p-4 flex flex-col items-center text-center group">
                <div className="transition-transform duration-300 group-hover:scale-110 mb-3">
                  <JerseyIcon type={jersey.type} size={56} />
                </div>
                <div className="font-condensed font-bold text-sm leading-tight" style={{ color: 'var(--tour-text)' }}>{jersey.label}</div>
                <div className="text-xs mt-1" style={{ color: jersey.type === 'white' ? '#9C9890' : jersey.color }}>{jersey.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING STAGES */}
      {upcomingStages.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow-dark)' }}>
                  Aankomend
                </div>
                <h2 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--tour-text)' }}>Volgende Etappes</h2>
              </div>
              <Link href="/etappes" className="hidden sm:block text-sm hover:underline" style={{ color: 'var(--tour-yellow-dark)' }}>
                Alle etappes →
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingStages.map((stage) => {
                const typeColor = stageTypeColor[stage.type] ?? '#888';
                return (
                  <Link key={stage.id} href={`/etappes/${stage.stageNumber}`}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: 'var(--tour-bg-card)', borderColor: 'var(--tour-border)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl flex-shrink-0"
                        style={{ background: `${typeColor}20`, border: `1px solid ${typeColor}40`, color: typeColor }}
                      >
                        {stage.stageNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-condensed font-bold text-base truncate" style={{ color: 'var(--tour-text)' }}>
                          {stage.startLocation} → {stage.finishLocation}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>
                          {formatShortDate(stage.date)} · {Number(stage.distanceKm).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km{stage.elevationMeters > 0 ? ` · ${stage.elevationMeters.toLocaleString('nl-NL')} hm` : ''}
                        </div>
                      </div>
                      <div className="text-xs font-condensed font-bold px-3 py-1 rounded flex-shrink-0" style={{ background: `${typeColor}20`, color: typeColor, border: `1px solid ${typeColor}30` }}>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-alt">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-6xl mb-4" style={{ color: 'var(--tour-text)' }}>Klaar om mee te doen?</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--tour-text-muted)' }}>
            Schrijf je in vóór de start van de Tour en maak kans op de pot! Inschrijven kost maar €10.
          </p>
          <Link
            href="/meedoen"
            className="inline-block px-10 py-5 rounded-xl font-condensed font-bold text-xl text-black transition-all duration-200 hover:scale-105"
            style={{ background: 'var(--tour-yellow)', boxShadow: '0 4px 24px rgba(232,184,0,0.3)' }}
          >
            🚴 Schrijf je in!
          </Link>
        </div>
      </section>
    </div>
  );
}
