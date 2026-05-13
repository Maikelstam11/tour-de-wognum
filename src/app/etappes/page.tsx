import { db } from '@/db';
import { stages } from '@/db/schema';
import StageCard from '@/components/StageCard';

export const revalidate = 60;

async function getStages() {
  try {
    return await db.select().from(stages).orderBy(stages.stageNumber);
  } catch {
    return [];
  }
}

const typeFilters = [
  { key: 'flat', label: 'Vlak', color: 'var(--t-vlak)' },
  { key: 'hilly', label: 'Heuvelachtig', color: 'var(--t-heuv)' },
  { key: 'mountain', label: 'Berg', color: 'var(--t-berg)' },
  { key: 'time_trial', label: 'Tijdrit', color: 'var(--t-itt)' },
  { key: 'team_time_trial', label: 'Ploegentijdrit', color: 'var(--t-ttt)' },
  { key: 'rest_day', label: 'Rustdag', color: 'var(--t-rust)' },
];

export default async function EtappesPage() {
  const allStages = await getStages();
  const completedCount = allStages.filter(s => s.status === 'completed').length;
  const totalKm = allStages.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalElev = allStages.reduce((sum, s) => sum + s.elevationMeters, 0);

  return (
    <div className="pt-16" style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ background: 'var(--bg-0)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="eyebrow mb-3">Tour de France 2026</div>
          <h1 className="font-display text-5xl sm:text-7xl mb-4" style={{ color: 'var(--fg-0)' }}>
            Alle Etappes
          </h1>
          <p className="text-base sm:text-lg max-w-xl" style={{ color: 'var(--fg-3)' }}>
            21 etappes door de mooiste bergen en steden van Europa — van Barcelona tot Parijs.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { value: allStages.length, label: 'Etappes', unit: '' },
              { value: Math.round(totalKm).toLocaleString('nl-NL'), label: 'Kilometer', unit: 'km' },
              { value: Math.round(totalElev).toLocaleString('nl-NL'), label: 'Hoogtemeters', unit: 'hm' },
              { value: completedCount, label: 'Gereden', unit: '' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl sm:text-4xl leading-none" style={{ color: 'var(--accent)' }}>
                  {stat.value}
                  {stat.unit && <span className="text-lg ml-1" style={{ color: 'var(--fg-3)' }}>{stat.unit}</span>}
                </div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--fg-3)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="px-4 sm:px-6 lg:px-8 py-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {typeFilters.map((t) => (
              <div
                key={t.key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'var(--bg-2)', color: t.color, border: '1px solid var(--line)' }}
              >
                <div className="w-2 h-2 rounded-sm" style={{ background: t.color }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stages grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {allStages.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--fg-3)' }}>
              <div className="text-5xl mb-4">🚴</div>
              <p>Etappes worden binnenkort geladen…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allStages.map((stage) => (
                <StageCard key={stage.id} stage={stage} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
