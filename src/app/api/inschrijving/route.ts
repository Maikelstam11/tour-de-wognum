import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { participants, participantRiders, participantGcPrediction, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, dateOfBirth, iban, riderIds, captainId, goldenStageId, gcPrediction } = body;

    // Validate
    if (!name || !email || !dateOfBirth || !iban) {
      return NextResponse.json({ error: 'Vul alle verplichte velden in' }, { status: 400 });
    }
    if (!riderIds || riderIds.length !== 20) {
      return NextResponse.json({ error: 'Kies precies 20 renners' }, { status: 400 });
    }
    if (!captainId || !riderIds.includes(captainId)) {
      return NextResponse.json({ error: 'Kies een geldige kopman' }, { status: 400 });
    }
    if (!goldenStageId) {
      return NextResponse.json({ error: 'Kies een gouden etappe' }, { status: 400 });
    }
    if (!gcPrediction || gcPrediction.length !== 5) {
      return NextResponse.json({ error: 'Voorspel precies 5 renners voor het eindklassement' }, { status: 400 });
    }

    // Check if registration is open
    const [openSetting] = await db.select().from(settings).where(eq(settings.key, 'registration_open'));
    if (openSetting?.value === 'false') {
      return NextResponse.json({ error: 'Inschrijving is gesloten' }, { status: 403 });
    }

    // Create participant
    const [participant] = await db
      .insert(participants)
      .values({ name, email, dateOfBirth, iban, goldenStageId })
      .returning();

    // Add riders
    await db.insert(participantRiders).values(
      riderIds.map((riderId: string) => ({
        participantId: participant.id,
        riderId,
        isCaptain: riderId === captainId,
      }))
    );

    // GC prediction
    await db.insert(participantGcPrediction).values(
      gcPrediction.map(({ riderId, position }: { riderId: string; position: number }) => ({
        participantId: participant.id,
        riderId,
        predictedPosition: position,
      }))
    );

    return NextResponse.json({ success: true, participantId: participant.id });
  } catch (e: any) {
    if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Dit e-mailadres is al ingeschreven' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 });
  }
}
