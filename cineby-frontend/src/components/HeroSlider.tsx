'use client';

import { useRef, useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import Link from 'next/link';

interface HeroSliderProps {
  items: MediaItem[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout>>(null!);
  const featured = items.slice(0, 5);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % featured.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [featured.length]);

  const goTo = (i: number) => {
    setCurrent(i);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % featured.length);
    }, 6000);
  };

  if (featured.length === 0) return null;

  const item = featured[current];
  const title = item.title || item.name || '';
  const type = item.type || item.media_type || (item.title ? 'movie' : 'tv');
  const href = type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
      {featured.map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {m.backdrop_path ? (
            <img
              src={getImageUrl(m.backdrop_path, 'original')}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 bg-emerald-600/80 backdrop-blur-sm rounded-md text-xs font-semibold text-white uppercase tracking-wider">
                {type === 'tv' ? 'TV Series' : 'Movie'}
              </span>
              {item.vote_average && item.vote_average > 0 && (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {item.vote_average.toFixed(1)}
                </span>
              )}
              {(item.release_date || item.first_air_date) && (
                <span className="text-sm text-white/60">
                  {new Date(item.release_date || item.first_air_date!).getFullYear()}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed line-clamp-3 mb-6 max-w-xl">
              {item.overview}
            </p>
            <div className="flex items-center gap-3">
              <Link
                href={href}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
              <Link
                href={href}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl backdrop-blur-sm transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 right-6 sm:right-10 md:right-16 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-1.5 bg-emerald-500'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
