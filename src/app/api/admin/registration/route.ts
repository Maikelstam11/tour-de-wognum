import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { open } = await req.json();
  await db
    .insert(settings)
    .values({ key: 'registration_open', value: String(open) })
    .onConflictDoUpdate({ target: settings.key, set: { value: String(open) } });
  return NextResponse.json({ message: `Inschrijving ${open ? 'geopend' : 'gesloten'}` });
}
