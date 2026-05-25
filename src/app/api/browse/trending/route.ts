import { NextRequest, NextResponse } from 'next/server';
import { getTrending } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const timeWindow = req.nextUrl.searchParams.get('timeWindow') || 'week';
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const data = await getTrending(timeWindow, page);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch trending', message: error.message },
      { status: 500 }
    );
  }
}
