const PROXY_URL = "/api/jikan";
const ANIKOTO_PROXY_URL = "/api/anikoto";
const ANIKOTO_API_URL = "https://anikotoapi.site";
const JIKAN_API_URL =
  process.env.NEXT_PUBLIC_ANIME_API_URL || "https://api.jikan.moe/v4";
const EMBED_PROVIDER =
  process.env.NEXT_PUBLIC_EMBED_PROVIDER_URL || "https://megaplay.buzz";
const FALLBACK_EMBED_PROVIDER = "https://animeplay.cfd";

export type EmbedLanguage = "sub" | "dub";

export interface EpisodeEmbedUrls {
  sub?: string;
  dub?: string;
}

export interface AnimeEpisode {
  episodeNumber: number;
  title: string;
  episodeId: string;
  embedUrls?: EpisodeEmbedUrls;
  episodeEmbedId?: string;
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
  malId?: string;
  catalogId?: string;
  isRecentlyAdded?: boolean;
  airedDate?: string;
  status?: string;
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

interface AnikotoRecentAnime {
  id: number;
  title: string;
  alternative?: string;
  description?: string;
  poster?: string;
  background_image?: string;
  mal_id?: string;
  episodes?: string;
  aired?: string;
  status?: string;
  rating?: string;
  terms_by_type?: { genre?: string[] };
}

interface AnikotoEpisode {
  id: number;
  title: string;
  number: number;
  episode_embed_id?: string;
  embed_url?: EpisodeEmbedUrls;
}

interface AnikotoSeriesResponse {
  ok: boolean;
  data: {
    anime: AnikotoRecentAnime;
    episodes: AnikotoEpisode[];
  };
}

interface AnikotoRecentResponse {
  ok: boolean;
  data: AnikotoRecentAnime[];
}

export function isCatalogId(id: string): boolean {
  return id.startsWith("c-");
}

export function getCatalogId(id: string): string | null {
  return isCatalogId(id) ? id.slice(2) : null;
}

export function getMalIdForEmbed(animeId: string, anime?: AnimeInfo | null): string | null {
  if (isCatalogId(animeId)) {
    return anime?.malId || null;
  }
  return animeId;
}

function resolveJikanUrl(endpoint: string): string {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return `${JIKAN_API_URL}${endpoint}`;
  }
  return `${PROXY_URL}${endpoint}`;
}

function resolveAnikotoUrl(endpoint: string): string {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return `${ANIKOTO_API_URL}${endpoint}`;
  }
  return `${ANIKOTO_PROXY_URL}${endpoint}`;
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

async function anikotoFetch<T>(endpoint: string): Promise<T> {
  const isServer = typeof window === "undefined";
  const url = resolveAnikotoUrl(endpoint);
  const response = await fetchWithRetry(url, {
    headers: { Accept: "application/json" },
    ...(isServer ? { next: { revalidate: 300 } } : { cache: "default" }),
  });

  if (!response.ok) {
    throw new Error(`Anikoto API request failed: ${response.status}`);
  }

  return response.json();
}

function mapAnikotoEpisode(ep: AnikotoEpisode, catalogId: string): AnimeEpisode {
  return {
    episodeNumber: ep.number,
    title: ep.title || `Episode ${ep.number}`,
    episodeId: `${catalogId}-ep-${ep.number}`,
    embedUrls: ep.embed_url,
    episodeEmbedId: ep.episode_embed_id,
  };
}

function mapAnikotoToAnimeInfo(
  anime: AnikotoRecentAnime,
  episodes: AnikotoEpisode[] = []
): AnimeInfo {
  const catalogId = String(anime.id);
  // Prioritize actual available episodes over official total count
  const episodeCount = episodes.length > 0 ? episodes.length : parseInt(anime.episodes || "0", 10);
  const mappedEpisodes =
    episodes.length > 0
      ? episodes.map((ep) => mapAnikotoEpisode(ep, catalogId))
      : generateEpisodesFromCount(episodeCount, `c-${catalogId}`);

  return {
    id: `c-${catalogId}`,
    title: anime.title,
    description: anime.description || "",
    genres: anime.terms_by_type?.genre || [],
    rating: anime.rating ? parseFloat(anime.rating) : undefined,
    image: anime.poster || "",
    cover: anime.background_image || anime.poster || "",
    episodes: mappedEpisodes,
    episodeCount,
    malId: anime.mal_id || undefined,
    catalogId,
    isRecentlyAdded: true,
    airedDate: anime.aired,
    status: anime.status,
  };
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
    malId: String(anime.mal_id),
    trailerUrl: anime.trailer?.embed_url || undefined,
  };
}

function mapJikanListItem(anime: JikanAnime): AnimeInfo {
  return mapJikanToAnimeInfo(anime);
}

// Cache for Anikoto data to avoid repeated API calls
let anikotoCache: Map<string, AnikotoRecentAnime> | null = null;
let anikotoCacheTime: number = 0;
const ANIKOTO_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getAnikotoCache(): Promise<Map<string, AnikotoRecentAnime>> {
  const now = Date.now();
  if (anikotoCache && (now - anikotoCacheTime) < ANIKOTO_CACHE_DURATION) {
    return anikotoCache;
  }

  try {
    const data = await anikotoFetch<AnikotoRecentResponse>(`/recent-anime?page=1&per_page=200`);
    if (data.ok && data.data) {
      anikotoCache = new Map(data.data.map(anime => [anime.mal_id || String(anime.id), anime]));
      anikotoCacheTime = now;
      return anikotoCache;
    }
  } catch (error) {
    console.error("Error fetching Anikoto cache:", error);
  }

  return new Map();
}

async function enrichWithAnikotoData(anime: AnimeInfo, malId: string): Promise<AnimeInfo> {
  const cache = await getAnikotoCache();
  const anikotoMatch = cache.get(malId);

  if (anikotoMatch) {
    const anikotoInfo = mapAnikotoToAnimeInfo(anikotoMatch);
    // Use Anikoto title and data, keep other metadata from Jikan
    return {
      ...anime,
      id: anikotoInfo.id, // Use catalogId so it routes to Anikoto data
      title: anikotoInfo.title, // Use Anikoto title
      image: anikotoInfo.image || anime.image, // Prefer Anikoto image
      cover: anikotoInfo.cover || anime.cover,
      catalogId: anikotoInfo.catalogId,
      malId: malId,
      episodes: anikotoInfo.episodes, // Use Anikoto episodes
      episodeCount: anikotoInfo.episodeCount, // Use Anikoto episode count
    };
  }

  return anime;
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

async function fetchAnikotoAnimeInfo(catalogId: string): Promise<AnimeInfo | null> {
  try {
    const data = await anikotoFetch<AnikotoSeriesResponse>(`/series/${catalogId}`);
    if (!data.ok || !data.data?.anime) return null;
    return mapAnikotoToAnimeInfo(data.data.anime, data.data.episodes || []);
  } catch (error) {
    console.error("Error fetching Anikoto anime info:", error);
    return null;
  }
}

export async function fetchRecentlyAddedAnime(limit = 24): Promise<AnimeInfo[]> {
  try {
    const perPage = Math.min(limit, 48);
    const data = await anikotoFetch<AnikotoRecentResponse>(
      `/recent-anime?page=1&per_page=${perPage}`
    );

    if (!data.ok || !data.data) return [];

    const filteredAnime = data.data.filter((anime) => anime.poster && anime.title);

    // Fetch actual episode data for each anime to get available episodes count
    const animeWithEpisodes = await Promise.all(
      filteredAnime.map(async (anime) => {
        try {
          const seriesData = await anikotoFetch<AnikotoSeriesResponse>(`/series/${anime.id}`);
          if (seriesData.ok && seriesData.data) {
            return mapAnikotoToAnimeInfo(anime, seriesData.data.episodes);
          }
        } catch (error) {
          console.error(`Error fetching episodes for ${anime.title}:`, error);
        }
        // Fallback to basic mapping if series fetch fails
        return mapAnikotoToAnimeInfo(anime);
      })
    );

    return animeWithEpisodes;
  } catch (error) {
    console.error("Error fetching recently added anime:", error);
    return [];
  }
}

export async function fetchTrendingAnime(): Promise<AnimeInfo[]> {
  try {
    const data = await jikanFetch<{ data: JikanAnime[] }>("/top/anime?filter=airing");
    const filteredData = (data.data || []).filter(
      (anime) => anime.type !== "ONA" && anime.type !== "ona"
    );
    const mappedData = filteredData.map(mapJikanListItem);
    // Enrich with Anikoto titles
    const enrichedData = await Promise.all(
      mappedData.map(anime => enrichWithAnikotoData(anime, anime.malId || anime.id))
    );
    return enrichedData;
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
    const mappedData = (data.data || []).map(mapJikanListItem);
    // Enrich with Anikoto titles
    const enrichedData = await Promise.all(
      mappedData.map(anime => enrichWithAnikotoData(anime, anime.malId || anime.id))
    );
    return enrichedData;
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
    const mappedData = (data.data || []).map(mapJikanListItem);
    // Enrich with Anikoto titles
    const enrichedData = await Promise.all(
      mappedData.map(anime => enrichWithAnikotoData(anime, anime.malId || anime.id))
    );
    return enrichedData;
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
    const mappedData = (data.data || []).map(mapJikanListItem);
    // Enrich with Anikoto titles
    const enrichedData = await Promise.all(
      mappedData.map(anime => enrichWithAnikotoData(anime, anime.malId || anime.id))
    );
    return enrichedData;
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
    const mappedData = (data.data || []).map((anime) => ({
      id: String(anime.mal_id),
      title: anime.title_english || anime.title,
      image: anime.images?.jpg?.image_url || "",
      releaseDate: anime.aired?.from?.split("T")[0],
      type: anime.type,
      score: anime.score ?? undefined,
    }));

    // Enrich with Anikoto titles and use catalogId when available
    const cache = await getAnikotoCache();
    const enrichedData = mappedData.map((anime) => {
      const anikotoMatch = cache.get(anime.id);
      if (anikotoMatch) {
        return {
          ...anime,
          id: `c-${anikotoMatch.id}`, // Use catalogId so it routes to Anikoto data
          title: anikotoMatch.title, // Use Anikoto title
          image: anikotoMatch.poster || anime.image, // Prefer Anikoto image
        };
      }
      return anime;
    });

    return enrichedData;
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
}

export async function fetchAnimeInfo(id: string): Promise<AnimeInfo | null> {
  const catalogId = getCatalogId(id);
  if (catalogId) {
    return fetchAnikotoAnimeInfo(catalogId);
  }

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

export function buildCatalogEmbedUrl(
  episodeEmbedId: string,
  language: EmbedLanguage,
  baseUrl: string = EMBED_PROVIDER
): string {
  return `${baseUrl}/stream/s-2/${episodeEmbedId}/${language}`;
}

export function buildEpisodeEmbedUrl(
  malId: string,
  episodeNumber: number,
  language: EmbedLanguage,
  baseUrl: string = EMBED_PROVIDER
): string {
  return `${baseUrl}/stream/mal/${malId}/${episodeNumber}/${language}`;
}

export function fetchEpisodeServers(
  animeId: string,
  episodeNumber: number,
  episode?: AnimeEpisode,
  trailerUrl?: string,
  malId?: string
): Server[] {
  const servers: Server[] = [];
  const resolvedMalId = malId || (isCatalogId(animeId) ? null : animeId);

  if (episode?.embedUrls?.sub) {
    servers.push({ name: "Subtitles (HD)", url: episode.embedUrls.sub });
    if (episode.episodeEmbedId) {
      servers.push({
        name: "Subtitles (Mirror)",
        url: buildCatalogEmbedUrl(episode.episodeEmbedId, "sub", FALLBACK_EMBED_PROVIDER),
      });
    }
  }

  if (episode?.embedUrls?.dub) {
    servers.push({ name: "English Dub (HD)", url: episode.embedUrls.dub });
    if (episode.episodeEmbedId) {
      servers.push({
        name: "English Dub (Mirror)",
        url: buildCatalogEmbedUrl(episode.episodeEmbedId, "dub", FALLBACK_EMBED_PROVIDER),
      });
    }
  }

  if (episode?.episodeEmbedId && !episode.embedUrls?.sub) {
    servers.push({
      name: "Subtitles",
      url: buildCatalogEmbedUrl(episode.episodeEmbedId, "sub"),
    });
    servers.push({
      name: "Subtitles (Mirror)",
      url: buildCatalogEmbedUrl(episode.episodeEmbedId, "sub", FALLBACK_EMBED_PROVIDER),
    });
  }

  if (episode?.episodeEmbedId && !episode.embedUrls?.dub) {
    servers.push({
      name: "English Dub",
      url: buildCatalogEmbedUrl(episode.episodeEmbedId, "dub"),
    });
  }

  if (resolvedMalId) {
    servers.push({
      name: "Subtitles (MAL)",
      url: buildEpisodeEmbedUrl(resolvedMalId, episodeNumber, "sub"),
    });
    servers.push({
      name: "English Dub (MAL)",
      url: buildEpisodeEmbedUrl(resolvedMalId, episodeNumber, "dub"),
    });
  }

  if (trailerUrl) {
    servers.push({ name: "Trailer (YouTube)", url: trailerUrl });
  }

  return servers;
}

export function fetchEpisodeStream(
  animeId: string,
  episodeNumber: number,
  episode?: AnimeEpisode,
  language: EmbedLanguage = "sub",
  malId?: string
): string | null {
  if (language === "sub" && episode?.embedUrls?.sub) return episode.embedUrls.sub;
  if (language === "dub" && episode?.embedUrls?.dub) return episode.embedUrls.dub;
  if (episode?.episodeEmbedId) {
    return buildCatalogEmbedUrl(episode.episodeEmbedId, language);
  }

  const resolvedMalId = malId || (isCatalogId(animeId) ? null : animeId);
  if (resolvedMalId) {
    return buildEpisodeEmbedUrl(resolvedMalId, episodeNumber, language);
  }

  return null;
}
