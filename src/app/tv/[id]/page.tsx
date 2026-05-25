'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTvDetails, getImageUrl, formatRating, formatDate } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';
import MediaGrid from '@/components/MediaGrid';
import CastCard from '@/components/CastCard';
import SeasonSelector from '@/components/SeasonSelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';

export default function TvPage() {
  const params = useParams();
  const id = Number(params.id);
  const [show, setShow] = useState<MediaItem | null>(null);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const showRes = await getTvDetails(id);
        setShow(showRes);
        setRecommendations(showRes.recommendations?.filter(Boolean) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load TV show');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading TV show..." /></div>;
  if (error || !show) return <div className="min-h-screen flex items-center justify-center"><ErrorState message={error || 'Show not found'} /></div>;

  const title = show.name || '';
  const backdrop = show.backdrop_path ? getImageUrl(show.backdrop_path, 'original') : null;
  const poster = show.poster_path ? getImageUrl(show.poster_path, 'w500') : null;
  const trailer = show.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
  const seasons = (show.seasons || []).filter((s: any) => s.season_number > 0);
  const currentSeason = seasons.find((s: any) => s.season_number === selectedSeason);
  const episodesCount = currentSeason?.episode_count || 0;

  return (
    <div className="min-h-screen">
      {/* ===== Backdrop ===== */}
      <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden">
        {backdrop && <img src={backdrop} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        {!backdrop && <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">

        {/* ===== Section: Show Info (Poster + Details) ===== */}
        <section className="flex flex-col sm:flex-row gap-6 mb-12">
          {/* Poster */}
          <div className="flex-shrink-0 w-36 sm:w-44 mx-auto sm:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-zinc-800">
              {poster ? (
                <img src={poster} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-10">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <span className="px-2.5 py-1 bg-emerald-600/80 rounded-md text-xs font-semibold uppercase tracking-wider">TV Series</span>
              {show.vote_average && show.vote_average > 0 && (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {formatRating(show.vote_average)}
                </span>
              )}
              {show.first_air_date && <span className="text-sm text-white/60">{formatDate(show.first_air_date)}</span>}
              {show.numberOfSeasons && <span className="text-sm text-white/60">{show.numberOfSeasons} Season{show.numberOfSeasons !== 1 ? 's' : ''}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
            {show.tagline && <p className="text-sm text-white/40 italic mb-4">&ldquo;{show.tagline}&rdquo;</p>}

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.genres.map((g: any) => (
                  <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">{g.name}</span>
                ))}
              </div>
            )}

            <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
              {show.overview || 'No overview available.'}
            </p>
          </div>
        </section>

        {/* ===== Divider ===== */}
        <div className="h-px bg-white/5 mb-10" />

        {/* ===== Section: Player + Episode List (side by side) ===== */}
        <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-12">
          {/* Player */}
          <div className="flex-[2] min-w-0">
            <div className="rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/40">
              <VideoPlayer
                title={title}
                type="tv"
                tmdbId={id}
                season={selectedSeason}
                episode={selectedEpisode}
                posterPath={show.backdrop_path}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-white/40">
                Now Playing: <span className="text-white/70">{title}</span>
                <span className="ml-2 text-emerald-400">S{selectedSeason} E{selectedEpisode}</span>
              </p>
              {episodesCount > 0 && (
                <p className="text-xs text-white/30">{episodesCount} episode{episodesCount !== 1 ? 's' : ''} in S{selectedSeason}</p>
              )}
            </div>
          </div>

          {/* Episode List */}
          <div className="flex-1 lg:max-w-sm">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                Episodes
              </h3>
              {seasons.length > 0 && (
                <SeasonSelector
                  seasons={seasons}
                  selectedSeason={selectedSeason}
                  selectedEpisode={selectedEpisode}
                  onSelectSeason={(s) => { setSelectedSeason(s); setSelectedEpisode(1); }}
                  onSelectEpisode={setSelectedEpisode}
                  tvId={id}
                />
              )}
            </div>
          </div>
        </section>

        {/* ===== Divider ===== */}
        <div className="h-px bg-white/5 mb-10" />

        {/* ===== Section: Trailer ===== */}
        {trailer && (
          <>
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 8.64L15.27 12 10 15.36V8.64zM8 5v14l11-7L8 5z" />
                </svg>
                Trailer
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 max-w-3xl shadow-xl shadow-black/30">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={trailer.name}
                />
              </div>
            </section>
            <div className="h-px bg-white/5 mb-10" />
          </>
        )}

        {/* ===== Section: Cast ===== */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <>
            <section className="mb-12">
              <h2 className="text-xl font-bold text-white mb-6">Cast</h2>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 ">
                {show.credits.cast.slice(0, 15).map((member: any) => (
                  <CastCard key={member.id} member={member} />
                ))}
              </div>
            </section>
            <div className="h-px bg-white/5 mb-10" />
          </>
        )}

        {/* ===== Section: Recommendations ===== */}
        {recommendations.length > 0 && (
          <section>
            <MediaGrid items={recommendations.slice(0, 12)} title="You Might Also Like" />
          </section>
        )}
      </div>
    </div>
  );
}
