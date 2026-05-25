import { NextRequest, NextResponse } from 'next/server';
import { getSeason } from '@/lib/tmdb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  try {
    const { id, season } = await params;
    const data = await getSeason(Number(id), Number(season));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch season', message: error.message },
      { status: 500 }
    );
  }
}
