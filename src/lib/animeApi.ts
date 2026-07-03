const PROXY_URL = "/api/jikan";
const JIKAN_API_URL =
  process.env.NEXT_PUBLIC_ANIME_API_URL || "https://api.jikan.moe/v4";
const EMBED_PROVIDER =
  process.env.NEXT_PUBLIC_EMBED_PROVIDER_URL || "https://megaplay.buzz";
const FALLBACK_EMBED_PROVIDER = "https://animeplay.cfd";

export type EmbedLanguage = "sub" | "dub";

export interface AnimeEpisode {
  episodeNumber: number;
  title: string;
  episodeId: string;
}

export interface AnimeInfo {
  id: string;
  title: string;
  description: string;
  genres: string[];
  rating?: number;
  image: string;
  cover?: string;
  episodes: AnimeEpisode[];
  episodeCount?: number;
  trailerUrl?: string;
}

export interface AnimeSearchResult {
  id: string;
  title: string;
  image: string;
  releaseDate?: string;
  subOrDub?: string;
  type?: string;
  score?: number;
}

export interface Server {
  name: string;
  url: string;
}

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis?: string;
  score?: number | null;
  images?: {
    jpg?: { image_url?: string; large_image_url?: string };
  };
  genres?: { name: string }[];
  episodes?: number | null;
  aired?: { from?: string };
  trailer?: { embed_url?: string | null };
  type?: string;
}

function resolveJikanUrl(endpoint: string): string {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return `${JIKAN_API_URL}${endpoint}`;
  }
  return `${PROXY_URL}${endpoint}`;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok || response.status !== 429) {
      return response;
    }

    lastResponse = response;
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return lastResponse!;
}

async function jikanFetch<T>(endpoint: string): Promise<T> {
  const isServer = typeof window === "undefined";
  const url = resolveJikanUrl(endpoint);
  const response = await fetchWithRetry(url, {
    headers: { Accept: "application/json" },
    ...(isServer ? { next: { revalidate: 3600 } } : { cache: "default" }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

function mapJikanToAnimeInfo(anime: JikanAnime, episodes: AnimeEpisode[] = []): AnimeInfo {
  const episodeCount = anime.episodes ?? episodes.length;

  return {
    id: String(anime.mal_id),
    title: anime.title_english || anime.title,
    description: anime.synopsis || "",
    genres: (anime.genres || []).map((g) => g.name),
    rating: anime.score ?? undefined,
    image: anime.images?.jpg?.image_url || "",
    cover: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    episodes: episodes.length > 0 ? episodes : generateEpisodesFromCount(episodeCount, String(anime.mal_id)),
    episodeCount,
    trailerUrl: anime.trailer?.embed_url || undefined,
  };
}

function mapJikanListItem(anime: JikanAnime): AnimeInfo {
  return mapJikanToAnimeInfo(anime);
}

function generateEpisodesFromCount(count: number, animeId: string): AnimeEpisode[] {
  if (!count || count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const episodeNumber = index + 1;
    return {
      episodeNumber,
      title: `Episode ${episodeNumber}`,
      episodeId: `${animeId}-ep-${episodeNumber}`,
    };
  });
}

export async function fetchTrendingAnime(): Promise<AnimeInfo[]> {
  try {
    const data = await jikanFetch<{ data: JikanAnime[] }>("/top/anime?filter=airing");
    const filteredData = (data.data || []).filter(
      (anime) => anime.type !== "ONA" && anime.type !== "ona"
    );
    return filteredData.map(mapJikanListItem);
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    return [];
  }
}

export async function fetchPopularAnime(): Promise<AnimeInfo[]> {
  try {
    const data = await jikanFetch<{ data: JikanAnime[] }>(
      "/top/anime?filter=bypopularity&limit=25"
    );
    return (data.data || []).map(mapJikanListItem);
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }
}

export async function fetchUpcomingAnime(): Promise<AnimeInfo[]> {
  try {
    const data = await jikanFetch<{ data: JikanAnime[] }>(
      "/top/anime?filter=upcoming&limit=25"
    );
    return (data.data || []).map(mapJikanListItem);
  } catch (error) {
    console.error("Error fetching upcoming anime:", error);
    return [];
  }
}

export async function fetchTopMovies(): Promise<AnimeInfo[]> {
  try {
    const data = await jikanFetch<{ data: JikanAnime[] }>(
      "/top/anime?type=movie&limit=25"
    );
    return (data.data || []).map(mapJikanListItem);
  } catch (error) {
    console.error("Error fetching top movies:", error);
    return [];
  }
}

export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  try {
    const data = await jikanFetch<{ data: JikanAnime[] }>(
      `/anime?q=${encodeURIComponent(query)}&limit=25`
    );
    return (data.data || []).map((anime) => ({
      id: String(anime.mal_id),
      title: anime.title_english || anime.title,
      image: anime.images?.jpg?.image_url || "",
      releaseDate: anime.aired?.from?.split("T")[0],
      type: anime.type,
      score: anime.score ?? undefined,
    }));
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
}

export async function fetchAnimeInfo(id: string): Promise<AnimeInfo | null> {
  try {
    const data = await jikanFetch<{ data: JikanAnime }>(`/anime/${id}/full`);
    const anime = data.data;

    if (!anime) return null;

    return mapJikanToAnimeInfo(anime);
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return null;
  }
}

export function buildEpisodeEmbedUrl(
  malId: string,
  episodeNumber: number,
  language: EmbedLanguage,
  baseUrl: string = EMBED_PROVIDER
): string {
  return `${baseUrl}/stream/mal/${malId}/${episodeNumber}/${language}`;
}

export async function fetchEpisodeServers(
  malId: string,
  episodeNumber: number,
  trailerUrl?: string
): Promise<Server[]> {
  const servers: Server[] = [
    {
      name: "Subtitles",
      url: buildEpisodeEmbedUrl(malId, episodeNumber, "sub"),
    },
    {
      name: "English Dub",
      url: buildEpisodeEmbedUrl(malId, episodeNumber, "dub"),
    },
    {
      name: "Subtitles (Mirror)",
      url: buildEpisodeEmbedUrl(malId, episodeNumber, "sub", FALLBACK_EMBED_PROVIDER),
    },
    {
      name: "English Dub (Mirror)",
      url: buildEpisodeEmbedUrl(malId, episodeNumber, "dub", FALLBACK_EMBED_PROVIDER),
    },
  ];

  if (trailerUrl) {
    servers.push({ name: "Trailer (YouTube)", url: trailerUrl });
  }

  return servers;
}

export async function fetchEpisodeStream(
  malId: string,
  episodeNumber: number,
  language: EmbedLanguage = "sub"
): Promise<string | null> {
  return buildEpisodeEmbedUrl(malId, episodeNumber, language);
}
