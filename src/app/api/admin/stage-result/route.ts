import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stageResults, riders, stages } from '@/db/schema';
import { eq, ilike } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  return auth?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { stageId, results } = await req.json();
    if (!stageId || !results?.length) {
      return NextResponse.json({ error: 'Ongeldige data' }, { status: 400 });
    }

    // Delete existing results for this stage
    await db.delete(stageResults).where(eq(stageResults.stageId, stageId));

    // Find riders by name and insert results
    const insertData = [];
    for (const r of results) {
      const [rider] = await db
        .select()
        .from(riders)
        .where(ilike(riders.name, `%${r.riderName}%`))
        .limit(1);

      if (rider) {
        insertData.push({
          stageId,
          riderId: rider.id,
          position: r.position,
          timeGap: r.timeGap ?? null,
        });
      }
    }

    if (insertData.length > 0) {
      await db.insert(stageResults).values(insertData);
    }

    // Mark stage as completed
    await db.update(stages).set({ status: 'completed' }).where(eq(stages.id, stageId));

    return NextResponse.json({ message: `${insertData.length} resultaten opgeslagen` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Fout bij opslaan' }, { status: 500 });
  }
}
