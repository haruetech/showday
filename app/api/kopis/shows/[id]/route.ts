import { NextResponse } from 'next/server';
import { getKopisShowDetail } from '@/lib/kopis';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getKopisShowDetail(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'KOPIS error' }, { status: 500 });
  }
}
