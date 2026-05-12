import InschrijfWizard from './InschrijfWizard';
import { db } from '@/db';
import { riders, teams, stages, settings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const revalidate = 0;

async function getData() {
  try {
    const [allRiders, allTeams, allStages, openSetting] = await Promise.all([
      db.select().from(riders).where(eq(riders.isActive, true)).orderBy(riders.name),
      db.select().from(teams).orderBy(teams.name),
      db.select().from(stages).orderBy(stages.stageNumber),
      db.select().from(settings).where(eq(settings.key, 'registration_open')),
    ]);
    const isOpen = openSetting[0]?.value !== 'false';
    return { riders: allRiders, teams: allTeams, stages: allStages, isOpen };
  } catch {
    return { riders: [], teams: [], stages: [], isOpen: true };
  }
}

export default async function MeedoenPage() {
  const { riders: allRiders, teams: allTeams, stages: allStages, isOpen } = await getData();

  const ridersWithTeam = allRiders.map(r => ({
    ...r,
    team: allTeams.find(t => t.id === r.teamId) ?? null,
  }));

  if (!isOpen) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="font-display text-4xl text-white mb-4">Inschrijving Gesloten</h1>
          <p className="text-base" style={{ color: 'var(--tour-text-muted)' }}>
            De inschrijving voor de Tour de Wognum 2026 is gesloten.
            Kijk op de klassementenpagina voor de standen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <InschrijfWizard riders={ridersWithTeam} stages={allStages} />
    </div>
  );
}
