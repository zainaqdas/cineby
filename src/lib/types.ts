// ============ TMDB / Media Types ============

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: Genre[];
  media_type?: string;
  type?: string;
  original_language?: string;
  popularity?: number;
  adult?: boolean;
  original_title?: string;
  original_name?: string;
  status?: string;
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: Season[];
  credits?: Credits;
  videos?: Videos;
  production_companies?: ProductionCompany[];
  created_by?: Creator[];
  recommendations?: MediaItem[];
  similar?: MediaItem[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Season {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
  vote_average?: number;
}

export interface Episode {
  id: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  episode_number: number;
  season_number: number;
  air_date?: string;
  vote_average?: number;
  runtime?: number;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string | null;
}

export interface Videos {
  results: Video[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path?: string | null;
}

// ============ API Response Types ============

export interface SearchResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export interface StreamSource {
  name: string;
  url: string;
  active?: boolean;
}

export interface StreamResponse {
  tmdbId: string;
  type: string;
  streamUrl: string;
  playerHtml: string;
  note: string;
  sources: StreamSource[];
}

export interface SeasonDetail {
  _id: string;
  air_date: string | null;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}
