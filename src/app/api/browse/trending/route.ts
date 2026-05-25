import { NextRequest, NextResponse } from 'next/server';
import { getTrending } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const timeWindow = req.nextUrl.searchParams.get('timeWindow') || 'week';
    const data = await getTrending(timeWindow);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch trending', message: error.message },
      { status: 500 }
    );
  }
}
