import MediaCard from './MediaCard';
import type { MediaItem } from '@/lib/types';

interface MediaGridProps {
  items: MediaItem[];
  title?: string;
  showIndex?: boolean;
}

export default function MediaGrid({ items, title, showIndex }: MediaGridProps) {
  return (
    <section>
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-white/40 py-8 text-center">No items found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {items.map((item, i) => (
            <MediaCard key={`${item.id}-${i}`} item={item} index={showIndex ? i : undefined} />
          ))}
        </div>
      )}
    </section>
  );
}
