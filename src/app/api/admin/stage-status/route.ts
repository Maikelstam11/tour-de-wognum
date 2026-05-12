import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stages } from '@/db/schema';
import { eq } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { stageId, status } = await req.json();
  await db.update(stages).set({ status }).where(eq(stages.id, stageId));
  return NextResponse.json({ message: 'Status bijgewerkt' });
}
