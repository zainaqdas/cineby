'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { searchMulti } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import { getImageUrl } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null!);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
    setQuery('');
  }, [pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMulti(value.trim(), 1);
        setSuggestions(res.results?.slice(0, 6) || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">NitFlix</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              href="/browse"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/browse' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse
            </Link>
          </div>

          {/* Search */}
          <div ref={searchRef} className="flex-1 max-w-md relative ml-auto">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search movies & TV..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                {suggestions.map((item) => {
                  const title = item.title || item.name || '';
                  const type = item.type || item.media_type || (item.title ? 'movie' : 'tv');
                  const href = type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
                  return (
                    <Link
                      key={item.id}
                      href={href}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                        {item.poster_path ? (
                          <img src={getImageUrl(item.poster_path, 'w300')} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{title}</p>
                        <p className="text-xs text-white/40">{type === 'tv' ? 'TV Series' : 'Movie'}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
