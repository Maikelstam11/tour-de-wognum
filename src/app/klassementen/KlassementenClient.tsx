'use client';
import { useState } from 'react';
import JerseyIcon from '@/components/JerseyIcon';

interface Participant {
  id: string;
  name: string;
  totalPts: number;
  sprintPts: number;
  mountainPts: number;
  isYoung: boolean;
  maxStagePoints: number;
  gcBonus: number;
}

interface Props {
  general: Participant[];
  sprint: Participant[];
  mountain: Participant[];
  young: Participant[];
  daily: Participant[];
  stagesData: any[];
  totalParticipants: number;
}

const tabs = [
  { key: 'general', label: 'Algemeen', jersey: 'yellow' as const, color: '#FFD700' },
  { key: 'sprint', label: 'Sprint', jersey: 'green' as const, color: '#00A651' },
  { key: 'mountain', label: 'Berg', jersey: 'polka' as const, color: '#E2001A' },
  { key: 'young', label: 'Jongeren', jersey: 'white' as const, color: '#E8E8E8' },
  { key: 'daily', label: 'Dag', jersey: 'blue' as const, color: '#0055A4' },
];

function StandingsTable({
  data,
  pointsKey,
  color,
  jerseyType,
}: {
  data: Participant[];
  pointsKey: keyof Participant;
  color: string;
  jerseyType: any;
}) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  if (data.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🚴</div>
        <p style={{ color: 'var(--tour-text-muted)' }}>
          Nog geen scores — de Tour is nog niet begonnen.
        </p>
      </div>
    );
  }

  const leader = data[0];
  const leaderPts = Number(leader[pointsKey] ?? 0);

  return (
    <div>
      {/* Leader card */}
      {leader && leaderPts > 0 && (
        <div
          className="mb-6 p-6 rounded-xl flex items-center gap-6"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
            border: `1px solid ${color}40`,
            boxShadow: `0 0 40px ${color}15`,
          }}
        >
          <JerseyIcon type={jerseyType} size={64} />
          <div>
            <div className="text-xs font-condensed font-bold uppercase tracking-widest mb-1" style={{ color }}>
              Drager van de trui
            </div>
            <div className="font-display text-3xl" style={{ color: 'var(--tour-text)' }}>{leader.name}</div>
            <div className="font-display text-xl mt-1" style={{ color }}>{leaderPts} punten</div>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        className="form-input mb-4"
        placeholder="🔍 Zoek jezelf..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="card-dark overflow-hidden">
        {filtered.map((p, i) => {
          const rank = data.indexOf(p) + 1;
          const pts = Number(p[pointsKey] ?? 0);
          const isLast = rank === data.length && data.length > 1;
          const diff = pts - leaderPts;

          return (
            <div
              key={p.id}
              className="flex items-center gap-4 px-4 py-3 standings-row"
              style={{ opacity: pts === 0 ? 0.5 : 1 }}
            >
              {/* Rank */}
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-display text-base flex-shrink-0"
                style={{
                  background: rank === 1 ? `${color}20` : 'rgba(0,0,0,0.04)',
                  color: rank === 1 ? color : 'var(--tour-text-muted)',
                }}
              >
                {isLast ? '🏮' : rank}
              </div>

              {/* Jersey if leader */}
              {rank === 1 && pts > 0 && (
                <JerseyIcon type={jerseyType} size={24} />
              )}

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className={`font-condensed font-bold text-sm truncate ${rank === 1 && pts > 0 ? 'text-white' : ''}`} style={{ color: rank === 1 && pts > 0 ? 'white' : 'var(--tour-text)' }}>
                  {p.name}
                  {p.isYoung && <span className="ml-2 text-xs" style={{ color: '#E8E8E8' }}>U25</span>}
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="font-display text-lg" style={{ color: rank === 1 ? color : 'var(--tour-text)' }}>
                  {pts}
                </div>
                {rank > 1 && pts > 0 && leaderPts > 0 && (
                  <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                    {diff} pt
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function KlassementenClient({ general, sprint, mountain, young, daily, stagesData, totalParticipants }: Props) {
  const [activeTab, setActiveTab] = useState('general');

  const dataMap: Record<string, { data: Participant[]; key: keyof Participant }> = {
    general: { data: general, key: 'totalPts' },
    sprint: { data: sprint, key: 'sprintPts' },
    mountain: { data: mountain, key: 'mountainPts' },
    young: { data: young, key: 'totalPts' },
    daily: { data: daily, key: 'maxStagePoints' },
  };

  const active = tabs.find(t => t.key === activeTab)!;
  const { data, key } = dataMap[activeTab];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow-dark)' }}>
            Tour de Wognum 2026
          </div>
          <h1 className="font-display text-5xl sm:text-7xl mb-4" style={{ color: 'var(--tour-text)' }}>Klassementen</h1>
          <p className="text-base" style={{ color: 'var(--tour-text-muted)' }}>
            {totalParticipants} deelnemers · {stagesData.length} etappes gereden
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Jersey tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0 font-condensed font-bold text-sm"
              style={{
                background: activeTab === tab.key ? `${tab.color}20` : 'var(--tour-bg-card)',
                borderColor: activeTab === tab.key ? tab.color : 'var(--tour-border)',
                color: activeTab === tab.key ? tab.color : 'var(--tour-text-muted)',
              }}
            >
              <JerseyIcon type={tab.jersey} size={24} />
              {tab.label}
            </button>
          ))}
          {/* Rode Lantaarn in general */}
          {activeTab === 'general' && general.length > 1 && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 text-xs" style={{ color: '#CC0000' }}>
              <JerseyIcon type="red_lantern" size={20} />
              Rode Lantaarn: {general[general.length - 1]?.name}
            </div>
          )}
        </div>

        <StandingsTable
          data={data}
          pointsKey={key}
          color={active.color}
          jerseyType={active.jersey}
        />
      </div>
    </div>
  );
}
