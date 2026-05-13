import Link from 'next/link';
import { stageTypeLabel } from '@/lib/scoring';
import { formatShortDate } from '@/lib/utils';

interface StageCardProps {
  stage: {
    id: string;
    stageNumber: number;
    date: string;
    startLocation: string;
    finishLocation: string;
    type: string;
    distanceKm: number;
    elevationMeters: number;
    isSprintStage: boolean;
    isMountainStage: boolean;
    status: string;
  };
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const typeColor: Record<string, string> = {
  flat: 'var(--t-vlak)',
  hilly: 'var(--t-heuv)',
  mountain: 'var(--t-berg)',
  time_trial: 'var(--t-itt)',
  team_time_trial: 'var(--t-ttt)',
  rest_day: 'var(--t-rust)',
};

const typeIcon: Record<string, string> = {
  flat: '🟢',
  hilly: '🟠',
  mountain: '🔴',
  time_trial: '🔵',
  team_time_trial: '🔷',
  rest_day: '⚪',
};

export default function StageCard({ stage, compact = false, selected = false, onSelect }: StageCardProps) {
  const color = typeColor[stage.type] ?? 'var(--fg-3)';
  const icon = typeIcon[stage.type] ?? '⚪';
  const label = stageTypeLabel[stage.type] ?? stage.type;
  const distStr = Number(stage.distanceKm).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  if (compact) {
    const content = (
      <div
        onClick={onSelect}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${onSelect ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
        style={{
          background: selected ? 'rgba(217,255,63,0.08)' : 'var(--bg-2)',
          borderColor: selected ? 'rgba(217,255,63,0.4)' : 'var(--line)',
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {stage.stageNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: 'var(--fg-0)' }}>
            {stage.startLocation} → {stage.finishLocation}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>
            {formatShortDate(stage.date)} · {distStr} km
          </div>
        </div>
        <div
          className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
          style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          {icon} {label}
        </div>
        {selected && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-deep)' }}
          >
            ★
          </div>
        )}
      </div>
    );
    return onSelect ? content : <Link href={`/etappes/${stage.stageNumber}`}>{content}</Link>;
  }

  const card = (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-200 group ${!onSelect ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
      style={{
        background: 'var(--bg-2)',
        borderColor: selected ? 'rgba(217,255,63,0.5)' : 'var(--line)',
        boxShadow: selected ? 'var(--shadow-accent)' : 'var(--shadow-card)',
      }}
      onClick={onSelect}
    >
      {/* Color accent line at top */}
      <div className="h-0.5 w-full" style={{ background: color }} />

      {/* Status badge */}
      {stage.status === 'completed' && (
        <div
          className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--t-vlak)', border: '1px solid rgba(52,211,153,0.3)' }}
        >
          ✓ Gereden
        </div>
      )}
      {stage.status === 'active' && (
        <div className="absolute top-3 right-3">
          <span className="live-badge">LIVE</span>
        </div>
      )}
      {selected && stage.status !== 'active' && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent)', color: 'var(--accent-deep)' }}
        >
          ★
        </div>
      )}

      <div className="p-5">
        {/* Stage number & type */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-display text-5xl leading-none" style={{ color, opacity: 0.7 }}>
              {stage.stageNumber}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--fg-3)' }}>
              Etappe
            </div>
          </div>
          <div
            className="text-xs font-bold px-2.5 py-1 rounded-xl mt-1"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}
          >
            {icon} {label}
          </div>
        </div>

        {/* Route */}
        <div className="mb-3">
          <div className="font-bold text-sm leading-tight" style={{ color: 'var(--fg-0)' }}>
            {stage.startLocation}
          </div>
          <div className="text-xs my-0.5" style={{ color: 'var(--fg-3)' }}>↓</div>
          <div className="font-bold text-sm leading-tight" style={{ color: 'var(--fg-0)' }}>
            {stage.finishLocation}
          </div>
        </div>

        {/* Date */}
        <div className="text-xs mb-4" style={{ color: 'var(--fg-3)' }}>
          {formatShortDate(stage.date)}
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
          <div>
            <div className="font-display text-lg leading-none" style={{ color: 'var(--fg-0)' }}>{distStr}</div>
            <div className="text-xs" style={{ color: 'var(--fg-3)' }}>km</div>
          </div>
          {stage.elevationMeters > 0 && (
            <div>
              <div className="font-display text-lg leading-none" style={{ color: 'var(--fg-0)' }}>
                {stage.elevationMeters.toLocaleString('nl-NL')}
              </div>
              <div className="text-xs" style={{ color: 'var(--fg-3)' }}>hm</div>
            </div>
          )}
          <div className="ml-auto flex gap-1 items-center">
            {stage.isSprintStage && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-lg"
                style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--t-vlak)' }}
              >
                ⚡ Sprint
              </span>
            )}
            {stage.isMountainStage && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-lg"
                style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--t-berg)' }}
              >
                ⛰️ Berg
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (onSelect) return card;
  return <Link href={`/etappes/${stage.stageNumber}`}>{card}</Link>;
}
