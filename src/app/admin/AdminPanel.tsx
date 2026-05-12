'use client';
import { useState } from 'react';
import { stageTypeLabel } from '@/lib/scoring';
import { formatShortDate } from '@/lib/utils';

interface Stage {
  id: string;
  stageNumber: number;
  date: string;
  startLocation: string;
  finishLocation: string;
  type: string;
  status: string;
  isSprintStage: boolean;
  isMountainStage: boolean;
}

interface Rider {
  id: string;
  name: string;
  isActive: boolean;
}

interface Props {
  participantCount: number;
  stages: Stage[];
  riders: Rider[];
  registrationOpen: boolean;
  valuesCalculated: boolean;
}

export default function AdminPanel({ participantCount, stages, riders, registrationOpen, valuesCalculated }: Props) {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState('');
  const [message, setMessage] = useState('');
  const [stageResults, setStageResults] = useState<{ position: string; riderName: string }[]>(
    Array.from({ length: 10 }, (_, i) => ({ position: String(i + 1), riderName: '' }))
  );
  const [selectedStage, setSelectedStage] = useState('');
  const [dnfRiderName, setDnfRiderName] = useState('');
  const [gcTop5, setGcTop5] = useState<string[]>(['', '', '', '', '']);

  const authHeaders = { 'Authorization': `Bearer ${password}`, 'Content-Type': 'application/json' };

  const checkAuth = async () => {
    const res = await fetch('/api/admin/check', { headers: { 'Authorization': `Bearer ${password}` } });
    if (res.ok) { setAuthed(true); setAuthError(''); }
    else setAuthError('Verkeerd wachtwoord');
  };

  const apiCall = async (url: string, body?: any) => {
    setLoading(url);
    setMessage('');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setMessage(res.ok ? `✓ ${data.message ?? 'Succes!'}` : `✗ ${data.error ?? 'Fout'}`);
    } catch {
      setMessage('✗ Netwerkfout');
    } finally {
      setLoading('');
    }
  };

  if (!authed) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="font-display text-4xl text-white mb-6 text-center">Admin</h1>
          <div className="card-dark p-6">
            <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
              Wachtwoord
            </label>
            <input
              className="form-input mb-3"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkAuth()}
            />
            {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
            <button
              onClick={checkAuth}
              className="w-full py-3 rounded-xl font-condensed font-bold text-black"
              style={{ background: 'var(--tour-yellow)' }}
            >
              Inloggen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'results', label: '🏁 Uitslag invoeren' },
    { key: 'stages', label: '📍 Etappes' },
    { key: 'registration', label: '📝 Inschrijving' },
    { key: 'gc', label: '🏆 Eindklassement' },
    { key: 'riders', label: '🚴 Renners' },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl text-white">Admin Paneel</h1>
          <button onClick={() => setAuthed(false)} className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>
            Uitloggen
          </button>
        </div>

        {message && (
          <div
            className="mb-6 p-4 rounded-lg text-sm font-condensed font-bold"
            style={{
              background: message.startsWith('✓') ? 'rgba(0,166,81,0.2)' : 'rgba(226,0,26,0.2)',
              color: message.startsWith('✓') ? '#00cc66' : '#ff4444',
              border: `1px solid ${message.startsWith('✓') ? 'rgba(0,166,81,0.3)' : 'rgba(226,0,26,0.3)'}`,
            }}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => setActiveSection(n.key)}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-condensed font-bold transition-all"
                style={{
                  background: activeSection === n.key ? 'rgba(255,215,0,0.15)' : 'transparent',
                  color: activeSection === n.key ? 'var(--tour-yellow)' : 'var(--tour-text-muted)',
                  border: `1px solid ${activeSection === n.key ? 'rgba(255,215,0,0.3)' : 'transparent'}`,
                }}
              >
                {n.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* DASHBOARD */}
            {activeSection === 'dashboard' && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Dashboard</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Deelnemers', value: participantCount, color: 'var(--tour-yellow)' },
                    { label: 'Inleg (€)', value: `€${participantCount * 10}`, color: '#00A651' },
                    { label: 'Inschrijving', value: registrationOpen ? 'Open' : 'Gesloten', color: registrationOpen ? '#00A651' : '#E2001A' },
                    { label: 'Etappes', value: stages.length, color: 'var(--tour-text)' },
                    { label: 'Gereden', value: stages.filter(s => s.status === 'completed').length, color: '#0055A4' },
                    { label: 'Waardecijfers', value: valuesCalculated ? 'Berekend' : 'Nog niet', color: valuesCalculated ? '#00A651' : 'var(--tour-text-muted)' },
                  ].map(s => (
                    <div key={s.label} className="card-dark p-4">
                      <div className="font-display text-2xl" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--tour-text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => apiCall('/api/admin/calculate-values')}
                    disabled={!!loading}
                    className="w-full py-3 px-4 rounded-lg font-condensed font-bold text-sm text-left transition-all"
                    style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: 'var(--tour-yellow)' }}
                  >
                    {loading === '/api/admin/calculate-values' ? '⌛ Bezig...' : '🔢 Waardecijfers berekenen'}
                  </button>
                  <button
                    onClick={() => apiCall('/api/admin/recalculate')}
                    disabled={!!loading}
                    className="w-full py-3 px-4 rounded-lg font-condensed font-bold text-sm text-left transition-all"
                    style={{ background: 'rgba(0,85,164,0.1)', border: '1px solid rgba(0,85,164,0.2)', color: '#4488ff' }}
                  >
                    {loading === '/api/admin/recalculate' ? '⌛ Bezig...' : '🔄 Punten herberekenen'}
                  </button>
                </div>
              </div>
            )}

            {/* RESULTS */}
            {activeSection === 'results' && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Uitslag Invoeren</h2>
                <div className="card-dark p-6">
                  <div className="mb-4">
                    <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
                      Etappe
                    </label>
                    <select
                      className="form-input"
                      value={selectedStage}
                      onChange={e => setSelectedStage(e.target.value)}
                    >
                      <option value="">Kies een etappe...</option>
                      {stages.map(s => (
                        <option key={s.id} value={s.id}>
                          Etappe {s.stageNumber} — {s.startLocation} → {s.finishLocation} ({formatShortDate(s.date)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 mb-4">
                    {stageResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center font-display text-sm flex-shrink-0"
                          style={{
                            background: i === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                            color: i === 0 ? '#FFD700' : 'var(--tour-text-muted)',
                          }}
                        >
                          {i + 1}
                        </div>
                        <input
                          className="form-input flex-1"
                          placeholder={`${i + 1}e — Rennernaam`}
                          value={r.riderName}
                          onChange={e => {
                            const updated = [...stageResults];
                            updated[i] = { ...updated[i], riderName: e.target.value };
                            setStageResults(updated);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => apiCall('/api/admin/stage-result', {
                        stageId: selectedStage,
                        results: stageResults.filter(r => r.riderName).map((r, i) => ({ position: i + 1, riderName: r.riderName })),
                      })}
                      disabled={!selectedStage || !!loading}
                      className="flex-1 py-3 rounded-lg font-condensed font-bold text-sm text-black disabled:opacity-40"
                      style={{ background: 'var(--tour-yellow)' }}
                    >
                      {loading ? '⌛ Bezig...' : '💾 Opslaan'}
                    </button>
                  </div>
                </div>

                {/* DNF */}
                <div className="card-dark p-6 mt-4">
                  <h3 className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-red)' }}>
                    Uitvaller markeren (DNF)
                  </h3>
                  <div className="flex gap-3">
                    <input
                      className="form-input flex-1"
                      placeholder="Rennernaam"
                      value={dnfRiderName}
                      onChange={e => setDnfRiderName(e.target.value)}
                    />
                    <button
                      onClick={() => apiCall('/api/admin/dnf', { riderName: dnfRiderName, stageId: selectedStage })}
                      disabled={!dnfRiderName || !!loading}
                      className="px-4 py-2 rounded-lg font-condensed font-bold text-sm text-white disabled:opacity-40"
                      style={{ background: 'rgba(226,0,26,0.3)', border: '1px solid rgba(226,0,26,0.4)' }}
                    >
                      DNF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGES */}
            {activeSection === 'stages' && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Etappes Beheren</h2>
                <div className="space-y-2">
                  {stages.map(stage => (
                    <div key={stage.id} className="card-dark p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-sm flex-shrink-0" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--tour-yellow)' }}>
                        {stage.stageNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-condensed font-bold text-sm text-white truncate">
                          {stage.startLocation} → {stage.finishLocation}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                          {formatShortDate(stage.date)} · {stageTypeLabel[stage.type]}
                          {stage.isSprintStage && ' · ⚡ Sprint'}
                          {stage.isMountainStage && ' · ⛰️ Berg'}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {['planned', 'active', 'completed'].map(status => (
                          <button
                            key={status}
                            onClick={() => apiCall('/api/admin/stage-status', { stageId: stage.id, status })}
                            className="px-2 py-1 rounded text-xs font-condensed font-bold transition-all"
                            style={{
                              background: stage.status === status ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                              color: stage.status === status ? 'var(--tour-yellow)' : 'var(--tour-text-muted)',
                              border: `1px solid ${stage.status === status ? 'rgba(255,215,0,0.3)' : 'transparent'}`,
                            }}
                          >
                            {status === 'planned' ? '📅' : status === 'active' ? '🔴' : '✓'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REGISTRATION */}
            {activeSection === 'registration' && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Inschrijving Beheren</h2>
                <div className="card-dark p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-condensed font-bold text-base text-white mb-1">
                        Inschrijving is {registrationOpen ? 'OPEN' : 'GESLOTEN'}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>
                        {registrationOpen
                          ? 'Deelnemers kunnen zich nog aanmelden.'
                          : 'Geen nieuwe inschrijvingen meer mogelijk.'}
                      </p>
                    </div>
                    <button
                      onClick={() => apiCall('/api/admin/registration', { open: !registrationOpen })}
                      disabled={!!loading}
                      className="px-6 py-3 rounded-xl font-condensed font-bold text-sm transition-all"
                      style={{
                        background: registrationOpen ? 'rgba(226,0,26,0.2)' : 'rgba(0,166,81,0.2)',
                        color: registrationOpen ? '#ff4444' : '#00cc66',
                        border: `1px solid ${registrationOpen ? 'rgba(226,0,26,0.3)' : 'rgba(0,166,81,0.3)'}`,
                      }}
                    >
                      {registrationOpen ? '🔒 Sluiten' : '🔓 Openen'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GC TOP 5 */}
            {activeSection === 'gc' && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Eindklassement Invoeren</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--tour-text-muted)' }}>
                  Voer na afloop van de Tour de echte top 5 GC in voor de bonuspuntenberekening.
                </p>
                <div className="card-dark p-6 space-y-3">
                  {gcTop5.map((name, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-display text-sm flex-shrink-0"
                        style={{
                          background: i === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                          color: i === 0 ? '#FFD700' : 'var(--tour-text-muted)',
                        }}
                      >
                        {i + 1}
                      </div>
                      <input
                        className="form-input flex-1"
                        placeholder={`${i + 1}e — Rennernaam`}
                        value={name}
                        onChange={e => {
                          const updated = [...gcTop5];
                          updated[i] = e.target.value;
                          setGcTop5(updated);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => apiCall('/api/admin/gc-top5', { top5: gcTop5.filter(Boolean) })}
                    disabled={!!loading}
                    className="w-full py-3 rounded-lg font-condensed font-bold text-sm text-black"
                    style={{ background: 'var(--tour-yellow)' }}
                  >
                    💾 Opslaan & Bonuspunten berekenen
                  </button>
                </div>
              </div>
            )}

            {/* RIDERS */}
            {activeSection === 'riders' && (
              <div>
                <h2 className="font-display text-3xl text-white mb-4">Renners ({riders.length})</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {riders.map(rider => (
                    <div key={rider.id} className="card-dark p-3 flex items-center justify-between">
                      <span className="font-condensed font-bold text-sm text-white">{rider.name}</span>
                      <button
                        onClick={() => apiCall('/api/admin/rider-status', { riderId: rider.id, isActive: !rider.isActive })}
                        className="text-xs px-2 py-1 rounded font-condensed font-bold"
                        style={{
                          background: rider.isActive ? 'rgba(0,166,81,0.2)' : 'rgba(226,0,26,0.2)',
                          color: rider.isActive ? '#00cc66' : '#ff4444',
                        }}
                      >
                        {rider.isActive ? 'Actief' : 'DNF'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
