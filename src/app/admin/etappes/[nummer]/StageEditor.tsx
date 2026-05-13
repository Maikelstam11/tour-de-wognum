'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface StageData {
  id: string;
  stageNumber: number;
  date: string;
  startLocation: string;
  finishLocation: string;
  type: string;
  distanceKm: number;
  elevationMeters: number;
  description: string | null;
  isSprintStage: boolean;
  isMountainStage: boolean;
  status: string;
  expectedScenario: string | null;
  profileImageUrl: string | null;
  routeImageUrl: string | null;
  country: string | null;
}

const TYPE_OPTIONS = [
  { value: 'flat', label: 'Vlak' },
  { value: 'hilly', label: 'Heuvelachtig' },
  { value: 'mountain', label: 'Bergrit' },
  { value: 'time_trial', label: 'Individuele tijdrit' },
  { value: 'team_time_trial', label: 'Ploegentijdrit' },
  { value: 'rest_day', label: 'Rustdag' },
];

interface ImageUploadProps {
  label: string;
  currentUrl: string | null;
  pendingFile: File | null;
  onFileChange: (file: File | null) => void;
  onDelete: () => void;
  deleting: boolean;
  blobAvailable: boolean;
}

function ImageUpload({ label, currentUrl, pendingFile, onFileChange, onDelete, deleting, blobAvailable }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : currentUrl;

  return (
    <div>
      <div className="font-condensed font-bold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
        {label}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative mb-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--tour-border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label} className="w-full max-h-48 object-cover" />
          {pendingFile && (
            <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-condensed font-bold"
              style={{ background: 'rgba(232,184,0,0.9)', color: '#000' }}>
              Nieuw — nog niet opgeslagen
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {blobAvailable ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 rounded-lg text-sm font-condensed font-bold transition-all"
              style={{ background: 'rgba(0,85,164,0.08)', color: '#0055A4', border: '1px solid rgba(0,85,164,0.2)' }}
            >
              {currentUrl || pendingFile ? '🔄 Vervangen' : '📷 Afbeelding uploaden'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => onFileChange(e.target.files?.[0] ?? null)}
            />
          </>
        ) : (
          <p className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
            ⚠️ Upload niet beschikbaar — voeg <code className="px-1 rounded" style={{ background: 'rgba(0,0,0,0.06)' }}>BLOB_READ_WRITE_TOKEN</code> toe in Vercel.
          </p>
        )}

        {(currentUrl || pendingFile) && (
          <button
            type="button"
            onClick={() => {
              if (pendingFile) { onFileChange(null); }
              else { onDelete(); }
            }}
            disabled={deleting}
            className="px-3 py-2 rounded-lg text-sm font-condensed font-bold transition-all disabled:opacity-40"
            style={{ background: 'rgba(204,0,21,0.08)', color: 'var(--tour-red)', border: '1px solid rgba(204,0,21,0.2)' }}
          >
            {deleting ? '⌛' : '🗑️'} {pendingFile ? 'Annuleren' : 'Verwijderen'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function StageEditor({ stage }: { stage: StageData }) {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form state
  const [startLocation, setStartLocation] = useState(stage.startLocation);
  const [finishLocation, setFinishLocation] = useState(stage.finishLocation);
  const [distanceKm, setDistanceKm] = useState(String(stage.distanceKm));
  const [elevationMeters, setElevationMeters] = useState(String(stage.elevationMeters));
  const [type, setType] = useState(stage.type);
  const [country, setCountry] = useState(stage.country ?? 'Frankrijk');
  const [description, setDescription] = useState(stage.description ?? '');
  const [expectedScenario, setExpectedScenario] = useState(stage.expectedScenario ?? '');
  const [isSprintStage, setIsSprintStage] = useState(stage.isSprintStage);
  const [isMountainStage, setIsMountainStage] = useState(stage.isMountainStage);

  // Image state
  const [profileImageUrl, setProfileImageUrl] = useState(stage.profileImageUrl);
  const [routeImageUrl, setRouteImageUrl] = useState(stage.routeImageUrl);
  const [pendingProfileFile, setPendingProfileFile] = useState<File | null>(null);
  const [pendingRouteFile, setPendingRouteFile] = useState<File | null>(null);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [deletingRoute, setDeletingRoute] = useState(false);
  const [blobAvailable, setBlobAvailable] = useState(true);

  // Save state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const authHeaders = (pwd: string) => ({
    Authorization: `Bearer ${pwd}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const saved = sessionStorage.getItem('adminPwd');
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) {
      sessionStorage.setItem('adminPwd', password);
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Verkeerd wachtwoord');
    }
  };

  const deleteImage = async (imgType: 'profile' | 'route') => {
    const setter = imgType === 'profile' ? setDeletingProfile : setDeletingRoute;
    setter(true);
    try {
      const res = await fetch(`/api/admin/stages/${stage.stageNumber}/image`, {
        method: 'DELETE',
        headers: authHeaders(password),
        body: JSON.stringify({ type: imgType }),
      });
      if (res.ok) {
        if (imgType === 'profile') setProfileImageUrl(null);
        else setRouteImageUrl(null);
        setMessage('✓ Afbeelding verwijderd');
      } else {
        const d = await res.json();
        if (d.error?.includes('BLOB_READ_WRITE_TOKEN')) setBlobAvailable(false);
        setMessage(`✗ ${d.error}`);
      }
    } catch { setMessage('✗ Netwerkfout'); }
    finally { setter(false); }
  };

  const uploadImage = async (file: File, imgType: 'profile' | 'route'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', imgType);
    const res = await fetch(`/api/admin/stages/${stage.stageNumber}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${password}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error?.includes('BLOB_READ_WRITE_TOKEN')) setBlobAvailable(false);
      throw new Error(data.error ?? 'Upload mislukt');
    }
    return data.url;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Upload pending images first
      let newProfileUrl = profileImageUrl;
      let newRouteUrl = routeImageUrl;

      if (pendingProfileFile) {
        newProfileUrl = await uploadImage(pendingProfileFile, 'profile');
        setProfileImageUrl(newProfileUrl);
        setPendingProfileFile(null);
      }
      if (pendingRouteFile) {
        newRouteUrl = await uploadImage(pendingRouteFile, 'route');
        setRouteImageUrl(newRouteUrl);
        setPendingRouteFile(null);
      }

      // Save all fields
      const res = await fetch(`/api/admin/stages/${stage.stageNumber}`, {
        method: 'PUT',
        headers: authHeaders(password),
        body: JSON.stringify({
          startLocation,
          finishLocation,
          distanceKm: Number(distanceKm),
          elevationMeters: Number(elevationMeters),
          type,
          country,
          description: description || null,
          expectedScenario: expectedScenario || null,
          isSprintStage,
          isMountainStage,
        }),
      });
      const data = await res.json();
      setMessage(res.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    } catch (e: any) {
      setMessage(`✗ ${e.message ?? 'Fout bij opslaan'}`);
    } finally {
      setSaving(false);
    }
  };

  // Auth gate
  if (!authed) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <Link href="/admin/etappes" className="block text-sm mb-6 hover:underline" style={{ color: 'var(--tour-text-muted)' }}>
            ← Alle etappes
          </Link>
          <h1 className="font-display text-3xl mb-6" style={{ color: 'var(--tour-text)' }}>
            Etappe {stage.stageNumber} bewerken
          </h1>
          <div className="card-dark p-6">
            <label className="block text-xs font-condensed font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-text-muted)' }}>
              Admin wachtwoord
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

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <Link
            href="/admin/etappes"
            className="text-sm font-condensed font-bold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--tour-text-muted)' }}
          >
            ← Alle etappes
          </Link>
          <div>
            <div className="font-condensed text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--tour-yellow-dark)' }}>
              Etappe {stage.stageNumber} · {formatDate(stage.date)}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl" style={{ color: 'var(--tour-text)' }}>
              {stage.startLocation} → {stage.finishLocation}
            </h1>
          </div>
          <Link
            href={`/etappes/${stage.stageNumber}`}
            target="_blank"
            className="ml-auto text-xs font-condensed font-bold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,85,164,0.08)', color: '#0055A4' }}
          >
            🔗 Bekijk publiek
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className="mb-6 p-4 rounded-lg text-sm font-condensed font-bold"
            style={{
              background: message.startsWith('✓') ? 'rgba(0,135,63,0.08)' : 'rgba(204,0,21,0.08)',
              color: message.startsWith('✓') ? '#00873F' : 'var(--tour-red)',
              border: `1px solid ${message.startsWith('✓') ? 'rgba(0,135,63,0.25)' : 'rgba(204,0,21,0.25)'}`,
            }}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basisgegevens */}
            <div className="card-dark p-6">
              <h2 className="font-condensed font-bold text-base uppercase tracking-widest mb-4" style={{ color: 'var(--tour-yellow-dark)' }}>
                Basisgegevens
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Startlocatie</label>
                  <input className="form-input" value={startLocation} onChange={e => setStartLocation(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Finishlocatie</label>
                  <input className="form-input" value={finishLocation} onChange={e => setFinishLocation(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Afstand (km)</label>
                  <input className="form-input" type="number" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Hoogtemeters (hm)</label>
                  <input className="form-input" type="number" value={elevationMeters} onChange={e => setElevationMeters(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Type etappe</label>
                  <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                    {TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Land / regio</label>
                  <input className="form-input" value={country} onChange={e => setCountry(e.target.value)} placeholder="bijv. Spanje, Pyreneeën" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4 mt-4 flex-wrap">
                {[
                  { label: '⚡ Sprint-etappe', value: isSprintStage, set: setIsSprintStage },
                  { label: '⛰️ Bergetappe', value: isMountainStage, set: setIsMountainStage },
                ].map(({ label, value, set }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set(!value)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-condensed font-bold text-sm transition-all"
                    style={{
                      background: value ? 'rgba(232,184,0,0.12)' : 'rgba(0,0,0,0.04)',
                      color: value ? 'var(--tour-yellow-dark)' : 'var(--tour-text-muted)',
                      border: `1px solid ${value ? 'rgba(232,184,0,0.35)' : 'var(--tour-border)'}`,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-sm flex items-center justify-center text-xs"
                      style={{ background: value ? 'var(--tour-yellow)' : 'transparent', border: `1px solid ${value ? 'transparent' : 'var(--tour-border)'}` }}
                    >
                      {value ? '✓' : ''}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Beschrijving */}
            <div className="card-dark p-6">
              <h2 className="font-condensed font-bold text-base uppercase tracking-widest mb-4" style={{ color: 'var(--tour-yellow-dark)' }}>
                Beschrijving
              </h2>
              <label className="form-label">
                Hoofdtekst (getoond op de etappepagina)
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  { label: 'B', title: 'Dikgedrukt', wrap: '**', display: 'font-bold' },
                  { label: 'I', title: 'Cursief', wrap: '_', display: 'italic' },
                ].map(btn => (
                  <button
                    key={btn.label}
                    type="button"
                    title={btn.title}
                    onClick={() => {
                      const el = document.getElementById('desc-textarea') as HTMLTextAreaElement;
                      const start = el.selectionStart;
                      const end = el.selectionEnd;
                      const sel = description.slice(start, end) || btn.title;
                      const newVal = description.slice(0, start) + btn.wrap + sel + btn.wrap + description.slice(end);
                      setDescription(newVal);
                      setTimeout(() => { el.focus(); el.setSelectionRange(start + btn.wrap.length, start + btn.wrap.length + sel.length); }, 0);
                    }}
                    className={`px-2 py-0.5 rounded text-xs border ${btn.display}`}
                    style={{ background: 'var(--tour-bg-card2)', border: '1px solid var(--tour-border-strong)', color: 'var(--tour-text)', fontFamily: 'inherit' }}
                  >
                    {btn.label}
                  </button>
                ))}
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--tour-bg-card2)', border: '1px solid var(--tour-border)', color: 'var(--tour-text-muted)', fontFamily: 'monospace' }}>
                  lege regel = nieuwe alinea
                </span>
              </div>
              <textarea
                id="desc-textarea"
                className="form-input"
                rows={8}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Beschrijf de etappe: het parcours, de uitdagingen, de verwachte strijd..."
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              />
              <div className="mt-1 text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                {description.length} tekens · Markdown ondersteund: **dikgedrukt**, _cursief_, lege regel = alinea
              </div>
            </div>

            {/* Verwacht scenario */}
            <div className="card-dark p-6">
              <h2 className="font-condensed font-bold text-base uppercase tracking-widest mb-4" style={{ color: 'var(--tour-yellow-dark)' }}>
                Verwacht scenario
              </h2>
              <label className="form-label">
                Korte analyse (sidebar op de etappepagina)
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={expectedScenario}
                onChange={e => setExpectedScenario(e.target.value)}
                placeholder="bijv. Een massasprint wordt verwacht. De sprinters zijn aan zet na een vlakke finale."
              />
            </div>
          </div>

          {/* Sidebar: images + save */}
          <div className="space-y-6">
            {/* Afbeeldingen */}
            <div className="card-dark p-6 space-y-6">
              <h2 className="font-condensed font-bold text-base uppercase tracking-widest" style={{ color: 'var(--tour-yellow-dark)' }}>
                Afbeeldingen
              </h2>

              <ImageUpload
                label="Etappeprofiel"
                currentUrl={profileImageUrl}
                pendingFile={pendingProfileFile}
                onFileChange={setPendingProfileFile}
                onDelete={() => deleteImage('profile')}
                deleting={deletingProfile}
                blobAvailable={blobAvailable}
              />

              <div style={{ borderTop: '1px solid var(--tour-border)', paddingTop: '20px' }}>
                <ImageUpload
                  label="Routekaart"
                  currentUrl={routeImageUrl}
                  pendingFile={pendingRouteFile}
                  onFileChange={setPendingRouteFile}
                  onDelete={() => deleteImage('route')}
                  deleting={deletingRoute}
                  blobAvailable={blobAvailable}
                />
              </div>

              {!blobAvailable && (
                <div className="text-xs p-3 rounded-lg" style={{ background: 'rgba(232,184,0,0.08)', border: '1px solid rgba(232,184,0,0.2)', color: 'var(--tour-text-muted)' }}>
                  <strong style={{ color: 'var(--tour-yellow-dark)' }}>Setup vereist:</strong> Voeg <code>BLOB_READ_WRITE_TOKEN</code> toe in{' '}
                  <strong>Vercel → Project → Settings → Environment Variables</strong>.
                  Je kunt de token aanmaken op{' '}
                  <strong>Vercel → Storage → Blob → Create Store</strong>.
                </div>
              )}
            </div>

            {/* Save */}
            <div className="card-dark p-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl font-condensed font-bold text-lg text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'var(--tour-yellow)' }}
              >
                {saving ? '⌛ Opslaan...' : '💾 Alles opslaan'}
              </button>
              <p className="text-xs text-center mt-2" style={{ color: 'var(--tour-text-muted)' }}>
                Wijzigingen zijn direct zichtbaar op de publieke etappepagina.
              </p>
            </div>

            {/* Quick nav */}
            <div className="card-dark p-4">
              <div className="font-condensed font-bold text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--tour-text-muted)' }}>
                Navigatie
              </div>
              <div className="flex gap-2">
                {stage.stageNumber > 1 && (
                  <Link href={`/admin/etappes/${stage.stageNumber - 1}`} className="flex-1 text-center py-2 rounded-lg text-xs font-condensed font-bold transition-all card-dark hover:border-yellow-400">
                    ← {stage.stageNumber - 1}
                  </Link>
                )}
                {stage.stageNumber < 21 && (
                  <Link href={`/admin/etappes/${stage.stageNumber + 1}`} className="flex-1 text-center py-2 rounded-lg text-xs font-condensed font-bold transition-all card-dark hover:border-yellow-400">
                    {stage.stageNumber + 1} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
