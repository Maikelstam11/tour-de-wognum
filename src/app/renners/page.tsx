import Link from 'next/link';
import { db } from '@/db';
import { riders, teams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TeamJersey } from '@/components/JerseyIcon';
import { specialityLabel, specialityIcon, nationalityFlag } from '@/lib/scoring';

export const revalidate = 60;

async function getData() {
  try {
    const allTeams = await db.select().from(teams).orderBy(teams.name);
    const allRiders = await db.select().from(riders).where(eq(riders.isActive, true)).orderBy(riders.name);
    return { teams: allTeams, riders: allRiders };
  } catch {
    return { teams: [], riders: [] };
  }
}

export default async function RennersPage() {
  const { teams: allTeams, riders: allRiders } = await getData();

  const ridersByTeam = allTeams.map(team => ({
    team,
    riders: allRiders.filter(r => r.teamId === team.id),
  }));

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tour-yellow-dark)' }}>
            Tour de France 2026
          </div>
          <h1 className="font-display text-5xl sm:text-7xl mb-4" style={{ color: 'var(--tour-text)' }}>Renners & Ploegen</h1>
          <p className="text-base sm:text-lg max-w-xl" style={{ color: 'var(--tour-text-muted)' }}>
            {allTeams.length} ploegen · {allRiders.length} renners — de beste wielrenners ter wereld
          </p>
        </div>
      </section>

      {/* Teams grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {allTeams.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--tour-text-muted)' }}>
              <div className="text-5xl mb-4">🚴</div>
              <p>Renners worden binnenkort geladen...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {ridersByTeam.map(({ team, riders: teamRiders }) => (
                <div key={team.id}>
                  {/* Team header */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl mb-4"
                    style={{ background: `linear-gradient(135deg, ${team.primaryColor}15, ${team.secondaryColor}10)`, border: `1px solid ${team.primaryColor}30` }}
                  >
                    <TeamJersey primaryColor={team.primaryColor} secondaryColor={team.secondaryColor} size={44} />
                    <div>
                      <h2 className="font-condensed font-bold text-xl" style={{ color: 'var(--tour-text)' }}>{team.name}</h2>
                      <div className="text-sm" style={{ color: 'var(--tour-text-muted)' }}>{team.country} · {teamRiders.length} renners</div>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <div className="w-5 h-5 rounded-sm" style={{ background: team.primaryColor }} />
                      <div className="w-5 h-5 rounded-sm" style={{ background: team.secondaryColor }} />
                    </div>
                  </div>

                  {/* Riders */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {teamRiders.map((rider) => (
                      <Link key={rider.id} href={`/renners/${rider.id}`}>
                        <div className="card-dark p-3 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-200">
                          <TeamJersey
                            primaryColor={team.primaryColor}
                            secondaryColor={team.secondaryColor}
                            size={40}
                            className="mb-2"
                          />
                          <div className="font-condensed font-bold text-xs leading-tight line-clamp-2 mb-1" style={{ color: 'var(--tour-text)' }}>
                            {rider.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--tour-text-muted)' }}>
                            {nationalityFlag[rider.nationality] ?? '🏳️'}
                          </div>
                          <div className="mt-1">
                            <span className={`badge badge-${rider.speciality}`} style={{ fontSize: '9px' }}>
                              {specialityIcon[rider.speciality]}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
