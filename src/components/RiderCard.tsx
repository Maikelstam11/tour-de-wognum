'use client';
import { TeamJersey } from './JerseyIcon';
import { specialityLabel, specialityIcon, nationalityFlag } from '@/lib/scoring';

interface RiderCardProps {
  rider: {
    id: string;
    name: string;
    nationality: string;
    speciality: string;
    bio?: string | null;
  };
  team: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
  };
  selected?: boolean;
  isCaptain?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export default function RiderCard({
  rider,
  team,
  selected = false,
  isCaptain = false,
  onSelect,
  compact = false,
}: RiderCardProps) {
  const flag = nationalityFlag[rider.nationality] ?? '🏳️';
  const specLabel = specialityLabel[rider.speciality] ?? rider.speciality;
  const specIcon = specialityIcon[rider.speciality] ?? '🚴';

  if (compact) {
    return (
      <div
        onClick={onSelect}
        className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${onSelect ? 'cursor-pointer' : ''}`}
        style={{
          background: selected ? 'rgba(255,215,0,0.1)' : 'var(--tour-bg-card)',
          borderColor: isCaptain
            ? '#FFD700'
            : selected
            ? 'rgba(255,215,0,0.5)'
            : 'var(--tour-border)',
          boxShadow: isCaptain ? '0 0 16px rgba(255,215,0,0.3)' : undefined,
        }}
      >
        {isCaptain && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
            ★ Kopman
          </div>
        )}
        <TeamJersey
          primaryColor={team.primaryColor}
          secondaryColor={team.secondaryColor}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <div className="font-condensed font-bold text-sm leading-tight truncate" style={{ color: 'var(--tour-text)' }}>
            {flag} {rider.name}
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--tour-text-muted)' }}>
            {team.name}
          </div>
        </div>
        <span className={`badge badge-${rider.speciality} flex-shrink-0`}>
          {specIcon}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 ${onSelect ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      style={{
        background: selected ? 'rgba(255,215,0,0.08)' : 'var(--tour-bg-card)',
        borderColor: isCaptain
          ? '#FFD700'
          : selected
          ? 'rgba(255,215,0,0.4)'
          : 'var(--tour-border)',
        boxShadow: isCaptain
          ? '0 0 24px rgba(255,215,0,0.35)'
          : selected
          ? '0 4px 16px rgba(255,215,0,0.1)'
          : undefined,
      }}
    >
      {isCaptain && (
        <div
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-black text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap z-10"
          style={{ background: 'var(--tour-yellow)' }}
        >
          ★ Kopman
        </div>
      )}

      {selected && !isCaptain && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}

      <TeamJersey
        primaryColor={team.primaryColor}
        secondaryColor={team.secondaryColor}
        size={56}
        className="mb-2"
      />

      <div className="text-center w-full">
        <div className="font-condensed font-bold text-sm leading-tight" style={{ color: 'var(--tour-text)' }}>
          {rider.name}
        </div>
        <div className="text-xs mt-0.5 mb-2" style={{ color: 'var(--tour-text-muted)' }}>
          {flag} {rider.nationality}
        </div>
        <div className="text-xs truncate mb-2" style={{ color: 'var(--tour-text-muted)' }}>
          {team.name}
        </div>
        <span className={`badge badge-${rider.speciality}`}>
          {specIcon} {specLabel}
        </span>
      </div>
    </div>
  );
}
