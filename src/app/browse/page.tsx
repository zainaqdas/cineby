'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { browseTrending, browseMovies, browseTv, browseByGenre } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import MediaGrid from '@/components/MediaGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';

const TABS = [
  { key: 'trending', label: 'Trending' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Shows' },
] as const;

const GENRES = [
  { slug: 'action', name: 'Action' },
  { slug: 'adventure', name: 'Adventure' },
  { slug: 'comedy', name: 'Comedy' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'horror', name: 'Horror' },
  { slug: 'science-fiction', name: 'Sci-Fi' },
  { slug: 'thriller', name: 'Thriller' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'animation', name: 'Animation' },
  { slug: 'documentary', name: 'Documentary' },
  { slug: 'mystery', name: 'Mystery' },
  { slug: 'fantasy', name: 'Fantasy' },
  { slug: 'war', name: 'War' },
  { slug: 'music', name: 'Music' },
  { slug: 'western', name: 'Western' },
  { slug: 'crime', name: 'Crime' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('type') || 'trending';
  const genreParam = searchParams.get('genre') || '';
  const activeTab = TABS.find((t) => t.key === tabParam)?.key || 'trending';
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let fetcher: Promise<{ results: MediaItem[] }>;

    if (genreParam) {
      // Determine type from active tab (default to movie for genre searches)
      const searchType = activeTab === 'tv' ? 'tv' : 'movie';
      fetcher = browseByGenre(searchType, genreParam);
    } else {
      fetcher = activeTab === 'trending' ? browseTrending()
        : activeTab === 'movie' ? browseMovies()
        : browseTv();
    }

    fetcher
      .then((res) => setItems(res.results || []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeTab, genreParam, retryCount]);

  const genreName = genreParam
    ? GENRES.find((g) => g.slug === genreParam)?.name || genreParam
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          {genreName ? `${genreName} Movies & TV` : 'Browse'}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((tab) => {
            const href = genreParam
              ? `/browse?type=${tab.key}&genre=${genreParam}`
              : `/browse?type=${tab.key}`;
            return (
              <a
                key={tab.key}
                href={href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.key && !genreParam
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </a>
            );
          })}
          {genreParam && (
            <a
              href="/browse"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-white/10 text-white/80 hover:bg-white/15"
            >
              Clear Filters
            </a>
          )}
        </div>

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map((genre) => {
            const isActive = genreParam === genre.slug;
            const href = `/browse?type=${activeTab}&genre=${genre.slug}`;
            return (
              <a
                key={genre.slug}
                href={href}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/50 bg-white/5 hover:bg-white/10 hover:text-white/80 border border-transparent'
                }`}
              >
                {genre.name}
              </a>
            );
          })}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No results found for this genre.</p>
          </div>
        ) : (
          <MediaGrid items={items} />
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}
