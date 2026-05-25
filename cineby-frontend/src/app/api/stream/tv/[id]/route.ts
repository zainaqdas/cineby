import { NextRequest, NextResponse } from 'next/server';
import { getTvSources } from '@/lib/tmdb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const season = Number(req.nextUrl.searchParams.get('season')) || 1;
    const episode = Number(req.nextUrl.searchParams.get('episode')) || 1;
    const sources = getTvSources(Number(id), season, episode);
    const primary = sources[0];
    return NextResponse.json({
      tmdbId: id,
      type: 'tv',
      season,
      episode,
      streamUrl: primary.url,
      playerHtml: `<iframe src="${primary.url}" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>`,
      note: 'Powered by VidSrc',
      sources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate stream URL', message: error.message },
      { status: 500 }
    );
  }
}
