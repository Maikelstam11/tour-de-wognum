import Link from 'next/link';
import { stageTypeLabel, stageTypeColor } from '@/lib/scoring';
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

const typeGradients: Record<string, string> = {
  flat: 'linear-gradient(135deg, #0a2a0a 0%, #003d1a 100%)',
  hilly: 'linear-gradient(135deg, #2a1800 0%, #4a2e00 100%)',
  mountain: 'linear-gradient(135deg, #2a0005 0%, #4a0008 100%)',
  time_trial: 'linear-gradient(135deg, #00102a 0%, #001d4a 100%)',
  team_time_trial: 'linear-gradient(135deg, #00102a 0%, #001540 100%)',
};

const typeIcons: Record<string, string> = {
  flat: '🟢',
  hilly: '🟠',
  mountain: '🔴',
  time_trial: '🔵',
  team_time_trial: '🔷',
};

export default function StageCard({ stage, compact = false, selected = false, onSelect }: StageCardProps) {
  const typeColor = stageTypeColor[stage.type] ?? '#888';
  const typeLabel = stageTypeLabel[stage.type] ?? stage.type;
  const typeIcon = typeIcons[stage.type] ?? '⚪';

  if (compact) {
    const content = (
      <div
        onClick={onSelect}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${onSelect ? 'cursor-pointer' : ''}`}
        style={{
          background: selected ? 'rgba(255,215,0,0.1)' : 'var(--tour-bg-card)',
          borderColor: selected ? 'rgba(255,215,0,0.5)' : 'var(--tour-border)',
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
          style={{ background: typeGradients[stage.type], border: `1px solid ${typeColor}30` }}
        >
          {stage.stageNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-condensed font-bold truncate">
            {stage.startLocation} → {stage.finishLocation}
          </div>
          <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
            {formatShortDate(stage.date)} · {stage.distanceKm} km
          </div>
        </div>
        <div className="text-xs font-condensed font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ color: typeColor, background: `${typeColor}20` }}>
          {typeIcon} {typeLabel}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xs font-bold">★</span>
          </div>
        )}
      </div>
    );
    return onSelect ? content : <Link href={`/etappes/${stage.stageNumber}`}>{content}</Link>;
  }

  const card = (
    <div
      className={`relative rounded-xl overflow-hidden border transition-all duration-200 group ${!onSelect ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
      style={{
        background: typeGradients[stage.type],
        borderColor: selected ? '#FFD700' : `${typeColor}40`,
        boxShadow: selected ? '0 0 20px rgba(255,215,0,0.3)' : undefined,
      }}
      onClick={onSelect}
    >
      {/* Status badge */}
      {stage.status === 'completed' && (
        <div className="absolute top-3 right-3 text-xs font-condensed font-bold px-2 py-0.5 rounded-full bg-green-700 text-green-200">
          ✓ Gereden
        </div>
      )}
      {stage.status === 'active' && (
        <div className="absolute top-3 right-3 text-xs font-condensed font-bold px-2 py-0.5 rounded-full animate-pulse" style={{ background: 'var(--tour-yellow)', color: '#000' }}>
          🔴 Live
        </div>
      )}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
          <span className="text-black text-xs font-bold">★</span>
        </div>
      )}

      <div className="p-5">
        {/* Stage number & type */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-display text-5xl leading-none" style={{ color: typeColor, opacity: 0.4 }}>
              {stage.stageNumber}
            </div>
            <div className="font-condensed text-xs font-bold uppercase tracking-widest -mt-1" style={{ color: typeColor }}>
              Etappe
            </div>
          </div>
          <div className="text-xs font-condensed font-bold px-2 py-1 rounded" style={{ background: `${typeColor}25`, color: typeColor, border: `1px solid ${typeColor}40` }}>
            {typeIcon} {typeLabel}
          </div>
        </div>

        {/* Route */}
        <div className="mb-3">
          <div className="font-condensed font-bold text-base leading-tight text-white">
            {stage.startLocation}
          </div>
          <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>↓</div>
          <div className="font-condensed font-bold text-base leading-tight text-white">
            {stage.finishLocation}
          </div>
        </div>

        {/* Date */}
        <div className="text-xs mb-4" style={{ color: 'var(--tour-text-muted)' }}>
          {formatShortDate(stage.date)}
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-3" style={{ borderTop: `1px solid ${typeColor}25` }}>
          <div>
            <div className="font-display text-lg leading-none text-white">{stage.distanceKm}</div>
            <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>km</div>
          </div>
          {stage.elevationMeters > 0 && (
            <div>
              <div className="font-display text-lg leading-none text-white">{stage.elevationMeters.toLocaleString('nl-NL')}</div>
              <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>hm</div>
            </div>
          )}
          <div className="ml-auto flex gap-1">
            {stage.isSprintStage && (
              <span className="text-xs bg-green-900 text-green-300 px-1.5 py-0.5 rounded">⚡ Sprint</span>
            )}
            {stage.isMountainStage && (
              <span className="text-xs bg-red-900 text-red-300 px-1.5 py-0.5 rounded">⛰️ Berg</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (onSelect) return card;
  return <Link href={`/etappes/${stage.stageNumber}`}>{card}</Link>;
}
