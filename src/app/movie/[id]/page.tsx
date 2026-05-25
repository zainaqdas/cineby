'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMovieDetails, getImageUrl, formatRating, formatRuntime, formatDate } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';
import MediaGrid from '@/components/MediaGrid';
import CastCard from '@/components/CastCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';

export default function MoviePage() {
  const params = useParams();
  const id = Number(params.id);
  const [movie, setMovie] = useState<MediaItem | null>(null);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const movieRes = await getMovieDetails(id);
        setMovie(movieRes);
        setRecommendations(movieRes.recommendations?.filter(Boolean) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading movie..." /></div>;
  if (error || !movie) return <div className="min-h-screen flex items-center justify-center"><ErrorState message={error || 'Movie not found'} /></div>;

  const title = movie.title || '';
  const backdrop = movie.backdrop_path ? getImageUrl(movie.backdrop_path, 'original') : null;
  const poster = movie.poster_path ? getImageUrl(movie.poster_path, 'w500') : null;
  const trailer = movie.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');

  return (
    <div className="min-h-screen">
      {/* ===== Backdrop ===== */}
      <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        {!backdrop && <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">

        {/* ===== Section: Movie Info (Poster + Details) ===== */}
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
              <span className="px-2.5 py-1 bg-emerald-600/80 rounded-md text-xs font-semibold uppercase tracking-wider">Movie</span>
              {movie.vote_average && movie.vote_average > 0 && (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z\" />
                  </svg>
                  {formatRating(movie.vote_average)}
                </span>
              )}
              {movie.release_date && <span className="text-sm text-white/60">{formatDate(movie.release_date)}</span>}
              {movie.runtime && movie.runtime > 0 && <span className="text-sm text-white/60">{formatRuntime(movie.runtime)}</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
            {movie.tagline && <p className="text-sm text-white/40 italic mb-4">&ldquo;{movie.tagline}&rdquo;</p>}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">{g.name}</span>
                ))}
              </div>
            )}
            <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
              {movie.overview || 'No overview available.'}
            </p>
          </div>
        </section>

        {/* ===== Divider ===== */}
        <div className="h-px bg-white/5 mb-10" />

        {/* ===== Section: Player ===== */}
        <section className="mb-12 max-w-4xl">
          <div className="rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/40">
            <VideoPlayer title={title} type="movie" tmdbId={id} posterPath={movie.backdrop_path} />
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
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <>
            <section className="mb-12">
              <h2 className="text-xl font-bold text-white mb-6">Cast</h2>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4">
                {movie.credits.cast.slice(0, 15).map((member) => (
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
