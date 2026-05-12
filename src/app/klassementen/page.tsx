import KlassementenClient from './KlassementenClient';
import { db } from '@/db';
import { participants, participantRiders, riders, stageResults, stages, riderValues, participantGcPrediction, actualGcTop5 } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateStagePoints, calculateGcBonus } from '@/lib/scoring';

export const revalidate = 60;

async function computeStandings() {
  try {
    // Get all data
    const [allParticipants, allPRiders, allResults, allStages, allValues, allGcPreds, actualGc] = await Promise.all([
      db.select().from(participants),
      db.select().from(participantRiders),
      db.select({
        stageId: stageResults.stageId,
        riderId: stageResults.riderId,
        position: stageResults.position,
        stageNumber: stages.stageNumber,
        isSprintStage: stages.isSprintStage,
        isMountainStage: stages.isMountainStage,
      })
        .from(stageResults)
        .innerJoin(stages, eq(stageResults.stageId, stages.id))
        .where(eq(stages.status, 'completed')),
      db.select().from(stages).orderBy(stages.stageNumber),
      db.select().from(riderValues),
      db.select().from(participantGcPrediction),
      db.select().from(actualGcTop5),
    ]);

    const valueMap = new Map(allValues.map(v => [v.riderId, v.value]));
    const actualGcMap = new Map(actualGc.map(g => [g.riderId, g.position]));

    // Compute per-participant scores
    const standings = allParticipants.map(p => {
      const myRiders = allPRiders.filter(pr => pr.participantId === p.id);
      const captainId = myRiders.find(pr => pr.isCaptain)?.riderId;
      const goldenStageId = p.goldenStageId;

      let totalPts = 0;
      let sprintPts = 0;
      let mountainPts = 0;
      const stagePointsMap: Record<string, number> = {};

      for (const result of allResults) {
        const myRider = myRiders.find(pr => pr.riderId === result.riderId);
        if (!myRider) continue;

        const value = valueMap.get(result.riderId) ?? 1;
        const isCaptain = result.riderId === captainId;
        const isGolden = result.stageId === goldenStageId;
        const pts = calculateStagePoints(result.position, value, isCaptain, isGolden);

        totalPts += pts;
        stagePointsMap[result.stageId] = (stagePointsMap[result.stageId] ?? 0) + pts;
        if (result.isSprintStage) sprintPts += pts;
        if (result.isMountainStage) mountainPts += pts;
      }

      // GC bonus
      const gcPreds = allGcPreds.filter(g => g.participantId === p.id);
      let gcBonus = 0;
      for (const pred of gcPreds) {
        const actual = actualGcMap.get(pred.riderId) ?? null;
        gcBonus += calculateGcBonus(pred.predictedPosition, actual);
      }
      totalPts += gcBonus;

      const birthYear = p.dateOfBirth ? parseInt(p.dateOfBirth.split('-')[0]) : 0;
      const isYoung = birthYear >= 2002;

      const maxStagePoints = Object.values(stagePointsMap).length > 0
        ? Math.max(...Object.values(stagePointsMap))
        : 0;

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        totalPts,
        sprintPts,
        mountainPts,
        gcBonus,
        isYoung,
        birthYear,
        maxStagePoints,
        stagePointsMap,
        riderIds: myRiders.map(r => r.riderId),
        captainId,
        goldenStageId,
      };
    });

    // Sort for each jersey
    const general = [...standings].sort((a, b) => b.totalPts - a.totalPts);
    const sprint = [...standings].sort((a, b) => b.sprintPts - a.sprintPts);
    const mountain = [...standings].sort((a, b) => b.mountainPts - a.mountainPts);
    const young = standings.filter(s => s.isYoung).sort((a, b) => b.totalPts - a.totalPts);

    // Day winner — who has most points in any single stage
    const stageWinners: Record<string, { participantId: string; pts: number }> = {};
    for (const p of standings) {
      for (const [stageId, pts] of Object.entries(p.stagePointsMap)) {
        if (!stageWinners[stageId] || pts > stageWinners[stageId].pts) {
          stageWinners[stageId] = { participantId: p.id, pts };
        }
      }
    }
    const dayWinCounts = new Map<string, number>();
    for (const { participantId } of Object.values(stageWinners)) {
      dayWinCounts.set(participantId, (dayWinCounts.get(participantId) ?? 0) + 1);
    }
    const daily = [...standings].sort((a, b) => (dayWinCounts.get(b.id) ?? 0) - (dayWinCounts.get(a.id) ?? 0));

    const stagesData = allStages.filter(s => s.status === 'completed');

    return { general, sprint, mountain, young, daily, stagesData, totalParticipants: allParticipants.length };
  } catch (e) {
    console.error(e);
    return { general: [], sprint: [], mountain: [], young: [], daily: [], stagesData: [], totalParticipants: 0 };
  }
}

export default async function KlassementenPage() {
  const data = await computeStandings();
  return <KlassementenClient {...data} />;
}
