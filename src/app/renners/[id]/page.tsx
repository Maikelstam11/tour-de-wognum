import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import { riders, teams, participantRiders, participants, riderValues } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { TeamJersey } from '@/components/JerseyIcon';
import { specialityLabel, specialityIcon, nationalityFlag } from '@/lib/scoring';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  const [rider] = await db.select().from(riders).where(eq(riders.id, id));
  if (!rider) return null;

  const [team] = rider.teamId
    ? await db.select().from(teams).where(eq(teams.id, rider.teamId))
    : [null];

  const [value] = await db.select().from(riderValues).where(eq(riderValues.riderId, id));

  const [chosenCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(participantRiders)
    .where(eq(participantRiders.riderId, id));

  return { rider, team, value, timesChosen: Number(chosenCount?.count ?? 0) };
}

export default async function RiderDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { rider, team, value, timesChosen } = data;
  const flag = nationalityFlag[rider.nationality] ?? '🏳️';
  const specLabel = specialityLabel[rider.speciality] ?? rider.speciality;
  const specIcon = specialityIcon[rider.speciality] ?? '🚴';

  return (
    <div className="pt-20">
      {/* Header */}
      <section
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: team
            ? `linear-gradient(135deg, ${team.primaryColor}20 0%, ${team.secondaryColor}10 50%, transparent 100%)`
            : 'linear-gradient(135deg, rgba(26,25,51,0.8) 0%, transparent 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--tour-text-muted)' }}>
            <Link href="/renners" className="hover:text-white transition-colors">Renners</Link>
            <span>/</span>
            <span>{rider.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {team && (
              <TeamJersey
                primaryColor={team.primaryColor}
                secondaryColor={team.secondaryColor}
                size={120}
                className="flex-shrink-0"
              />
            )}
            <div>
              <div className="font-condensed text-sm font-bold uppercase tracking-widest mb-2" style={{ color: team?.primaryColor ?? 'var(--tour-yellow)' }}>
                {flag} {rider.nationality}
              </div>
              <h1 className="font-display text-5xl sm:text-6xl text-white leading-none mb-3">
                {rider.name}
              </h1>
              {team && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-sm" style={{ background: team.primaryColor }} />
                  <span className="font-condensed font-bold text-base" style={{ color: 'var(--tour-text-muted)' }}>
                    {team.name}
                  </span>
                </div>
              )}
              <span className={`badge badge-${rider.speciality} text-sm px-3 py-1`}>
                {specIcon} {specLabel}
              </span>
              {rider.bio && (
                <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--tour-text-muted)' }}>
                  {rider.bio}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="ml-auto hidden lg:flex flex-col gap-4">
              {value && (
                <div className="card-dark p-4 text-center min-w-[120px]">
                  <div className="font-display text-4xl" style={{ color: 'var(--tour-yellow)' }}>{value.value}</div>
                  <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--tour-text-muted)' }}>Waardecijfer</div>
                </div>
              )}
              <div className="card-dark p-4 text-center min-w-[120px]">
                <div className="font-display text-4xl text-white">{timesChosen}</div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--tour-text-muted)' }}>Keer gekozen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile stats */}
        <div className="flex gap-4 lg:hidden mb-8">
          {value && (
            <div className="card-dark p-4 text-center flex-1">
              <div className="font-display text-3xl" style={{ color: 'var(--tour-yellow)' }}>{value.value}</div>
              <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--tour-text-muted)' }}>Waardecijfer</div>
            </div>
          )}
          <div className="card-dark p-4 text-center flex-1">
            <div className="font-display text-3xl text-white">{timesChosen}</div>
            <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--tour-text-muted)' }}>Keer gekozen</div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/renners" className="card-dark px-4 py-2 text-sm font-condensed font-bold hover:border-yellow-400 transition-all">
            ← Alle renners
          </Link>
        </div>
      </div>
    </div>
  );
}
