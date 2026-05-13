import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stages } from '@/db/schema';
import { eq } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface Props {
  params: Promise<{ nummer: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { nummer } = await params;
  const num = parseInt(nummer, 10);
  if (isNaN(num)) return NextResponse.json({ error: 'Ongeldig nummer' }, { status: 400 });

  // Check if Vercel Blob is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      error: 'BLOB_READ_WRITE_TOKEN is niet ingesteld. Voeg deze toe in Vercel → Settings → Environment Variables.',
    }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string | null;

  if (!file) return NextResponse.json({ error: 'Geen bestand' }, { status: 400 });
  if (!type || !['profile', 'route'].includes(type)) {
    return NextResponse.json({ error: 'type moet "profile" of "route" zijn' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Alleen JPG, PNG, WEBP en GIF zijn toegestaan' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Bestand mag maximaal 5 MB zijn' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `stages/stage-${num}-${type}.${ext}`;

  // Dynamic import to avoid build errors when BLOB token is missing
  const { put } = await import('@vercel/blob');
  const blob = await put(filename, file, { access: 'public', allowOverwrite: true });

  const urlField = type === 'profile' ? { profileImageUrl: blob.url } : { routeImageUrl: blob.url };
  await db.update(stages).set(urlField).where(eq(stages.stageNumber, num));

  return NextResponse.json({ url: blob.url, message: 'Afbeelding geüpload' });
}
