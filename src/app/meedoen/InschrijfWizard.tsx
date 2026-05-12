'use client';
import { useState, useMemo, useCallback } from 'react';
import { TeamJersey } from '@/components/JerseyIcon';
import StageCard from '@/components/StageCard';
import { specialityLabel, specialityIcon, nationalityFlag } from '@/lib/scoring';

interface Rider {
  id: string;
  name: string;
  nationality: string;
  speciality: string;
  bio?: string | null;
  team: { name: string; primaryColor: string; secondaryColor: string } | null;
}

interface Stage {
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
}

interface Props {
  riders: Rider[];
  stages: Stage[];
}

const STEPS = ['Gegevens', 'Renners', 'Kopman', 'Gouden Etappe', 'Top 5 GC', 'Bevestiging'];
const MAX_RIDERS = 20;

export default function InschrijfWizard({ riders, stages }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', dateOfBirth: '', iban: '' });
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [goldenStageId, setGoldenStageId] = useState<string | null>(null);
  const [gcPrediction, setGcPrediction] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [gcSearch, setGcSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const teamOptions = useMemo(() => {
    const names = [...new Set(riders.map(r => r.team?.name).filter(Boolean))].sort();
    return names as string[];
  }, [riders]);

  const filteredRiders = useMemo(() => {
    return riders.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterTeam && r.team?.name !== filterTeam) return false;
      if (filterSpec && r.speciality !== filterSpec) return false;
      return true;
    });
  }, [riders, search, filterTeam, filterSpec]);

  const filteredGcRiders = useMemo(() => {
    if (!gcSearch) return riders.slice(0, 50);
    return riders.filter(r => r.name.toLowerCase().includes(gcSearch.toLowerCase())).slice(0, 50);
  }, [riders, gcSearch]);

  const toggleRider = useCallback((id: string) => {
    setSelectedRiders(prev => {
      if (prev.includes(id)) {
        if (captainId === id) setCaptainId(null);
        return prev.filter(r => r !== id);
      }
      if (prev.length >= MAX_RIDERS) return prev;
      return [...prev, id];
    });
  }, [captainId]);

  const toggleGcRider = useCallback((id: string) => {
    setGcPrediction(prev => {
      if (prev.includes(id)) return prev.filter(r => r !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }, []);

  const moveGcRider = useCallback((index: number, direction: 'up' | 'down') => {
    setGcPrediction(prev => {
      const newArr = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= newArr.length) return prev;
      [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
      return newArr;
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/inschrijving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          riderIds: selectedRiders,
          captainId,
          goldenStageId,
          gcPrediction: gcPrediction.map((id, i) => ({ riderId: id, position: i + 1 })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Er is een fout opgetreden');
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessPage name={form.name} />;
  }

  const canProceed = [
    form.name && form.email && form.dateOfBirth && form.iban,
    selectedRiders.length === MAX_RIDERS,
    captainId !== null,
    goldenStageId !== null,
    gcPrediction.length === 5,
    true,
  ][step];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">Inschrijven</h1>
          <p className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>Tour de Wognum 2026 · €10 inleg</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className="flex flex-col items-center flex-shrink-0"
                  onClick={() => i < step && setStep(i)}
                  style={{ cursor: i < step ? 'pointer' : 'default' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: i < step ? 'var(--tour-green)' : i === step ? 'var(--tour-yellow)' : 'var(--tour-border)',
                      color: i <= step ? '#000' : 'var(--tour-text-muted)',
                    }}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div className="hidden sm:block text-xs mt-1 text-center" style={{ color: i === step ? 'var(--tour-yellow)' : 'var(--tour-text-muted)', fontSize: '10px' }}>
                    {s}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1" style={{ background: i < step ? 'var(--tour-green)' : 'var(--tour-border)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="card-dark p-6 sm:p-8 mb-6">
          {/* STEP 0 — Gegevens */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-3xl text-white mb-6">Jouw Gegevens</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>Naam *</label>
                  <input
                    className="form-input"
                    placeholder="Jan de Wielrenner"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>E-mailadres *</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="jan@wognum.nl"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>Geboortedatum *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>IBAN *</label>
                  <input
                    className="form-input"
                    placeholder="NL91 ABNA 0417 1643 00"
                    value={form.iban}
                    onChange={e => setForm(f => ({ ...f, iban: e.target.value }))}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--tour-text-muted)' }}>Voor uitbetaling van de prijs</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Renners kiezen */}
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-3xl text-white">Kies 20 Renners</h2>
                <div
                  className="font-display text-2xl px-4 py-1 rounded-lg"
                  style={{
                    background: selectedRiders.length === MAX_RIDERS ? 'rgba(0,166,81,0.2)' : 'rgba(255,215,0,0.1)',
                    color: selectedRiders.length === MAX_RIDERS ? '#00A651' : 'var(--tour-yellow)',
                    border: `1px solid ${selectedRiders.length === MAX_RIDERS ? '#00A65130' : 'rgba(255,215,0,0.2)'}`,
                  }}
                >
                  {selectedRiders.length}/{MAX_RIDERS}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  className="form-input flex-1"
                  placeholder="🔍 Zoek op naam..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className="form-input sm:w-48"
                  value={filterTeam}
                  onChange={e => setFilterTeam(e.target.value)}
                >
                  <option value="">Alle ploegen</option>
                  {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  className="form-input sm:w-40"
                  value={filterSpec}
                  onChange={e => setFilterSpec(e.target.value)}
                >
                  <option value="">Alle types</option>
                  {Object.entries(specialityLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredRiders.map(rider => {
                  const isSelected = selectedRiders.includes(rider.id);
                  const flag = nationalityFlag[rider.nationality] ?? '🏳️';
                  return (
                    <div
                      key={rider.id}
                      onClick={() => toggleRider(rider.id)}
                      className={`relative flex flex-col items-center p-3 rounded-lg border transition-all duration-150 cursor-pointer ${!isSelected && selectedRiders.length >= MAX_RIDERS ? 'opacity-30 pointer-events-none' : ''}`}
                      style={{
                        background: isSelected ? 'rgba(255,215,0,0.1)' : 'var(--tour-bg-card2)',
                        borderColor: isSelected ? 'rgba(255,215,0,0.5)' : 'var(--tour-border)',
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {rider.team && (
                        <TeamJersey primaryColor={rider.team.primaryColor} secondaryColor={rider.team.secondaryColor} size={36} className="mb-1.5" />
                      )}
                      <div className="font-condensed font-bold text-xs text-center leading-tight text-white line-clamp-2">{rider.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--tour-text-muted)' }}>{flag}</div>
                      <span className={`badge badge-${rider.speciality} mt-1`} style={{ fontSize: '9px' }}>{specialityIcon[rider.speciality]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Selected sidebar */}
              {selectedRiders.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--tour-border)' }}>
                  <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
                    Jouw Ploeg ({selectedRiders.length}/{MAX_RIDERS})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRiders.map(id => {
                      const r = riders.find(r => r.id === id)!;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-condensed font-bold text-white cursor-pointer hover:bg-red-900 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                          onClick={() => toggleRider(id)}
                        >
                          {r?.name} ×
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Kopman */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl text-white mb-2">Kies je Kopman</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
                Je kopman scoort dubbele punten op elke etappe. Kies uit jouw 20 geselecteerde renners.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedRiders.map(id => {
                  const rider = riders.find(r => r.id === id)!;
                  const isCap = captainId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setCaptainId(isCap ? null : id)}
                      className="relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-1"
                      style={{
                        background: isCap ? 'rgba(255,215,0,0.12)' : 'var(--tour-bg-card)',
                        borderColor: isCap ? '#FFD700' : 'var(--tour-border)',
                        boxShadow: isCap ? '0 0 24px rgba(255,215,0,0.3)' : undefined,
                      }}
                    >
                      {isCap && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-black whitespace-nowrap" style={{ background: 'var(--tour-yellow)' }}>
                          ★ Kopman
                        </div>
                      )}
                      {rider.team && (
                        <TeamJersey primaryColor={rider.team.primaryColor} secondaryColor={rider.team.secondaryColor} size={48} className="mb-2" />
                      )}
                      <div className="font-condensed font-bold text-sm text-center text-white leading-tight">{rider.name}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--tour-text-muted)' }}>{rider.team?.name}</div>
                      <span className={`badge badge-${rider.speciality} mt-2`}>{specialityIcon[rider.speciality]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Gouden Etappe */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl text-white mb-2">Kies je Gouden Etappe</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
                Alle punten die jij scoort op de gouden etappe worden verdubbeld. Kies strategisch!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stages.map(stage => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    selected={goldenStageId === stage.id}
                    onSelect={() => setGoldenStageId(goldenStageId === stage.id ? null : stage.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — GC Prediction */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl text-white mb-2">Voorspel de Top 5</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--tour-text-muted)' }}>
                Kies 5 renners die jij in het eindklassement verwacht (uit het volledige deelnemersveld).
                Exacte positie = 20 pt, renner in top 5 = 10 pt.
              </p>

              {/* Selected order */}
              {gcPrediction.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow)' }}>
                    Jouw Voorspelling
                  </div>
                  {gcPrediction.map((id, i) => {
                    const r = riders.find(r => r.id === id)!;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: 'var(--tour-bg-card2)', border: '1px solid var(--tour-border)' }}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center font-display text-lg flex-shrink-0"
                          style={{
                            background: i === 0 ? 'rgba(255,215,0,0.2)' : i === 1 ? 'rgba(192,192,192,0.2)' : i === 2 ? 'rgba(205,127,50,0.2)' : 'rgba(255,255,255,0.05)',
                            color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--tour-text-muted)',
                          }}
                        >
                          {i + 1}
                        </div>
                        {r.team && <TeamJersey primaryColor={r.team.primaryColor} secondaryColor={r.team.secondaryColor} size={28} />}
                        <div className="flex-1">
                          <div className="font-condensed font-bold text-sm text-white">{r.name}</div>
                          <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>{r.team?.name}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => moveGcRider(i, 'up')} disabled={i === 0} className="w-6 h-6 rounded text-xs disabled:opacity-30" style={{ background: 'var(--tour-border)' }}>↑</button>
                          <button onClick={() => moveGcRider(i, 'down')} disabled={i === gcPrediction.length - 1} className="w-6 h-6 rounded text-xs disabled:opacity-30" style={{ background: 'var(--tour-border)' }}>↓</button>
                          <button onClick={() => toggleGcRider(id)} className="w-6 h-6 rounded text-xs text-red-400" style={{ background: 'rgba(226,0,26,0.2)' }}>×</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {gcPrediction.length < 5 && (
                <>
                  <input
                    className="form-input mb-3"
                    placeholder="🔍 Zoek een renner..."
                    value={gcSearch}
                    onChange={e => setGcSearch(e.target.value)}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                    {filteredGcRiders
                      .filter(r => !gcPrediction.includes(r.id))
                      .map(rider => (
                        <div
                          key={rider.id}
                          onClick={() => toggleGcRider(rider.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:border-yellow-400"
                          style={{ background: 'var(--tour-bg-card2)', borderColor: 'var(--tour-border)' }}
                        >
                          {rider.team && <TeamJersey primaryColor={rider.team.primaryColor} secondaryColor={rider.team.secondaryColor} size={24} />}
                          <div className="min-w-0">
                            <div className="font-condensed font-bold text-xs text-white truncate">{rider.name}</div>
                            <div className="text-xs truncate" style={{ color: 'var(--tour-text-muted)' }}>{rider.team?.name}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 5 — Bevestiging */}
          {step === 5 && (
            <div>
              <h2 className="font-display text-3xl text-white mb-6">Bevestiging</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Personal info */}
                <div>
                  <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
                    Jouw Gegevens
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Naam', value: form.name },
                      { label: 'E-mail', value: form.email },
                      { label: 'Geboortedatum', value: form.dateOfBirth },
                      { label: 'IBAN', value: form.iban },
                    ].map(f => (
                      <div key={f.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--tour-border)' }}>
                        <span style={{ color: 'var(--tour-text-muted)' }}>{f.label}</span>
                        <span className="font-condensed font-bold text-white">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Captain & golden stage */}
                <div>
                  <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
                    Jouw Keuzes
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--tour-text-muted)' }}>Kopman</div>
                      {captainId && (() => {
                        const r = riders.find(r => r.id === captainId)!;
                        return <div className="font-condensed font-bold text-white">{r.name} <span style={{ color: 'var(--tour-yellow)' }}>★</span></div>;
                      })()}
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--tour-text-muted)' }}>Gouden Etappe</div>
                      {goldenStageId && (() => {
                        const s = stages.find(s => s.id === goldenStageId)!;
                        return <div className="font-condensed font-bold text-white">Etappe {s.stageNumber}: {s.startLocation} → {s.finishLocation}</div>;
                      })()}
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--tour-text-muted)' }}>Top 5 GC Voorspelling</div>
                      {gcPrediction.map((id, i) => {
                        const r = riders.find(r => r.id === id)!;
                        return <div key={id} className="font-condensed text-sm text-white">{i + 1}. {r?.name}</div>;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected riders */}
              <div>
                <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
                  Jouw 20 Renners
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedRiders.map(id => {
                    const r = riders.find(r => r.id === id)!;
                    const isCap = captainId === id;
                    return (
                      <div key={id} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ background: 'var(--tour-bg-card2)', border: `1px solid ${isCap ? '#FFD700' : 'var(--tour-border)'}` }}>
                        {r.team && <TeamJersey primaryColor={r.team.primaryColor} secondaryColor={r.team.secondaryColor} size={20} />}
                        <span className="font-condensed font-bold text-white truncate">{r.name}</span>
                        {isCap && <span style={{ color: 'var(--tour-yellow)' }}>★</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirmation */}
              <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <p className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>
                  Door in te schrijven bevestig je dat je akkoord gaat met de spelregels en een inleg van <strong className="text-white">€10</strong> voldoet.
                  Na inschrijving zijn je keuzes definitief.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-red-900 border border-red-700 text-red-200 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 rounded-xl font-condensed font-bold text-sm transition-all"
              style={{ background: 'var(--tour-border)', color: 'var(--tour-text)' }}
            >
              ← Terug
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="px-8 py-3 rounded-xl font-condensed font-bold text-base text-black transition-all disabled:opacity-40"
              style={{ background: 'var(--tour-yellow)' }}
            >
              Volgende →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-xl font-condensed font-bold text-base text-black transition-all disabled:opacity-40"
              style={{ background: 'var(--tour-yellow)' }}
            >
              {submitting ? '⌛ Even geduld...' : '🚴 Inschrijven!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="font-display text-5xl text-white mb-4">Ingeschreven!</h1>
        <p className="text-lg mb-2" style={{ color: 'var(--tour-text-muted)' }}>
          Welkom, <strong className="text-white">{name}</strong>!
        </p>
        <p className="text-base mb-8" style={{ color: 'var(--tour-text-muted)' }}>
          Je bent ingeschreven voor de Tour de Wognum 2026. Vergeet niet de €10 inleg over te maken.
          Veel succes! 🚴
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/klassementen" className="px-6 py-3 rounded-xl font-condensed font-bold text-black" style={{ background: 'var(--tour-yellow)' }}>
            Bekijk klassementen
          </a>
          <a href="/" className="px-6 py-3 rounded-xl font-condensed font-bold text-white" style={{ border: '1px solid var(--tour-border)' }}>
            Terug naar home
          </a>
        </div>
      </div>
    </div>
  );
}
