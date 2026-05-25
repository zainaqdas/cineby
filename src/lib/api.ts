async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ===== Movies =====
export async function getMovieDetails(id: number) {
  return fetchApi<import('./types').MediaItem>(`/api/movie/${id}`);
}

// ===== TV =====
export async function getTvDetails(id: number) {
  return fetchApi<import('./types').MediaItem>(`/api/tv/${id}`);
}

export async function getTvSeasonDetails(id: number, season: number, signal?: AbortSignal) {
  return fetchApi<import('./types').SeasonDetail>(`/api/tv/${id}/season/${season}`, { signal });
}

// ===== Search & Browse =====
export async function searchMulti(query: string, page = 1) {
  return fetchApi<import('./types').SearchResponse>(
    `/api/search?query=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function browseTrending(page = 1) {
  return fetchApi<import('./types').SearchResponse>(`/api/browse/trending?page=${page}`);
}

export async function browseMovies(page = 1) {
  return fetchApi<import('./types').SearchResponse>(`/api/browse/movie?page=${page}`);
}

export async function browseTv(page = 1) {
  return fetchApi<import('./types').SearchResponse>(`/api/browse/tv?page=${page}`);
}

// ===== Streaming =====
export async function getMovieStream(id: number) {
  return fetchApi<import('./types').StreamResponse>(`/api/stream/movie/${id}`);
}

export async function getTvStream(id: number, season: number, episode: number) {
  return fetchApi<import('./types').StreamResponse>(
    `/api/stream/tv/${id}?season=${season}&episode=${episode}`
  );
}

// ===== Utility =====
export function getImageUrl(path: string | null | undefined, size: 'w500' | 'original' | 'w300' | 'w780' = 'w500'): string {
  if (!path) return '/placeholder-poster.svg';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatRating(vote: number | undefined): string {
  if (!vote) return 'N/A';
  return vote.toFixed(1);
}

export function formatRuntime(minutes: number | undefined): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).getFullYear().toString();
}
