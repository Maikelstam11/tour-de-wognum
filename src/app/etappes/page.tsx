import { db } from '@/db';
import { stages } from '@/db/schema';
import StageCard from '@/components/StageCard';
import { stageTypeLabel } from '@/lib/scoring';

export const revalidate = 60;

const typeFilters = ['all', 'flat', 'hilly', 'mountain', 'time_trial', 'team_time_trial'];

async function getStages() {
  try {
    return await db.select().from(stages).orderBy(stages.stageNumber);
  } catch {
    return [];
  }
}

export default async function EtappesPage() {
  const allStages = await getStages();
  const completedCount = allStages.filter(s => s.status === 'completed').length;
  const totalKm = allStages.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalElev = allStages.reduce((sum, s) => sum + s.elevationMeters, 0);

  return (
    <div className="pt-20">
      {/* Header */}
      <section
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(26,25,51,0.8) 0%, transparent 100%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow)' }}>
            Tour de France 2026
          </div>
          <h1 className="font-display text-5xl sm:text-7xl text-white mb-4">Alle Etappes</h1>
          <p className="text-base sm:text-lg max-w-xl" style={{ color: 'var(--tour-text-muted)' }}>
            21 etappes door de mooiste bergen en steden van Europa — van Barcelona tot Parijs.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { value: allStages.length, label: 'Etappes', unit: '' },
              { value: totalKm.toLocaleString('nl-NL'), label: 'Kilometer', unit: 'km' },
              { value: totalElev.toLocaleString('nl-NL'), label: 'Hoogtemeters', unit: 'hm' },
              { value: completedCount, label: 'Gereden', unit: '' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl text-white">
                  {stat.value}<span className="text-lg ml-1" style={{ color: 'var(--tour-text-muted)' }}>{stat.unit}</span>
                </div>
                <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--tour-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {[
              { type: 'flat', color: '#00A651', label: 'Vlak' },
              { type: 'hilly', color: '#FF8C00', label: 'Heuvelachtig' },
              { type: 'mountain', color: '#E2001A', label: 'Berg' },
              { type: 'time_trial', color: '#0055A4', label: 'Tijdrit' },
              { type: 'team_time_trial', color: '#003d8f', label: 'Ploegentijdrit' },
            ].map((t) => (
              <div key={t.type} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-sm" style={{ background: t.color }} />
                <span style={{ color: 'var(--tour-text-muted)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stages grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {allStages.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--tour-text-muted)' }}>
              <div className="text-5xl mb-4">🚴</div>
              <p>Etappes worden binnenkort geladen...</p>
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
