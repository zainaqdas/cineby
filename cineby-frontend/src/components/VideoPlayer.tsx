'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMovieStream, getTvStream } from '@/lib/api';
import { getImageUrl } from '@/lib/api';
import type { StreamSource } from '@/lib/types';

interface VideoPlayerProps {
  title: string;
  type: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  posterPath?: string | null;
}

export default function VideoPlayer({ title, type, tmdbId, season, episode, posterPath }: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Reset when media changes
  useEffect(() => {
    setShowPlayer(false);
    setStreamUrl(null);
    setSources([]);
    setSelectedSource('');
    setError(null);
  }, [tmdbId, season, episode]);

  const handlePlay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = type === 'movie'
        ? await getMovieStream(tmdbId)
        : await getTvStream(tmdbId, season || 1, episode || 1);
      setStreamUrl(res.streamUrl);
      setSources(res.sources || []);
      setSelectedSource(res.sources?.[0]?.name || 'VidSrc');
      setShowPlayer(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stream');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = useCallback((sourceName: string) => {
    const source = sources.find(s => s.name === sourceName);
    if (source) {
      setSelectedSource(source.name);
      setStreamUrl(source.url);
    }
  }, [sources]);

  if (showPlayer && streamUrl) {
    return (
      <div>
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
          <iframe
            key={streamUrl}
            src={streamUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title={title}
          />
        </div>
        {sources.length > 1 && (
          <div className="flex items-center gap-2 mt-2.5 px-1">
            <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Source</span>
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="appearance-none bg-white/5 hover:bg-white/10 text-white/70 text-xs py-1 pl-2.5 pr-7 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                {sources.map((s) => (
                  <option key={s.name} value={s.name} className="bg-zinc-900 text-white/70">
                    {s.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-[11px] text-white/20 ml-auto">
              {selectedSource}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 group">
      {/* Poster background */}
      {posterPath && (
        <img
          src={getImageUrl(posterPath, 'original')}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-400 mb-4 text-center max-w-md">{error}</p>
            <button
              onClick={handlePlay}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-all backdrop-blur-sm"
            >
              Try Again
            </button>
          </>
        ) : loading ? (
          <>
            <div className="w-12 h-12 border-3 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-white/40">Loading player...</p>
          </>
        ) : (
          <>
            <button
              onClick={handlePlay}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/25 mb-4"
            >
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <p className="text-sm text-white/60">
              {type === 'tv' ? `S${season} E${episode}` : ''} Click to play
            </p>
          </>
        )}
      </div>
    </div>
  );
}
