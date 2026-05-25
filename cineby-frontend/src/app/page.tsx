'use client';

import { useEffect, useState } from 'react';
import { browseTrending, browseMovies, browseTv } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import HeroSlider from '@/components/HeroSlider';
import MediaGrid from '@/components/MediaGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function Home() {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [trendingRes, moviesRes, tvRes] = await Promise.all([
          browseTrending(),
          browseMovies(),
          browseTv(),
        ]);
        setTrending(trendingRes.results || []);
        setMovies(moviesRes.results || []);
        setTvShows(tvRes.results || []);
      } catch (e) {
        console.error('Failed to load home page:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSlider items={trending} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Trending */}
        <section className="animate-fade-in">
          <MediaGrid items={trending.slice(0, 12)} title="Trending Now" />
        </section>

        {/* Popular Movies */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Movies</h2>
            <Link
              href="/browse?type=movie"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          <MediaGrid items={movies.slice(0, 12)} />
        </section>

        {/* Popular TV Shows */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular TV Shows</h2>
            <Link
              href="/browse?type=tv"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          <MediaGrid items={tvShows.slice(0, 12)} />
        </section>

        {/* Genre quick links */}
        <section className="pb-10 animate-fade-in">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'Action', color: 'from-red-600 to-orange-600', slug: 'action' },
              { name: 'Comedy', color: 'from-yellow-500 to-orange-500', slug: 'comedy' },
              { name: 'Drama', color: 'from-blue-600 to-indigo-600', slug: 'drama' },
              { name: 'Horror', color: 'from-emerald-700 to-teal-700', slug: 'horror' },
              { name: 'Sci-Fi', color: 'from-cyan-500 to-blue-600', slug: 'sci-fi' },
              { name: 'Romance', color: 'from-pink-500 to-rose-600', slug: 'romance' },
              { name: 'Thriller', color: 'from-gray-700 to-gray-900', slug: 'thriller' },
              { name: 'Animation', color: 'from-green-400 to-emerald-600', slug: 'animation' },
              { name: 'Documentary', color: 'from-amber-600 to-yellow-700', slug: 'documentary' },
              { name: 'Mystery', color: 'from-emerald-600 to-teal-700', slug: 'mystery' },
              { name: 'Fantasy', color: 'from-emerald-500 to-teal-600', slug: 'fantasy' },
              { name: 'War', color: 'from-stone-600 to-zinc-700', slug: 'war' },
            ].map((genre) => (
              <Link
                key={genre.slug}
                href={`/browse?genre=${genre.slug}`}
                className={`relative h-24 rounded-xl bg-gradient-to-br ${genre.color} overflow-hidden group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg tracking-wide drop-shadow-lg">
                    {genre.name}
                  </span>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
