import { NextRequest, NextResponse } from 'next/server';
import { getDiscoverByGenre } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const type = (req.nextUrl.searchParams.get('type') || 'movie') as 'movie' | 'tv';
    const genre = req.nextUrl.searchParams.get('genre') || '';
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;

    if (!genre) {
      return NextResponse.json(
        { error: 'Genre parameter is required' },
        { status: 400 }
      );
    }

    const data = await getDiscoverByGenre(type, genre, page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch by genre', message: error.message },
      { status: 500 }
    );
  }
}
