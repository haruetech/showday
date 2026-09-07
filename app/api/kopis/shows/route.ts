import { NextRequest, NextResponse } from 'next/server';
import { getKopisShows } from '@/lib/kopis';

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const start = p.get('start') ? new Date(p.get('start')!) : undefined;
    const end = p.get('end') ? new Date(p.get('end')!) : undefined;
    const shows = await getKopisShows({
      start,
      end,
      page: Number(p.get('page') ?? 1),
      rows: Number(p.get('rows') ?? 20),
      genre: p.get('genre') || undefined,
      areaCode: p.get('area') || undefined,
      venue: p.get('venue') || undefined,
      performanceName: p.get('q') || undefined,
      state: p.get('state') || undefined,
    });
    return NextResponse.json({ source: 'KOPIS', count: shows.length, shows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'KOPIS error' }, { status: 500 });
  }
}
