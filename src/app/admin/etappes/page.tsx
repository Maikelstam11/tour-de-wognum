import Link from 'next/link';
import { db } from '@/db';
import { stages } from '@/db/schema';
import { stageTypeLabel } from '@/lib/scoring';
import { formatShortDate } from '@/lib/utils';

export const revalidate = 0;

type Stage = typeof stages.$inferSelect;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  planned: { bg: 'rgba(0,0,0,0.05)', color: '#6B6860' },
  active: { bg: 'rgba(232,184,0,0.15)', color: '#C9A000' },
  completed: { bg: 'rgba(0,135,63,0.1)', color: '#00873F' },
};
const STATUS_LABEL: Record<string, string> = { planned: 'Gepland', active: 'Live', completed: 'Gereden' };
const TYPE_ICON: Record<string, string> = {
  flat: '🟢', hilly: '🟠', mountain: '🔴', time_trial: '🔵', team_time_trial: '🔷', rest_day: '⚪',
};

export default async function AdminEtappesPage() {
  let allStages: Stage[] = [];
  try {
    allStages = await db.select().from(stages).orderBy(stages.stageNumber);
  } catch { /* db not available */ }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="text-sm font-condensed font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--tour-text-muted)' }}
          >
            ← Admin
          </Link>
          <h1 className="font-display text-4xl" style={{ color: 'var(--tour-text)' }}>
            Etappes Bewerken
          </h1>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs" style={{ color: 'var(--tour-text-muted)' }}>
          {Object.entries(TYPE_ICON).map(([type, icon]) => (
            <span key={type}>{icon} {stageTypeLabel[type] ?? type}</span>
          ))}
        </div>

        {/* Stage list */}
        <div className="space-y-2">
          {allStages.map((stage) => {
            const statusStyle = STATUS_STYLE[stage.status] ?? STATUS_STYLE.planned;
            const hasProfile = !!(stage as any).profileImageUrl;
            const hasDescription = !!(stage.description);
            return (
              <div key={stage.id} className="card-dark px-4 py-3 flex items-center gap-4">
                {/* Number */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-display text-base flex-shrink-0"
                  style={{ background: 'rgba(232,184,0,0.1)', color: 'var(--tour-yellow-dark)' }}
                >
                  {stage.stageNumber}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-condensed font-bold text-sm truncate" style={{ color: 'var(--tour-text)' }}>
                    {TYPE_ICON[stage.type] ?? '⚪'} {stage.startLocation} → {stage.finishLocation}
                  </div>
                  <div className="text-xs flex flex-wrap gap-2 mt-0.5" style={{ color: 'var(--tour-text-muted)' }}>
                    <span>{formatShortDate(stage.date)}</span>
                    <span>·</span>
                    <span>{stageTypeLabel[stage.type] ?? stage.type}</span>
                    <span>·</span>
                    <span>{Number(stage.distanceKm).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</span>
                    {stage.elevationMeters > 0 && <><span>·</span><span>{stage.elevationMeters.toLocaleString('nl-NL')} hm</span></>}
                  </div>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  {hasDescription && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,85,164,0.08)', color: '#0055A4' }}>
                      📝 Beschrijving
                    </span>
                  )}
                  {hasProfile && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,135,63,0.08)', color: '#00873F' }}>
                      🖼️ Foto
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded font-condensed font-bold"
                    style={statusStyle}
                  >
                    {STATUS_LABEL[stage.status]}
                  </span>
                </div>

                {/* Edit button */}
                <Link
                  href={`/admin/etappes/${stage.stageNumber}`}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-condensed font-bold text-black transition-all hover:scale-105"
                  style={{ background: 'var(--tour-yellow)' }}
                >
                  Bewerken
                </Link>
              </div>
            );
          })}
        </div>

        {allStages.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--tour-text-muted)' }}>
            Geen etappes gevonden. Controleer de database verbinding.
          </div>
        )}
      </div>
    </div>
  );
}
