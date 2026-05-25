import { NextRequest, NextResponse } from 'next/server';
import { getMovie } from '@/lib/tmdb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getMovie(Number(id));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch movie', message: error.message },
      { status: 500 }
    );
  }
}
