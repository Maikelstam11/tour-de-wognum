import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { participants, participantRiders, riders, riderValues } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { calculateRiderValue } from '@/lib/scoring';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(participants);
    const total = Number(count);

    const allRiders = await db.select({ id: riders.id }).from(riders);

    for (const rider of allRiders) {
      const [{ timesChosen }] = await db
        .select({ timesChosen: sql<number>`count(*)` })
        .from(participantRiders)
        .where(eq(participantRiders.riderId, rider.id));

      const chosen = Number(timesChosen);
      const value = calculateRiderValue(total, chosen);

      await db
        .insert(riderValues)
        .values({ riderId: rider.id, value, timesChosen: chosen })
        .onConflictDoUpdate({
          target: riderValues.riderId,
          set: { value, timesChosen: chosen },
        });
    }

    return NextResponse.json({ message: `Waardecijfers berekend voor ${allRiders.length} renners (${total} deelnemers)` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Fout bij berekening' }, { status: 500 });
  }
}
