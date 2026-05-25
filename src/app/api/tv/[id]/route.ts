import { NextRequest, NextResponse } from 'next/server';
import { getTvShow } from '@/lib/tmdb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getTvShow(Number(id));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch TV show', message: error.message },
      { status: 500 }
    );
  }
}
