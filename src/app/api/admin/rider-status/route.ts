import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { riders } from '@/db/schema';
import { eq } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { riderId, isActive } = await req.json();
  await db.update(riders).set({ isActive }).where(eq(riders.id, riderId));
  return NextResponse.json({ message: 'Status bijgewerkt' });
}
