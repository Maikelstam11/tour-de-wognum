import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import { stages, stageResults, riders, teams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stageTypeLabel, stageTypeColor, nationalityFlag } from '@/lib/scoring';
import { formatDate } from '@/lib/utils';
import { TeamJersey } from '@/components/JerseyIcon';

export const revalidate = 60;

interface Props {
  params: Promise<{ nummer: string }>;
}

async function getStageData(nummer: number) {
  const [stage] = await db
    .select()
    .from(stages)
    .where(eq(stages.stageNumber, nummer));

  if (!stage) return null;

  const results = await db
    .select({
      position: stageResults.position,
      timeGap: stageResults.timeGap,
      riderName: riders.name,
      riderNationality: riders.nationality,
      riderSpeciality: riders.speciality,
      teamName: teams.name,
      teamPrimary: teams.primaryColor,
      teamSecondary: teams.secondaryColor,
    })
    .from(stageResults)
    .innerJoin(riders, eq(stageResults.riderId, riders.id))
    .innerJoin(teams, eq(riders.teamId, teams.id))
    .where(eq(stageResults.stageId, stage.id))
    .orderBy(stageResults.position);

  return { stage, results };
}

const typeGradients: Record<string, string> = {
  flat: 'linear-gradient(135deg, #0a2a0a 0%, #001a08 100%)',
  hilly: 'linear-gradient(135deg, #2a1800 0%, #1a0d00 100%)',
  mountain: 'linear-gradient(135deg, #2a0005 0%, #1a0003 100%)',
  time_trial: 'linear-gradient(135deg, #00102a 0%, #000c1a 100%)',
  team_time_trial: 'linear-gradient(135deg, #00102a 0%, #000c1a 100%)',
};

const typeIcons: Record<string, string> = {
  flat: '🟢', hilly: '🟠', mountain: '🔴', time_trial: '🔵', team_time_trial: '🔷',
};

export default async function EtappeDetailPage({ params }: Props) {
  const { nummer } = await params;
  const num = parseInt(nummer, 10);
  if (isNaN(num)) notFound();

  const data = await getStageData(num);
  if (!data) notFound();

  const { stage, results } = data;
  const typeColor = stageTypeColor[stage.type] ?? '#888';
  const climbs = (stage.climbs as any[]) ?? [];

  return (
    <div className="pt-20">
      {/* Header */}
      <section
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ background: typeGradients[stage.type] }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(ellipse at 50% 100%, ${typeColor}, transparent 70%)` }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
            <Link href="/etappes" className="hover:text-white transition-colors">Etappes</Link>
            <span>/</span>
            <span>Etappe {stage.stageNumber}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Stage number big */}
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <div className="font-display text-8xl leading-none" style={{ color: typeColor, opacity: 0.3 }}>
                    {stage.stageNumber}
                  </div>
                </div>
                <div>
                  <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-1" style={{ color: typeColor }}>
                    {typeIcons[stage.type]} {stageTypeLabel[stage.type]} · {formatDate(stage.date)}
                  </div>
                  <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight">
                    {stage.startLocation}
                    <span className="mx-3" style={{ color: typeColor }}>→</span>
                    {stage.finishLocation}
                  </h1>

                  {/* Status */}
                  {stage.status === 'active' && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-condensed font-bold text-black" style={{ background: 'var(--tour-yellow)' }}>
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      LIVE
                    </div>
                  )}
                  {stage.status === 'completed' && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-condensed font-bold text-green-300 bg-green-900">
                      ✓ Gereden
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {stage.description && (
                <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--tour-text-muted)' }}>
                  {stage.description}
                </p>
              )}
            </div>

            {/* Stats sidebar */}
            <div className="card-dark p-6">
              <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-4" style={{ color: typeColor }}>
                Etappe Info
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Afstand', value: `${stage.distanceKm} km` },
                  { label: 'Hoogtemeters', value: `${stage.elevationMeters.toLocaleString('nl-NL')} hm` },
                  { label: 'Type', value: stageTypeLabel[stage.type] },
                  { label: 'Sprint-etappe', value: stage.isSprintStage ? '✓ Ja' : '✗ Nee' },
                  { label: 'Bergetappe', value: stage.isMountainStage ? '✓ Ja' : '✗ Nee' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--tour-border)', paddingBottom: '12px' }}>
                    <span className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>{row.label}</span>
                    <span className="font-condensed font-bold text-white">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--tour-border)' }}>
                <div className="text-sm font-condensed font-bold mb-2" style={{ color: typeColor }}>
                  Verwacht scenario
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--tour-text-muted)' }}>
                  {stage.isSprintStage && 'Een massasprint wordt verwacht. De sprinters zijn aan zet.'}
                  {stage.isMountainStage && !stage.isSprintStage && 'De klimmers bepalen de koers. Aanvallen verwacht op de slotklim.'}
                  {stage.type === 'time_trial' && 'Elke seconde telt. De tijdrijders gaan voor de zege.'}
                  {stage.type === 'team_time_trial' && 'Teams gaan als eenheid van start. Teamwork is cruciaal.'}
                  {!stage.isSprintStage && !stage.isMountainStage && stage.type === 'hilly' && 'Punchers en vluchters maken kans. Onrustige koers verwacht.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Climbs */}
            {climbs.length > 0 && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Beklimmingen</h2>
                <div className="space-y-3">
                  {climbs.map((climb: any, i: number) => (
                    <div key={i} className="card-dark p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-condensed font-bold text-base text-white">{climb.name}</div>
                          <div className="text-sm mt-1" style={{ color: 'var(--tour-text-muted)' }}>
                            {climb.lengthKm} km · {climb.avgGradient}% gemiddeld · {climb.altitude} m
                          </div>
                        </div>
                        <div
                          className="text-xs font-condensed font-bold px-2 py-1 rounded flex-shrink-0"
                          style={{
                            background: climb.category === 'HC' ? 'rgba(226,0,26,0.2)' : climb.category === '1' ? 'rgba(226,80,0,0.2)' : 'rgba(0,85,164,0.2)',
                            color: climb.category === 'HC' ? '#ff4444' : climb.category === '1' ? '#ff8800' : '#4488ff',
                            border: '1px solid currentColor',
                          }}
                        >
                          Cat. {climb.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Uitslag</h2>
                <div className="card-dark overflow-hidden">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 standings-row"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-lg font-bold flex-shrink-0"
                        style={{
                          background: i === 0 ? 'rgba(255,215,0,0.2)' : i === 1 ? 'rgba(192,192,192,0.2)' : i === 2 ? 'rgba(205,127,50,0.2)' : 'rgba(255,255,255,0.05)',
                          color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--tour-text-muted)',
                        }}
                      >
                        {r.position}
                      </div>
                      <TeamJersey primaryColor={r.teamPrimary} secondaryColor={r.teamSecondary} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="font-condensed font-bold text-sm text-white truncate">
                          {nationalityFlag[r.riderNationality] ?? '🏳️'} {r.riderName}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--tour-text-muted)' }}>{r.teamName}</div>
                      </div>
                      {r.timeGap && (
                        <div className="text-sm font-mono" style={{ color: 'var(--tour-text-muted)' }}>
                          {r.position === 1 ? 'Winnaar' : `+${r.timeGap}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.length === 0 && stage.status === 'planned' && (
              <div className="card-dark p-12 text-center">
                <div className="text-4xl mb-3">🚴</div>
                <div className="font-condensed font-bold text-lg text-white mb-2">Nog niet gereden</div>
                <p className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>
                  De uitslag van deze etappe verschijnt hier zodra hij gereden is.
                </p>
              </div>
            )}
          </div>

          {/* Navigation sidebar */}
          <div className="space-y-4">
            <h3 className="font-condensed font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--tour-yellow)' }}>
              Navigatie
            </h3>
            <div className="flex gap-3">
              {num > 1 && (
                <Link
                  href={`/etappes/${num - 1}`}
                  className="flex-1 card-dark p-3 text-center text-sm font-condensed font-bold hover:border-yellow-400 transition-all"
                >
                  ← Etappe {num - 1}
                </Link>
              )}
              {num < 21 && (
                <Link
                  href={`/etappes/${num + 1}`}
                  className="flex-1 card-dark p-3 text-center text-sm font-condensed font-bold hover:border-yellow-400 transition-all"
                >
                  Etappe {num + 1} →
                </Link>
              )}
            </div>
            <Link href="/etappes" className="block card-dark p-3 text-center text-sm font-condensed font-bold hover:border-yellow-400 transition-all">
              ↑ Alle etappes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
