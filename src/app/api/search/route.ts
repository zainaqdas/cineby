import { NextRequest, NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('query') || '';
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    if (!query.trim()) {
      return NextResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
    }
    const data = await searchMulti(query, page);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}
