const TMDB_PROXY = 'https://db.videasy.net/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/';

interface TmdbOptions {
  append_to_response?: string;
  page?: number;
  query?: string;
  [key: string]: string | number | undefined;
}

async function tmdbFetch<T>(path: string, options: TmdbOptions = {}): Promise<T> {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const query = params.toString();
  const url = `${TMDB_PROXY}${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

function normalizeMedia(item: any): any {
  if (!item) return null;
  const posterUrl = item.poster_path
    ? `${IMAGE_BASE}w500${item.poster_path}`
    : null;
  const backdropUrl = item.backdrop_path
    ? `${IMAGE_BASE}original${item.backdrop_path}`
    : null;
  const isMovie = item.media_type === 'movie' || !!item.title;
  const isTv = item.media_type === 'tv' || !!item.name;

  return {
    id: item.id,
    title: item.title || item.name || item.original_title || item.original_name || '',
    name: item.name || item.title || '',
    overview: item.overview || '',
    tagline: item.tagline || '',
    type: isMovie ? 'movie' : 'tv',
    media_type: isMovie ? 'movie' : 'tv',
    poster_path: posterUrl,
    backdrop_path: backdropUrl,
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    popularity: item.popularity || 0,
    release_date: item.release_date || item.first_air_date || null,
    first_air_date: item.first_air_date || null,
    year: (item.release_date || item.first_air_date || '').split('-')[0] || null,
    runtime: item.runtime || null,
    status: item.status || null,
    genres: (item.genres || []).map((g: any) => ({ id: g.id, name: g.name })),
    production_companies: (item.production_companies || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      logo_path: c.logo_path,
    })),
    numberOfSeasons: item.number_of_seasons || null,
    numberOfEpisodes: item.number_of_episodes || null,
    seasons: (item.seasons || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      season_number: s.season_number,
      episode_count: s.episode_count,
      air_date: s.air_date,
      poster_path: s.poster_path,
    })),
    credits: item.credits || null,
    videos: item.videos || null,
    recommendations: (item.recommendations?.results || []).slice(0, 20),
    similar: (item.similar?.results || []).slice(0, 20),
  };
}

function normalizeResults(data: any) {
  const results = (data.results || []).filter(
    (r: any) => r.media_type !== 'person'
  );
  return {
    page: data.page,
    results: results.map(normalizeMedia),
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
}

// ===== Exported functions =====

export async function getMovie(id: number) {
  const data = await tmdbFetch<any>(`/movie/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  });
  return normalizeMedia(data);
}

export async function getTvShow(id: number) {
  const data = await tmdbFetch<any>(`/tv/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  });
  return normalizeMedia(data);
}

export async function getSeason(tvId: number, season: number) {
  return tmdbFetch<any>(`/tv/${tvId}/season/${season}`);
}

export async function searchMulti(query: string, page = 1) {
  const data = await tmdbFetch<any>('/search/multi', { query, page });
  return normalizeResults(data);
}

export async function getTrending(timeWindow = 'week', page = 1) {
  const data = await tmdbFetch<any>(`/trending/all/${timeWindow}`, { page });
  return normalizeResults(data);
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch<any>('/movie/popular', { page });
  return normalizeResults(data);
}

export async function getPopularTv(page = 1) {
  const data = await tmdbFetch<any>('/tv/popular', { page });
  return normalizeResults(data);
}

// ===== Genre Discovery =====

const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science-fiction': 878,
  thriller: 53,
  'tv-movie': 10770,
  war: 10752,
  western: 37,
};

const GENRE_NAMES: Record<string, string> = {
  action: 'Action',
  adventure: 'Adventure',
  animation: 'Animation',
  comedy: 'Comedy',
  crime: 'Crime',
  documentary: 'Documentary',
  drama: 'Drama',
  family: 'Family',
  fantasy: 'Fantasy',
  history: 'History',
  horror: 'Horror',
  music: 'Music',
  mystery: 'Mystery',
  romance: 'Romance',
  'science-fiction': 'Science Fiction',
  thriller: 'Thriller',
  'tv-movie': 'TV Movie',
  war: 'War',
  western: 'Western',
};

export function getGenreId(slug: string): number | undefined {
  return GENRE_MAP[slug];
}

export function getGenreName(slug: string): string | undefined {
  return GENRE_NAMES[slug];
}

export async function getDiscoverByGenre(type: 'movie' | 'tv', genreSlug: string, page = 1) {
  const genreId = GENRE_MAP[genreSlug];
  if (!genreId) {
    throw new Error(`Unknown genre slug: ${genreSlug}`);
  }
  const data = await tmdbFetch<any>(`/discover/${type}`, {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page,
  });
  return normalizeResults(data);
}

// ===== Stream Source URLs =====

export function getVidsrcMovieUrl(tmdbId: number): string {
  return `https://vidsrc.to/embed/movie/${tmdbId}`;
}

export function getVidsrcTvUrl(tmdbId: number, season: number, episode: number): string {
  return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
}

export function getMultiEmbedMovieUrl(tmdbId: number): string {
  return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
}

export function getMultiEmbedTvUrl(tmdbId: number, season: number, episode: number): string {
  return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
}

export function getMovieSources(tmdbId: number): { name: string; url: string }[] {
  return [
    { name: 'VidSrc', url: getVidsrcMovieUrl(tmdbId) },
    { name: 'MultiEmbed', url: getMultiEmbedMovieUrl(tmdbId) },
  ];
}

export function getTvSources(tmdbId: number, season: number, episode: number): { name: string; url: string }[] {
  return [
    { name: 'VidSrc', url: getVidsrcTvUrl(tmdbId, season, episode) },
    { name: 'MultiEmbed', url: getMultiEmbedTvUrl(tmdbId, season, episode) },
  ];
}
