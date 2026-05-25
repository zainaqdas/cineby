import { NextRequest, NextResponse } from 'next/server';
import { getPopularMovies } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const data = await getPopularMovies(page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch movies', message: error.message },
      { status: 500 }
    );
  }
}
