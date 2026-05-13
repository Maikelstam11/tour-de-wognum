import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stages } from '@/db/schema';
import { eq } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

interface Props {
  params: Promise<{ nummer: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { nummer } = await params;
  const num = parseInt(nummer, 10);
  if (isNaN(num)) return NextResponse.json({ error: 'Ongeldig nummer' }, { status: 400 });

  const [stage] = await db.select().from(stages).where(eq(stages.stageNumber, num));
  if (!stage) return NextResponse.json({ error: 'Etappe niet gevonden' }, { status: 404 });
  return NextResponse.json(stage);
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { nummer } = await params;
  const num = parseInt(nummer, 10);
  if (isNaN(num)) return NextResponse.json({ error: 'Ongeldig nummer' }, { status: 400 });

  const body = await req.json();
  const {
    startLocation, finishLocation, distanceKm, elevationMeters,
    type, description, expectedScenario, country,
    isSprintStage, isMountainStage,
  } = body;

  await db.update(stages).set({
    ...(startLocation !== undefined && { startLocation }),
    ...(finishLocation !== undefined && { finishLocation }),
    ...(distanceKm !== undefined && { distanceKm: Number(distanceKm) }),
    ...(elevationMeters !== undefined && { elevationMeters: Number(elevationMeters) }),
    ...(type !== undefined && { type }),
    ...(description !== undefined && { description }),
    ...(expectedScenario !== undefined && { expectedScenario }),
    ...(country !== undefined && { country }),
    ...(isSprintStage !== undefined && { isSprintStage: Boolean(isSprintStage) }),
    ...(isMountainStage !== undefined && { isMountainStage: Boolean(isMountainStage) }),
  }).where(eq(stages.stageNumber, num));

  return NextResponse.json({ message: 'Etappe opgeslagen' });
}
