import JerseyIcon from '@/components/JerseyIcon';

const jerseyRules = [
  {
    type: 'yellow' as const,
    label: 'Gele Trui',
    color: '#FFD700',
    title: 'Algemeen Klassement',
    desc: 'Het cumulatief totaal van alle gescoorde punten gedurende de hele Tour. Wie de meeste punten scoort over alle 21 etappes wint de Gele Trui.',
  },
  {
    type: 'green' as const,
    label: 'Groene Trui',
    color: '#00A651',
    title: 'Sprintklassement',
    desc: 'Alleen punten gescoord op aangewezen sprint-etappes tellen mee. Heb je goede sprinters in je ploeg? Dan maak je kans op de Groene Trui.',
  },
  {
    type: 'polka' as const,
    label: 'Bolletjestrui',
    color: '#E2001A',
    title: 'Bergklassement',
    desc: 'Alleen punten gescoord op aangewezen bergetappes tellen mee. Met klimmers in je ploeg maak je kans op de Bolletjestrui.',
  },
  {
    type: 'white' as const,
    label: 'Witte Trui',
    color: '#E8E8E8',
    title: 'Jongerenklassement',
    desc: 'Het algemeen klassement, maar alleen voor deelnemers jonger dan 25 jaar (geboortejaar 2002 of later). Jong en ambitieus!',
  },
  {
    type: 'blue' as const,
    label: 'Blauwe Trui',
    color: '#0055A4',
    title: 'Dagwinnaar',
    desc: 'Per etappe: wie scoort de meeste poule-punten op die specifieke etappe? De deelnemer die het vaakst dagwinnaar is, wint de Blauwe Trui.',
  },
  {
    type: 'red_lantern' as const,
    label: 'Rode Lantaarn',
    color: '#CC0000',
    title: 'Laatste in het Klassement',
    desc: 'De deelnemer met de minste punten in het algemeen klassement draagt de Rode Lantaarn. Eervolle vermelding voor de volhouder!',
  },
];

const pointsTable = [
  { pos: 1, pts: 15, label: '1e plaats' },
  { pos: 2, pts: 12, label: '2e plaats' },
  { pos: 3, pts: 10, label: '3e plaats' },
  { pos: 4, pts: 8, label: '4e plaats' },
  { pos: 5, pts: 6, label: '5e plaats' },
  { pos: 6, pts: 5, label: '6e plaats' },
  { pos: 7, pts: 4, label: '7e plaats' },
  { pos: 8, pts: 3, label: '8e plaats' },
  { pos: 9, pts: 2, label: '9e plaats' },
  { pos: 10, pts: 1, label: '10e plaats' },
];

export default function SpelregelsPage() {
  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow-dark)' }}>
            Tour de Wognum 2026
          </div>
          <h1 className="font-display text-5xl sm:text-7xl mb-4" style={{ color: 'var(--tour-text)' }}>Spelregels</h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--tour-text-muted)' }}>
            Alles wat je moet weten om mee te doen — en om te winnen.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
        {/* Basic setup */}
        <section>
          <h2 className="font-display text-4xl mb-6" style={{ color: 'var(--tour-text)' }}>Het Spel</h2>
          <div className="card-dark p-6 space-y-4">
            {[
              { icon: '🚴', text: 'Kies eenmalig 20 renners uit het complete deelnemersveld (184 renners).' },
              { icon: '⭐', text: 'Wijs 1 kopman aan uit je 20 renners. De kopman scoort dubbele punten.' },
              { icon: '🏆', text: 'Kies 1 gouden etappe. Alle punten die etappe worden verdubbeld.' },
              { icon: '🔮', text: 'Voorspel de top 5 eindklassement voor bonuspunten.' },
              { icon: '💶', text: 'Inleg: €10 per deelnemer. De winnaar pakt alles.' },
              { icon: '🔒', text: 'Na sluiting van de inschrijving kun je je keuzes niet meer wijzigen.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-3" style={{ borderBottom: '1px solid var(--tour-border)' }}>
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--tour-text)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Points table */}
        <section>
          <h2 className="font-display text-4xl mb-2" style={{ color: 'var(--tour-text)' }}>Puntentelling</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
            Per etappe worden de top 10 gefinishte renners beloond. De score per renner = positiepunten × waardecijfer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Points per position */}
            <div className="card-dark overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'var(--tour-border)' }}>
                <div className="font-condensed font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--tour-yellow)' }}>
                  Punten per positie
                </div>
              </div>
              {pointsTable.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 standings-row"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center font-display text-sm"
                      style={{
                        background: i === 0 ? 'rgba(232,184,0,0.15)' : i === 1 ? 'rgba(160,160,160,0.15)' : i === 2 ? 'rgba(150,90,30,0.12)' : 'rgba(0,0,0,0.04)',
                        color: i === 0 ? '#C9A000' : i === 1 ? '#888' : i === 2 ? '#8B5E1A' : 'var(--tour-text-muted)',
                      }}
                    >
                      {row.pos}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--tour-text)' }}>{row.label}</span>
                  </div>
                  <span className="font-display text-xl" style={{ color: 'var(--tour-yellow)' }}>{row.pts}</span>
                </div>
              ))}
            </div>

            {/* Modifiers */}
            <div className="space-y-4">
              <div className="card-dark p-5">
                <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
                  Vermenigvuldigers
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-display" style={{ color: 'var(--tour-yellow)' }}>×2</div>
                    <div className="font-condensed font-bold text-sm" style={{ color: 'var(--tour-text)' }}>Kopman bonus</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--tour-text-muted)' }}>
                      Alle punten van jouw kopman worden verdubbeld. Kies verstandig!
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--tour-border)', paddingTop: '16px' }}>
                    <div className="text-2xl font-display" style={{ color: 'var(--tour-yellow)' }}>×2</div>
                    <div className="font-condensed font-bold text-sm" style={{ color: 'var(--tour-text)' }}>Gouden Etappe</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--tour-text-muted)' }}>
                      Alle punten die jij scoort op je gouden etappe worden verdubbeld.
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--tour-border)', paddingTop: '16px' }}>
                    <div className="text-2xl font-display" style={{ color: 'var(--tour-yellow)' }}>×4</div>
                    <div className="font-condensed font-bold text-sm" style={{ color: 'var(--tour-text)' }}>Kopman op Gouden Etappe</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--tour-text-muted)' }}>
                      Als je kopman scoort op jouw gouden etappe, ×2 ×2 = ×4!
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-dark p-5">
                <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--tour-yellow)' }}>
                  Uitvaller
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--tour-text-muted)' }}>
                  Als een renner uitvalt, blijven eerder behaalde punten staan. Er is geen vervanging mogelijk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Waardecijfer */}
        <section>
          <h2 className="font-display text-4xl mb-2" style={{ color: 'var(--tour-text)' }}>Het Waardecijfer</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
            Het waardecijfer is de sleutel tot een goede strategie. Populaire renners zijn minder waard!
          </p>
          <div className="card-dark p-6">
            <div className="font-condensed font-bold text-xl mb-4" style={{ color: 'var(--tour-text)' }}>
              Waardecijfer = Totaal deelnemers − Aantal keer gekozen
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--tour-text-muted)' }}>
              Als er 50 deelnemers zijn en Jonas Vingegaard is 40 keer gekozen, dan is zijn waardecijfer 50 − 40 = <strong className="text-white">10</strong>.
              Kies je een onbekende klimmer die maar 5 keer gekozen is, dan is zijn waardecijfer 50 − 5 = <strong className="text-white">45</strong>. Als die etappe wint
              in de bergen, levert dat 15 × 45 = <strong style={{ color: 'var(--tour-yellow)' }}>675 punten</strong> op!
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Top favoriet', chosen: 45, total: 50, pts: 15, result: 75 },
                { name: 'Middenmoter', chosen: 25, total: 50, pts: 15, result: 375 },
                { name: 'Outsider', chosen: 5, total: 50, pts: 15, result: 675 },
              ].map((ex, i) => (
                <div key={i} className="rounded-lg p-4 text-center" style={{ background: 'var(--tour-bg-card2)', border: '1px solid var(--tour-border)' }}>
                  <div className="font-condensed font-bold text-sm mb-2" style={{ color: 'var(--tour-text)' }}>{ex.name}</div>
                  <div className="text-xs mb-1" style={{ color: 'var(--tour-text-muted)' }}>{ex.chosen}× gekozen</div>
                  <div className="font-display text-2xl" style={{ color: 'var(--tour-yellow)' }}>{ex.result}</div>
                  <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>punten bij etappewinst</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GC prediction */}
        <section>
          <h2 className="font-display text-4xl mb-2" style={{ color: 'var(--tour-text)' }}>Top 5 Voorspelling</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
            Voorspel de top 5 eindklassement. Je kunt kiezen uit alle 184 deelnemende renners.
          </p>
          <div className="card-dark p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--tour-yellow)' }}>Bonuspunten</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--tour-border)' }}>
                    <span className="text-sm">Exacte positie goed</span>
                    <span className="font-display text-2xl" style={{ color: 'var(--tour-yellow)' }}>+20</span>
                  </div>
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--tour-border)' }}>
                    <span className="text-sm">Renner in top 5, verkeerde positie</span>
                    <span className="font-display text-2xl" style={{ color: 'var(--tour-yellow)' }}>+10</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Renner niet in top 5</span>
                    <span className="font-display text-2xl text-gray-500">+0</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-condensed font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--tour-yellow)' }}>Maximum bonus</div>
                <div className="text-center py-4">
                  <div className="font-display text-6xl" style={{ color: 'var(--tour-yellow)' }}>100</div>
                  <div className="text-sm mt-2" style={{ color: 'var(--tour-text-muted)' }}>punten bij perfecte voorspelling</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Six jerseys */}
        <section>
          <h2 className="font-display text-4xl mb-2" style={{ color: 'var(--tour-text)' }}>De Zes Truien</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
            Er zijn zes klassementen — elk met zijn eigen trui en zijn eigen strategie.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jerseyRules.map((jersey) => (
              <div
                key={jersey.type}
                className="card-dark p-5 flex gap-4"
                style={{ borderLeftColor: jersey.color, borderLeftWidth: '3px' }}
              >
                <JerseyIcon type={jersey.type} size={52} className="flex-shrink-0" />
                <div>
                  <div className="font-condensed font-bold text-base mb-0.5" style={{ color: 'var(--tour-text)' }}>{jersey.label}</div>
                  <div className="text-xs font-bold mb-2" style={{ color: jersey.color }}>{jersey.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--tour-text-muted)' }}>{jersey.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="font-display text-4xl mb-4" style={{ color: 'var(--tour-text)' }}>Alles duidelijk?</h2>
          <a
            href="/meedoen"
            className="inline-block px-10 py-4 rounded-xl font-condensed font-bold text-xl text-black transition-all duration-200 hover:scale-105"
            style={{ background: 'var(--tour-yellow)' }}
          >
            🚴 Schrijf je nu in!
          </a>
        </section>
      </div>
    </div>
  );
}
