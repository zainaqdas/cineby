import Link from 'next/link';
import { getImageUrl, formatRating, formatYear } from '@/lib/api';
import type { MediaItem } from '@/lib/types';

interface MediaCardProps {
  item: MediaItem;
  index?: number;
}

export default function MediaCard({ item, index }: MediaCardProps) {
  const title = item.title || item.name || 'Untitled';
  const year = formatYear(item.release_date || item.first_air_date);
  const type = item.type || item.media_type || (item.title ? 'movie' : 'tv');
  const href = type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
  const rating = item.vote_average ? formatRating(item.vote_average) : null;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800/50">
        {item.poster_path ? (
          <img
            src={getImageUrl(item.poster_path, 'w500')}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-semibold">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </div>
        )}
        {index !== undefined && index < 10 && (
          <div className="absolute bottom-0 left-0 text-6xl sm:text-7xl font-black text-white/5 leading-none -mb-2 -ml-1">
            {index + 1}
          </div>
        )}
      </div>
      <div className="mt-2.5 space-y-1">
        <h3 className="text-sm font-medium text-white/80 group-hover:text-emerald-400 transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/40">
          {year && <span>{year}</span>}
          {type === 'tv' ? (
            <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] uppercase tracking-wider">TV</span>
          ) : (
            <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] uppercase tracking-wider">Movie</span>
          )}
        </div>
      </div>
    </Link>
  );
}
