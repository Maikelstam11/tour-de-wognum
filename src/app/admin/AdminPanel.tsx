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

interface ParticipantData {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  iban: string;
  createdAt: string | null;
  goldenStage: string | null;
  riders: { name: string; isCaptain: boolean }[];
  gcPredictions: string[];
}

interface Props {
  participantCount: number;
  stages: Stage[];
  riders: Rider[];
  registrationOpen: boolean;
  valuesCalculated: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Gepland',
  active: 'Live',
  completed: 'Gereden',
};
const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  planned: { bg: 'rgba(0,0,0,0.04)', color: 'var(--tour-text-muted)', border: 'var(--tour-border)' },
  active: { bg: 'rgba(232,184,0,0.12)', color: 'var(--tour-yellow-dark)', border: 'rgba(232,184,0,0.4)' },
  completed: { bg: 'rgba(0,135,63,0.1)', color: '#00873F', border: 'rgba(0,135,63,0.3)' },
};

export default function AdminPanel({ participantCount, stages: initialStages, riders, registrationOpen: initialRegOpen, valuesCalculated }: Props) {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState('');
  const [message, setMessage] = useState('');

  // Local stage state so status buttons update immediately
  const [stagesState, setStagesState] = useState<Stage[]>(initialStages);
  const [regOpen, setRegOpen] = useState(initialRegOpen);

  // Results entry
  const [resultRows, setResultRows] = useState<string[]>(Array(10).fill(''));
  const [selectedStageId, setSelectedStageId] = useState('');
  const [dnfRiderName, setDnfRiderName] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importSource, setImportSource] = useState('');

  // GC top 5
  const [gcTop5, setGcTop5] = useState<string[]>(['', '', '', '', '']);

  // Participants
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Riders search
  const [riderSearch, setRiderSearch] = useState('');

  const authHeaders = { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' };

  const checkAuth = async () => {
    const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) {
      setAuthed(true);
      setAuthError('');
      sessionStorage.setItem('adminPwd', password);
    } else setAuthError('Verkeerd wachtwoord');
  };

  const apiCall = async (url: string, body?: object): Promise<boolean> => {
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
      return res.ok;
    } catch {
      setMessage('✗ Netwerkfout');
      return false;
    } finally {
      setLoading('');
    }
  };

  const updateStageStatus = async (stageId: string, status: string) => {
    const ok = await apiCall('/api/admin/stage-status', { stageId, status });
    if (ok) setStagesState(prev => prev.map(s => s.id === stageId ? { ...s, status } : s));
  };

  const loadParticipants = async () => {
    if (participantsLoaded) return;
    setParticipantsLoading(true);
    try {
      const res = await fetch('/api/admin/participants', { headers: { Authorization: `Bearer ${password}` } });
      if (res.ok) {
        setParticipants(await res.json());
        setParticipantsLoaded(true);
      }
    } catch { /* ignore */ } finally {
      setParticipantsLoading(false);
    }
  };

  const importFromPCS = async () => {
    const stage = stagesState.find(s => s.id === selectedStageId);
    if (!stage) { setImportMessage('Kies eerst een etappe.'); return; }
    setImportLoading(true);
    setImportMessage('');
    setImportSource('');
    try {
      const res = await fetch('/api/admin/import-results', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ stageNumber: stage.stageNumber }),
      });
      const data = await res.json();
      if (res.ok && data.riders?.length) {
        const filled = [...data.riders, ...Array(10).fill('')].slice(0, 10);
        setResultRows(filled);
        setImportMessage(`✓ ${data.riders.length} renners opgehaald van ProCyclingStats — controleer en sla op.`);
        setImportSource(data.source ?? '');
      } else {
        setImportMessage(`✗ ${data.error ?? 'Niets gevonden'}`);
      }
    } catch {
      setImportMessage('✗ Netwerkfout bij ophalen');
    } finally {
      setImportLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveSection(key);
    if (key === 'participants') loadParticipants();
  };

  if (!authed) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="font-display text-4xl mb-6 text-center" style={{ color: 'var(--tour-text)' }}>Admin</h1>
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
              autoFocus
            />
            {authError && <p className="text-sm mb-3" style={{ color: 'var(--tour-red)' }}>{authError}</p>}
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
    { key: 'participants', label: '👥 Inschrijvingen' },
    { key: 'stages', label: '📍 Etappes' },
    { key: 'results', label: '🏁 Uitslag invoeren' },
    { key: 'registration', label: '🔓 Inschrijving' },
    { key: 'gc', label: '🏆 Eindklassement' },
    { key: 'riders', label: '🚴 Renners' },
  ];

  const completedCount = stagesState.filter(s => s.status === 'completed').length;
  const activeCount = stagesState.filter(s => s.status === 'active').length;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl" style={{ color: 'var(--tour-text)' }}>Admin Paneel</h1>
          <button onClick={() => setAuthed(false)} className="text-sm hover:underline" style={{ color: 'var(--tour-text-muted)' }}>
            Uitloggen
          </button>
        </div>

        {message && (
          <div
            className="mb-6 p-4 rounded-lg text-sm font-condensed font-bold"
            style={{
              background: message.startsWith('✓') ? 'rgba(0,135,63,0.1)' : 'rgba(204,0,21,0.1)',
              color: message.startsWith('✓') ? '#00873F' : 'var(--tour-red)',
              border: `1px solid ${message.startsWith('✓') ? 'rgba(0,135,63,0.3)' : 'rgba(204,0,21,0.3)'}`,
            }}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            <a
              href="/admin/etappes"
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-condensed font-bold flex items-center justify-between mb-3"
              style={{
                background: 'var(--tour-yellow)',
                color: '#000',
                display: 'flex',
              }}
            >
              <span>✏️ Etappes bewerken</span>
              <span>→</span>
            </a>
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => handleTabChange(n.key)}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-condensed font-bold transition-all"
                style={{
                  background: activeSection === n.key ? 'rgba(232,184,0,0.1)' : 'transparent',
                  color: activeSection === n.key ? 'var(--tour-yellow-dark)' : 'var(--tour-text-muted)',
                  border: `1px solid ${activeSection === n.key ? 'rgba(232,184,0,0.3)' : 'transparent'}`,
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
                <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--tour-text)' }}>Dashboard</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Deelnemers', value: participantCount, color: 'var(--tour-yellow-dark)' },
                    { label: 'Pot (€10 p.p.)', value: `€${participantCount * 10}`, color: '#00873F' },
                    { label: 'Inschrijving', value: regOpen ? 'Open' : 'Gesloten', color: regOpen ? '#00873F' : 'var(--tour-red)' },
                    { label: 'Etappes totaal', value: stagesState.length, color: 'var(--tour-text)' },
                    { label: 'Gereden', value: completedCount, color: '#0055A4' },
                    { label: 'Waardecijfers', value: valuesCalculated ? 'Berekend' : 'Nog niet', color: valuesCalculated ? '#00873F' : 'var(--tour-text-muted)' },
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
                    className="w-full py-3 px-4 rounded-lg font-condensed font-bold text-sm text-left transition-all disabled:opacity-50"
                    style={{ background: 'rgba(232,184,0,0.08)', border: '1px solid rgba(232,184,0,0.25)', color: 'var(--tour-yellow-dark)' }}
                  >
                    {loading === '/api/admin/calculate-values' ? '⌛ Bezig...' : '🔢 Waardecijfers berekenen'}
                  </button>
                  <button
                    onClick={() => apiCall('/api/admin/recalculate')}
                    disabled={!!loading}
                    className="w-full py-3 px-4 rounded-lg font-condensed font-bold text-sm text-left transition-all disabled:opacity-50"
                    style={{ background: 'rgba(0,85,164,0.08)', border: '1px solid rgba(0,85,164,0.2)', color: '#0055A4' }}
                  >
                    {loading === '/api/admin/recalculate' ? '⌛ Bezig...' : '🔄 Punten herberekenen'}
                  </button>
                </div>
              </div>
            )}

            {/* PARTICIPANTS */}
            {activeSection === 'participants' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-3xl" style={{ color: 'var(--tour-text)' }}>
                    Inschrijvingen ({participantCount})
                  </h2>
                  <button
                    onClick={() => { setParticipantsLoaded(false); loadParticipants(); }}
                    className="text-xs px-3 py-1.5 rounded font-condensed font-bold"
                    style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--tour-text-muted)' }}
                  >
                    ↻ Verversen
                  </button>
                </div>

                {participantsLoading && (
                  <div className="text-center py-12" style={{ color: 'var(--tour-text-muted)' }}>
                    ⌛ Laden...
                  </div>
                )}

                {!participantsLoading && participants.length === 0 && participantsLoaded && (
                  <div className="card-dark p-8 text-center" style={{ color: 'var(--tour-text-muted)' }}>
                    Nog geen inschrijvingen.
                  </div>
                )}

                <div className="space-y-2">
                  {participants.map((p, i) => (
                    <div key={p.id} className="card-dark overflow-hidden">
                      {/* Row */}
                      <button
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm flex-shrink-0"
                          style={{ background: 'rgba(232,184,0,0.12)', color: 'var(--tour-yellow-dark)' }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-condensed font-bold text-sm" style={{ color: 'var(--tour-text)' }}>{p.name}</div>
                          <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>{p.email}</div>
                        </div>
                        <div className="text-xs font-condensed" style={{ color: 'var(--tour-text-muted)' }}>
                          {p.riders.length} renners · {expandedId === p.id ? '▲' : '▼'}
                        </div>
                      </button>

                      {/* Expanded */}
                      {expandedId === p.id && (
                        <div className="border-t px-4 pb-4 pt-3 space-y-4" style={{ borderColor: 'var(--tour-border)', background: 'var(--tour-bg-card2)' }}>
                          {/* Personal info */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {[
                              { label: 'Geboortedatum', value: p.dateOfBirth },
                              { label: 'IBAN', value: p.iban },
                              { label: 'Gouden etappe', value: p.goldenStage ?? '—' },
                              { label: 'Ingeschreven', value: p.createdAt ? new Date(p.createdAt).toLocaleDateString('nl-NL') : '—' },
                            ].map(f => (
                              <div key={f.label}>
                                <div className="font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--tour-text-muted)', fontSize: '10px' }}>{f.label}</div>
                                <div style={{ color: 'var(--tour-text)' }}>{f.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Riders */}
                          <div>
                            <div className="font-condensed font-bold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
                              Gekozen renners ({p.riders.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {p.riders.map((r, ri) => (
                                <span
                                  key={ri}
                                  className="text-xs px-2 py-0.5 rounded font-condensed"
                                  style={r.isCaptain
                                    ? { background: 'rgba(232,184,0,0.15)', color: 'var(--tour-yellow-dark)', border: '1px solid rgba(232,184,0,0.4)', fontWeight: 700 }
                                    : { background: 'rgba(0,0,0,0.05)', color: 'var(--tour-text)' }
                                  }
                                >
                                  {r.isCaptain ? '⭐ ' : ''}{r.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* GC predictions */}
                          {p.gcPredictions.length > 0 && (
                            <div>
                              <div className="font-condensed font-bold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
                                GC top 5 voorspelling
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {p.gcPredictions.map((name, gi) => (
                                  <span key={gi} className="text-xs font-condensed" style={{ color: 'var(--tour-text)' }}>
                                    <span style={{ color: 'var(--tour-text-muted)' }}>{gi + 1}.</span> {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGES */}
            {activeSection === 'stages' && (
              <div>
                <h2 className="font-display text-3xl mb-1" style={{ color: 'var(--tour-text)' }}>Etappes Beheren</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--tour-text-muted)' }}>
                  Klik op een status om de etappe bij te werken. De wijziging gaat direct in.
                </p>
                <div className="space-y-2">
                  {stagesState.map(stage => {
                    const active = STATUS_COLORS[stage.status];
                    return (
                      <div key={stage.id} className="card-dark p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-display text-sm flex-shrink-0"
                            style={{ background: 'rgba(232,184,0,0.1)', color: 'var(--tour-yellow-dark)' }}
                          >
                            {stage.stageNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-condensed font-bold text-sm truncate" style={{ color: 'var(--tour-text)' }}>
                              {stage.startLocation} → {stage.finishLocation}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                              {formatShortDate(stage.date)} · {stageTypeLabel[stage.type]}
                              {stage.isSprintStage && ' · ⚡ Sprint'}
                              {stage.isMountainStage && ' · ⛰️ Berg'}
                            </div>
                          </div>
                          <div
                            className="text-xs font-condensed font-bold px-2 py-1 rounded flex-shrink-0"
                            style={{ background: active.bg, color: active.color, border: `1px solid ${active.border}` }}
                          >
                            {STATUS_LABELS[stage.status]}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(['planned', 'active', 'completed'] as const).map(status => {
                            const c = STATUS_COLORS[status];
                            const isSelected = stage.status === status;
                            return (
                              <button
                                key={status}
                                onClick={() => updateStageStatus(stage.id, status)}
                                disabled={isSelected || !!loading}
                                className="flex-1 py-1.5 rounded text-xs font-condensed font-bold transition-all disabled:opacity-40"
                                style={{
                                  background: isSelected ? c.bg : 'rgba(0,0,0,0.03)',
                                  color: isSelected ? c.color : 'var(--tour-text-muted)',
                                  border: `1px solid ${isSelected ? c.border : 'var(--tour-border)'}`,
                                }}
                              >
                                {status === 'planned' ? '📅 Gepland' : status === 'active' ? '🔴 Live' : '✓ Gereden'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RESULTS */}
            {activeSection === 'results' && (
              <div>
                <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--tour-text)' }}>Uitslag Invoeren</h2>

                {/* Auto-import card */}
                <div className="card-dark p-5 mb-4" style={{ borderLeft: '3px solid var(--tour-yellow)' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-condensed font-bold text-sm mb-1" style={{ color: 'var(--tour-text)' }}>
                        📡 Automatisch importeren van ProCyclingStats
                      </div>
                      <p className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                        Kies een etappe, klik op ophalen — de top 10 wordt automatisch ingevuld. Controleer daarna en sla op.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select
                      className="form-input flex-1"
                      value={selectedStageId}
                      onChange={e => { setSelectedStageId(e.target.value); setImportMessage(''); setImportSource(''); }}
                    >
                      <option value="">Kies een etappe...</option>
                      {stagesState.map(s => (
                        <option key={s.id} value={s.id}>
                          Etappe {s.stageNumber} — {s.startLocation} → {s.finishLocation}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={importFromPCS}
                      disabled={!selectedStageId || importLoading}
                      className="flex-shrink-0 px-4 py-2 rounded-lg font-condensed font-bold text-sm text-black disabled:opacity-40 transition-all"
                      style={{ background: 'var(--tour-yellow)', whiteSpace: 'nowrap' }}
                    >
                      {importLoading ? '⌛ Ophalen...' : '🌐 Haal op'}
                    </button>
                  </div>
                  {importMessage && (
                    <div className="mt-3 text-xs font-condensed font-bold" style={{ color: importMessage.startsWith('✓') ? '#00873F' : 'var(--tour-red)' }}>
                      {importMessage}
                      {importSource && (
                        <span className="ml-2 font-normal" style={{ color: 'var(--tour-text-muted)' }}>
                          — <a href={importSource} target="_blank" rel="noopener noreferrer" className="underline">bron</a>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="card-dark p-6">
                  <div className="mb-4">
                    <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
                      Etappe (of kies hierboven via auto-import)
                    </label>
                    <select
                      className="form-input"
                      value={selectedStageId}
                      onChange={e => setSelectedStageId(e.target.value)}
                    >
                      <option value="">Kies een etappe...</option>
                      {stagesState.map(s => (
                        <option key={s.id} value={s.id}>
                          Etappe {s.stageNumber} — {s.startLocation} → {s.finishLocation} ({formatShortDate(s.date)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 mb-4">
                    {resultRows.map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center font-display text-sm flex-shrink-0"
                          style={{
                            background: i === 0 ? 'rgba(232,184,0,0.15)' : i === 1 ? 'rgba(160,160,160,0.12)' : i === 2 ? 'rgba(150,90,30,0.1)' : 'rgba(0,0,0,0.04)',
                            color: i === 0 ? 'var(--tour-yellow-dark)' : i === 1 ? '#888' : i === 2 ? '#8B5E1A' : 'var(--tour-text-muted)',
                          }}
                        >
                          {i + 1}
                        </div>
                        <input
                          className="form-input flex-1"
                          placeholder={`${i + 1}e — Rennernaam`}
                          value={name}
                          onChange={e => {
                            const updated = [...resultRows];
                            updated[i] = e.target.value;
                            setResultRows(updated);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => apiCall('/api/admin/stage-result', {
                      stageId: selectedStageId,
                      results: resultRows
                        .map((name, i) => ({ position: i + 1, riderName: name }))
                        .filter(r => r.riderName.trim()),
                    })}
                    disabled={!selectedStageId || !!loading}
                    className="w-full py-3 rounded-lg font-condensed font-bold text-sm text-black disabled:opacity-40"
                    style={{ background: 'var(--tour-yellow)' }}
                  >
                    {loading ? '⌛ Bezig...' : '💾 Uitslag opslaan & etappe sluiten'}
                  </button>
                </div>

                {/* DNF */}
                <div className="card-dark p-5 mt-4">
                  <h3 className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-red)' }}>
                    Uitvaller markeren (DNF)
                  </h3>
                  <div className="flex gap-3">
                    <input
                      className="form-input flex-1"
                      placeholder="Rennernaam (gedeeltelijk)"
                      value={dnfRiderName}
                      onChange={e => setDnfRiderName(e.target.value)}
                    />
                    <button
                      onClick={() => apiCall('/api/admin/dnf', { riderName: dnfRiderName, stageId: selectedStageId })}
                      disabled={!dnfRiderName || !!loading}
                      className="px-4 py-2 rounded-lg font-condensed font-bold text-sm disabled:opacity-40"
                      style={{ background: 'rgba(204,0,21,0.1)', border: '1px solid rgba(204,0,21,0.3)', color: 'var(--tour-red)' }}
                    >
                      DNF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REGISTRATION */}
            {activeSection === 'registration' && (
              <div>
                <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--tour-text)' }}>Inschrijving Beheren</h2>
                <div className="card-dark p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-condensed font-bold text-lg mb-1" style={{ color: 'var(--tour-text)' }}>
                        Inschrijving is <span style={{ color: regOpen ? '#00873F' : 'var(--tour-red)' }}>{regOpen ? 'OPEN' : 'GESLOTEN'}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>
                        {regOpen
                          ? 'Deelnemers kunnen zich nog aanmelden.'
                          : 'Geen nieuwe inschrijvingen meer mogelijk.'}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const ok = await apiCall('/api/admin/registration', { open: !regOpen });
                        if (ok) setRegOpen(!regOpen);
                      }}
                      disabled={!!loading}
                      className="flex-shrink-0 px-6 py-3 rounded-xl font-condensed font-bold text-sm transition-all disabled:opacity-50"
                      style={{
                        background: regOpen ? 'rgba(204,0,21,0.08)' : 'rgba(0,135,63,0.08)',
                        color: regOpen ? 'var(--tour-red)' : '#00873F',
                        border: `1px solid ${regOpen ? 'rgba(204,0,21,0.25)' : 'rgba(0,135,63,0.25)'}`,
                      }}
                    >
                      {regOpen ? '🔒 Inschrijving sluiten' : '🔓 Inschrijving openen'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GC TOP 5 */}
            {activeSection === 'gc' && (
              <div>
                <h2 className="font-display text-3xl mb-2" style={{ color: 'var(--tour-text)' }}>Eindklassement Invoeren</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--tour-text-muted)' }}>
                  Voer na afloop van de Tour de echte top 5 GC in voor de bonuspuntenberekening.
                </p>
                <div className="card-dark p-6 space-y-3">
                  {gcTop5.map((name, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-display text-sm flex-shrink-0"
                        style={{
                          background: i === 0 ? 'rgba(232,184,0,0.15)' : i === 1 ? 'rgba(160,160,160,0.12)' : i === 2 ? 'rgba(150,90,30,0.1)' : 'rgba(0,0,0,0.04)',
                          color: i === 0 ? 'var(--tour-yellow-dark)' : i === 1 ? '#888' : i === 2 ? '#8B5E1A' : 'var(--tour-text-muted)',
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
                    className="w-full py-3 rounded-lg font-condensed font-bold text-sm text-black disabled:opacity-50"
                    style={{ background: 'var(--tour-yellow)' }}
                  >
                    💾 Opslaan & bonuspunten berekenen
                  </button>
                </div>
              </div>
            )}

            {/* RIDERS */}
            {activeSection === 'riders' && (
              <div>
                <h2 className="font-display text-3xl mb-3" style={{ color: 'var(--tour-text)' }}>Renners ({riders.length})</h2>
                <input
                  className="form-input mb-3"
                  placeholder="🔍 Zoek renner..."
                  value={riderSearch}
                  onChange={e => setRiderSearch(e.target.value)}
                />
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
                  {riders
                    .filter(r => !riderSearch || r.name.toLowerCase().includes(riderSearch.toLowerCase()))
                    .map(rider => (
                      <div key={rider.id} className="card-dark px-4 py-3 flex items-center justify-between">
                        <span className="font-condensed font-bold text-sm" style={{ color: 'var(--tour-text)' }}>{rider.name}</span>
                        <button
                          onClick={() => apiCall('/api/admin/rider-status', { riderId: rider.id, isActive: !rider.isActive })}
                          className="text-xs px-3 py-1 rounded font-condensed font-bold transition-all"
                          style={{
                            background: rider.isActive ? 'rgba(0,135,63,0.1)' : 'rgba(204,0,21,0.1)',
                            color: rider.isActive ? '#00873F' : 'var(--tour-red)',
                            border: `1px solid ${rider.isActive ? 'rgba(0,135,63,0.25)' : 'rgba(204,0,21,0.25)'}`,
                          }}
                        >
                          {rider.isActive ? '✓ Actief' : '✗ DNF'}
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
