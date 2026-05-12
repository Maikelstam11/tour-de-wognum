import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { participants, participantRiders, riders, stages, participantGcPrediction } from '@/db/schema';
import { eq } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [allParticipants, allPRiders, allGcPreds, allStages] = await Promise.all([
      db.select().from(participants).orderBy(participants.createdAt),
      db.select({
        participantId: participantRiders.participantId,
        isCaptain: participantRiders.isCaptain,
        riderName: riders.name,
      }).from(participantRiders).innerJoin(riders, eq(participantRiders.riderId, riders.id)),
      db.select({
        participantId: participantGcPrediction.participantId,
        predictedPosition: participantGcPrediction.predictedPosition,
        riderName: riders.name,
      }).from(participantGcPrediction).innerJoin(riders, eq(participantGcPrediction.riderId, riders.id)),
      db.select({ id: stages.id, stageNumber: stages.stageNumber, startLocation: stages.startLocation, finishLocation: stages.finishLocation }).from(stages),
    ]);

    const stageMap = new Map(allStages.map(s => [s.id, s]));

    const result = allParticipants.map(p => {
      const myRiders = allPRiders
        .filter(r => r.participantId === p.id)
        .sort((a, b) => (b.isCaptain ? 1 : 0) - (a.isCaptain ? 1 : 0));
      const gcPreds = allGcPreds
        .filter(g => g.participantId === p.id)
        .sort((a, b) => a.predictedPosition - b.predictedPosition);
      const goldenStage = p.goldenStageId ? stageMap.get(p.goldenStageId) : null;

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        dateOfBirth: p.dateOfBirth,
        iban: p.iban,
        createdAt: p.createdAt,
        goldenStage: goldenStage
          ? `Etappe ${goldenStage.stageNumber}: ${goldenStage.startLocation} → ${goldenStage.finishLocation}`
          : null,
        riders: myRiders.map(r => ({ name: r.riderName, isCaptain: r.isCaptain })),
        gcPredictions: gcPreds.map(g => g.riderName),
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Fout bij ophalen' }, { status: 500 });
  }
}
