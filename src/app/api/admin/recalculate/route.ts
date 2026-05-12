import { NextRequest, NextResponse } from 'next/server';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Scores are computed dynamically in /klassementen, so a "recalculate" just confirms
  return NextResponse.json({ message: 'Punten worden dynamisch berekend — klassementen zijn up to date' });
}
