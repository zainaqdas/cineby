import { NextRequest, NextResponse } from 'next/server';
import { getMovieSources } from '@/lib/tmdb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sources = getMovieSources(Number(id));
    const primary = sources[0];
    return NextResponse.json({
      tmdbId: id,
      type: 'movie',
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
