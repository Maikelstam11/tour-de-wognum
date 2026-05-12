import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { riders, actualGcTop5 } from '@/db/schema';
import { ilike } from 'drizzle-orm';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { top5 } = await req.json();
    await db.delete(actualGcTop5);

    for (let i = 0; i < top5.length; i++) {
      const [rider] = await db.select().from(riders).where(ilike(riders.name, `%${top5[i]}%`)).limit(1);
      if (rider) {
        await db.insert(actualGcTop5).values({ riderId: rider.id, position: i + 1 });
      }
    }

    return NextResponse.json({ message: 'Eindklassement opgeslagen' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Fout' }, { status: 500 });
  }
}
