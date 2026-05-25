'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { browseTrending, browseMovies, browseTv } from '@/lib/api';
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
  const activeTab = TABS.find((t) => t.key === tabParam)?.key || 'trending';
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher = activeTab === 'trending' ? browseTrending()
      : activeTab === 'movie' ? browseMovies()
      : browseTv();
    fetcher
      .then((res) => setItems(res.results || []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Browse</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((tab) => (
            <a
              key={tab.key}
              href={`/browse?type=${tab.key}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map((genre) => (
            <a
              key={genre.slug}
              href={`/browse?genre=${genre.slug}`}
              className="px-3 py-1.5 text-xs font-medium text-white/50 bg-white/5 hover:bg-white/10 hover:text-white/80 rounded-full transition-all"
            >
              {genre.name}
            </a>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setLoading(true)} />
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
