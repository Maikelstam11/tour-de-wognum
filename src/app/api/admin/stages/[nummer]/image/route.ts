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

export async function DELETE(req: NextRequest, { params }: Props) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { nummer } = await params;
  const num = parseInt(nummer, 10);
  if (isNaN(num)) return NextResponse.json({ error: 'Ongeldig nummer' }, { status: 400 });

  const { type } = await req.json();
  if (!type || !['profile', 'route'].includes(type)) {
    return NextResponse.json({ error: 'type moet "profile" of "route" zijn' }, { status: 400 });
  }

  const [stage] = await db.select().from(stages).where(eq(stages.stageNumber, num));
  if (!stage) return NextResponse.json({ error: 'Etappe niet gevonden' }, { status: 404 });

  // Delete from Vercel Blob if configured
  const urlToDelete = type === 'profile' ? stage.profileImageUrl : stage.routeImageUrl;
  if (urlToDelete && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { del } = await import('@vercel/blob');
      await del(urlToDelete);
    } catch { /* ignore blob delete errors */ }
  }

  const urlField = type === 'profile' ? { profileImageUrl: null } : { routeImageUrl: null };
  await db.update(stages).set(urlField).where(eq(stages.stageNumber, num));

  return NextResponse.json({ message: 'Afbeelding verwijderd' });
}
