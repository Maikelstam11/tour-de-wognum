import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { riders, dnfRiders } from '@/db/schema';
import { ilike } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { riderName, stageId } = await req.json();
  const [rider] = await db.select().from(riders).where(ilike(riders.name, `%${riderName}%`)).limit(1);
  if (!rider) return NextResponse.json({ error: 'Renner niet gevonden' }, { status: 404 });

  await db.insert(dnfRiders).values({ riderId: rider.id, stageId }).onConflictDoNothing();
  return NextResponse.json({ message: `${rider.name} gemarkeerd als DNF` });
}
