import { NextRequest, NextResponse } from 'next/server';

function isAdmin(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') === process.env.ADMIN_PASSWORD;
}

function parseRidersFromHtml(html: string): string[] {
  const riders: string[] = [];

  // Strategy 1: find the main results table block by looking for
  // the typical PCS results tbody structure
  const tableMatch = html.match(/class="[^"]*results[^"]*"[\s\S]*?<\/table>/i);
  const searchArea = tableMatch ? tableMatch[0] : html;

  // Extract rider links — PCS uses /rider/slug-name pattern
  const riderLinkPattern = /href="\/rider\/[^"]+">([^<]{3,50})<\/a>/g;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = riderLinkPattern.exec(searchArea)) !== null) {
    const name = match[1].trim();
    // Filter out obviously non-rider text
    if (
      name &&
      !seen.has(name) &&
      !name.includes('►') &&
      !name.includes('◄') &&
      !/^\d+$/.test(name) &&
      name.length > 3
    ) {
      seen.add(name);
      riders.push(name);
      if (riders.length >= 10) break;
    }
  }

  return riders;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { stageNumber, year = 2026 } = await req.json();
    if (!stageNumber) return NextResponse.json({ error: 'stageNumber vereist' }, { status: 400 });

    const url = `https://www.procyclingstats.com/race/tour-de-france/${year}/stage-${stageNumber}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl,en;q=0.9',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `PCS antwoordde met ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const riders = parseRidersFromHtml(html);

    if (riders.length === 0) {
      return NextResponse.json({
        error: 'Geen uitslag gevonden — de etappe is mogelijk nog niet gereden of PCS heeft de pagina gewijzigd.',
      }, { status: 404 });
    }

    return NextResponse.json({ riders, source: url });
  } catch (e) {
    console.error('import-results error:', e);
    return NextResponse.json({ error: 'Fout bij ophalen van PCS' }, { status: 500 });
  }
}
