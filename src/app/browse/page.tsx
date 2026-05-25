'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
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
  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1);
  const activeTab = TABS.find((t) => t.key === tabParam)?.key || 'trending';
  const [items, setItems] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const buildHref = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      if (tabParam) params.set('type', tabParam);
      if (genreParam) params.set('genre', genreParam);
      if (pageParam > 1) params.set('page', String(pageParam));
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      const qs = params.toString();
      return `/browse${qs ? `?${qs}` : ''}`;
    },
    [tabParam, genreParam, pageParam]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    let fetcher: Promise<{ results: MediaItem[]; total_pages?: number }>;

    if (genreParam) {
      const searchType = activeTab === 'tv' ? 'tv' : 'movie';
      fetcher = browseByGenre(searchType, genreParam, pageParam);
    } else {
      fetcher =
        activeTab === 'trending'
          ? browseTrending(pageParam)
          : activeTab === 'movie'
          ? browseMovies(pageParam)
          : browseTv(pageParam);
    }

    fetcher
      .then((res) => {
        setItems(res.results || []);
        setTotalPages(res.total_pages || 1);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeTab, genreParam, pageParam, retryCount]);

  const genreName = genreParam
    ? GENRES.find((g) => g.slug === genreParam)?.name || genreParam
    : null;

  const pageNumbers: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, pageParam - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          {genreName ? `${genreName} Movies & TV` : 'Browse'}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((tab) => {
            const params = new URLSearchParams();
            params.set('type', tab.key);
            if (genreParam) params.set('genre', genreParam);
            const href = `/browse?${params.toString()}`;
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
            const params = new URLSearchParams();
            params.set('type', activeTab);
            params.set('genre', genre.slug);
            const href = `/browse?${params.toString()}`;
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
            <p className="text-white/40 text-lg">No results found.</p>
          </div>
        ) : (
          <>
            <MediaGrid items={items} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Prev */}
                {pageParam > 1 && (
                  <a
                    href={buildHref({ page: String(pageParam - 1) })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </a>
                )}

                {/* Page numbers */}
                {pageNumbers.map((num) => {
                  const isCurrent = num === pageParam;
                  return (
                    <a
                      key={num}
                      href={buildHref({ page: String(num) })}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {num}
                    </a>
                  );
                })}

                {/* Next */}
                {pageParam < totalPages && (
                  <a
                    href={buildHref({ page: String(pageParam + 1) })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </>
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
