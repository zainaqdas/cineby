'use client';

import { useState, useEffect, useRef } from 'react';
import { getTvSeasonDetails } from '@/lib/api';

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
}

interface Episode {
  id: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  episode_number: number;
  season_number: number;
  vote_average?: number;
  runtime?: number;
}

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: number;
  selectedEpisode: number;
  onSelectSeason: (season: number) => void;
  onSelectEpisode: (episode: number) => void;
  tvId: number;
}

export default function SeasonSelector({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSelectSeason,
  onSelectEpisode,
  tvId,
}: SeasonSelectorProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const cacheRef = useRef<Record<number, Episode[]>>({});
  const abortRef = useRef<AbortController | null>(null);

  function makePlaceholders(seasonNum: number): Episode[] {
    const season = seasons.find((s) => s.season_number === seasonNum);
    if (!season) return [];
    return Array.from({ length: season.episode_count }, (_, i) => ({
      id: 0,
      name: `Episode ${i + 1}`,
      episode_number: i + 1,
      season_number: seasonNum,
    }));
  }

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Check cache FIRST
    if (cacheRef.current[selectedSeason]) {
      setEpisodes(cacheRef.current[selectedSeason]);
      return;
    }

    // Show placeholders instantly
    setEpisodes(makePlaceholders(selectedSeason));

    // Fetch real episodes in background
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);

    getTvSeasonDetails(tvId, selectedSeason, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && data.episodes?.length) {
          cacheRef.current[selectedSeason] = data.episodes;
          setEpisodes(data.episodes);
        }
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [selectedSeason, seasons, tvId]);

  const sortedSeasons = [...seasons].sort(
    (a, b) => a.season_number - b.season_number
  );

  return (
    <div className="space-y-3">
      {/* Season Dropdown */}
      <div className="relative">
        <select
          value={selectedSeason}
          onChange={(e) => onSelectSeason(Number(e.target.value))}
          className="w-full appearance-none px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm text-white
            focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
            cursor-pointer transition-all"
        >
          {sortedSeasons.map((season) => (
            <option key={season.id} value={season.season_number}>
              {season.name} ({season.episode_count} episodes)
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Episode Count */}
      {episodes.length > 0 && (
        <p className="text-xs text-white/40">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</p>
      )}

      {/* Episode List */}
      <div className="grid gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {episodes.map((episode) => (
          <button
            key={episode.episode_number}
            onClick={() => onSelectEpisode(episode.episode_number)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              selectedEpisode === episode.episode_number
                ? 'bg-emerald-600/15 border border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06] hover:border-white/5'
            }`}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
              <span
                className={`text-sm font-bold ${
                  selectedEpisode === episode.episode_number
                    ? 'text-emerald-400'
                    : 'text-white/30'
                }`}
              >
                {episode.episode_number}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium truncate ${
                  selectedEpisode === episode.episode_number
                    ? 'text-emerald-200'
                    : 'text-white/70'
                }`}
              >
                {episode.name}
              </p>
              {episode.overview && (
                <p className="text-xs text-white/30 line-clamp-1 mt-0.5">{episode.overview}</p>
              )}
            </div>
            {episode.vote_average && episode.vote_average > 0 && (
              <span className="text-[11px] text-yellow-400/80 flex-shrink-0">
                ★ {episode.vote_average.toFixed(1)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
