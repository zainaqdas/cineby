'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMulti } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import MediaGrid from '@/components/MediaGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<MediaItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    searchMulti(query.trim(), page)
      .then((res) => {
        setResults(res.results || []);
        setTotalResults(res.total_results || 0);
        setTotalPages(res.total_pages || 1);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Search failed'))
      .finally(() => setLoading(false));
  }, [query, page]);

  useEffect(() => {
    setPage(1);
    setResults([]);
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white/60">Search Movies & TV Shows</h2>
        <p className="text-sm text-white/30 mt-2">Type in the search bar to find your favorite content.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Results for &ldquo;{query}&rdquo;</h1>
          {!loading && (
            <p className="text-sm text-white/40 mt-2">Found {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''}</p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Searching..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setPage(1)} />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-white/40">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-white/20 mt-2">Try different keywords or check spelling.</p>
          </div>
        ) : (
          <>
            <MediaGrid items={results} />
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-white/40">Page {page} of {totalPages > 500 ? 500 : totalPages}</span>
                <button
                  disabled={page >= totalPages || page >= 500}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
