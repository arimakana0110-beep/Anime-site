import { Server } from "@/lib/animeApi";

const ANIVEXA_API_URL = "https://anivexa-api.vercel.app";
const CINETARO_BASE = "https://cinextream.net";
const EMBED_PROVIDER =
  process.env.NEXT_PUBLIC_EMBED_PROVIDER_URL || "https://megaplay.buzz";
const FALLBACK_EMBED_PROVIDER = "https://animeplay.cfd";

type EmbedLanguage = "sub" | "dub";

const ANIVEXA_PROVIDERS = ["animegg", "anineko", "anikoto"] as const;

export interface StreamServerRequest {
  malId?: string;
  episodeNumber: number;
  episodeEmbedId?: string;
  embedSub?: string;
  embedDub?: string;
  trailerUrl?: string;
}

interface AnivexaStream {
  url?: string;
  embed?: string | null;
  type?: string;
  server?: string;
  audio?: string;
}

interface AnivexaWatchResponse {
  ssub?: { streams?: AnivexaStream[] };
  sdub?: { streams?: AnivexaStream[] };
  streams?: AnivexaStream[];
}

function isIframeFriendlyUrl(url: string): boolean {
  if (!url || url.includes(".m3u8") || url.includes("clock.json")) return false;
  return (
    url.includes("/embed") ||
    url.includes("/stream/") ||
    url.includes("cinextream.net/api/embed") ||
    url.includes("megaplay.buzz") ||
    url.includes("vidwish.live") ||
    url.includes("animeplay.cfd") ||
    url.includes("vivibebe.site") ||
    url.includes("animegg.org/embed")
  );
}

function buildCatalogEmbedUrl(
  episodeEmbedId: string,
  language: EmbedLanguage,
  baseUrl: string = EMBED_PROVIDER
): string {
  return `${baseUrl}/stream/s-2/${episodeEmbedId}/${language}`;
}

function buildEpisodeEmbedUrl(
  malId: string,
  episodeNumber: number,
  language: EmbedLanguage,
  baseUrl: string = EMBED_PROVIDER
): string {
  return `${baseUrl}/stream/mal/${malId}/${episodeNumber}/${language}`;
}

function buildAnilistEmbedUrl(
  anilistId: number,
  episodeNumber: number,
  language: EmbedLanguage,
  baseUrl: string = EMBED_PROVIDER
): string {
  return `${baseUrl}/stream/ani/${anilistId}/${episodeNumber}/${language}`;
}

function buildVidwishEmbedUrl(
  episodeEmbedId: string,
  language: EmbedLanguage
): string {
  return `https://vidwish.live/stream/s-2/${episodeEmbedId}/${language}`;
}

function buildCinetaroEmbedUrl(tmdbId: number, episodeNumber: number): string {
  return `${CINETARO_BASE}/api/embed/tv/${tmdbId}/1/${episodeNumber}?color=9333ea`;
}

async function resolveAnilistId(malId: string): Promise<number | null> {
  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: `query($id:Int){Media(idMal:$id,type:ANIME){id}}`,
        variables: { id: parseInt(malId, 10) },
      }),
      next: { revalidate: 86400 },
    });

    if (!response.ok) return parseInt(malId, 10) || null;

    const data = await response.json();
    return data?.data?.Media?.id ?? (parseInt(malId, 10) || null);
  } catch {
    const parsed = parseInt(malId, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
}

async function resolveTmdbId(anilistId: number): Promise<number | null> {
  try {
    const response = await fetch(`${ANIVEXA_API_URL}/map/${anilistId}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tmdbId = data?.mappings?.themoviedbId;
    return typeof tmdbId === "number" && tmdbId > 0 ? tmdbId : null;
  } catch {
    return null;
  }
}

function extractEmbedsFromAnivexaResponse(
  data: AnivexaWatchResponse,
  providerName: string
): { sub: string[]; dub: string[] } {
  const sub: string[] = [];
  const dub: string[] = [];

  const collect = (streams: AnivexaStream[] | undefined, bucket: string[]) => {
    for (const stream of streams || []) {
      const candidates = [stream.embed, stream.type === "embed" ? stream.url : null]
        .filter((url): url is string => typeof url === "string" && url.length > 0)
        .filter((url) => isIframeFriendlyUrl(url));
      for (const url of candidates) {
        if (!bucket.includes(url)) bucket.push(url);
      }
    }
  };

  collect(data.streams, sub);
  collect(data.ssub?.streams, sub);
  collect(data.sdub?.streams, dub);

  if (sub.length === 0 && dub.length === 0 && providerName) {
    // Some providers only expose flat streams array
    collect(data.streams, sub);
  }

  return { sub, dub };
}

async function fetchAnivexaProviderEmbeds(
  anilistId: number,
  episodeNumber: number,
  provider: (typeof ANIVEXA_PROVIDERS)[number]
): Promise<{ sub: string[]; dub: string[] }> {
  const sub: string[] = [];
  const dub: string[] = [];

  for (const audio of ["sub", "dub"] as const) {
    try {
      const response = await fetch(
        `${ANIVEXA_API_URL}/watch/${provider}/${anilistId}/${audio}/${provider}-${episodeNumber}`,
        { headers: { Accept: "application/json" }, next: { revalidate: 300 } }
      );

      if (!response.ok) continue;

      const data: AnivexaWatchResponse = await response.json();
      const extracted = extractEmbedsFromAnivexaResponse(data, provider);
      sub.push(...extracted.sub);
      dub.push(...extracted.dub);
    } catch {
      // Try next provider
    }
  }

  return { sub, dub };
}

export async function fetchMultiProviderServers(
  request: StreamServerRequest
): Promise<Server[]> {
  const servers: Server[] = [];
  const seen = new Set<string>();

  const addServer = (name: string, url?: string | null) => {
    if (!url || seen.has(url) || !isIframeFriendlyUrl(url)) return;
    seen.add(url);
    servers.push({ name, url });
  };

  if (request.embedSub) addServer("Subtitles (Latest Catalog)", request.embedSub);
  if (request.embedDub) addServer("English Dub (Latest Catalog)", request.embedDub);

  if (request.episodeEmbedId) {
    addServer("Subtitles (MegaPlay)", buildCatalogEmbedUrl(request.episodeEmbedId, "sub"));
    addServer("English Dub (MegaPlay)", buildCatalogEmbedUrl(request.episodeEmbedId, "dub"));
    addServer("Subtitles (VidWish)", buildVidwishEmbedUrl(request.episodeEmbedId, "sub"));
    addServer(
      "Subtitles (Mirror)",
      buildCatalogEmbedUrl(request.episodeEmbedId, "sub", FALLBACK_EMBED_PROVIDER)
    );
  }

  if (request.malId) {
    const anilistId = await resolveAnilistId(request.malId);

    if (anilistId) {
      const tmdbId = await resolveTmdbId(anilistId);
      if (tmdbId) {
        addServer("Cinetaro (Large Library)", buildCinetaroEmbedUrl(tmdbId, request.episodeNumber));
      }

      for (const provider of ANIVEXA_PROVIDERS) {
        const label = provider.charAt(0).toUpperCase() + provider.slice(1);
        const embeds = await fetchAnivexaProviderEmbeds(
          anilistId,
          request.episodeNumber,
          provider
        );

        embeds.sub.forEach((url, index) => {
          addServer(
            embeds.sub.length > 1 ? `${label} Sub ${index + 1}` : `${label} (Sub)`,
            url
          );
        });
        embeds.dub.forEach((url, index) => {
          addServer(
            embeds.dub.length > 1 ? `${label} Dub ${index + 1}` : `${label} (Dub)`,
            url
          );
        });
      }

      addServer("MegaPlay AniList (Sub)", buildAnilistEmbedUrl(anilistId, request.episodeNumber, "sub"));
      addServer("MegaPlay AniList (Dub)", buildAnilistEmbedUrl(anilistId, request.episodeNumber, "dub"));
      addServer(
        "MegaPlay AniList Mirror (Sub)",
        buildAnilistEmbedUrl(anilistId, request.episodeNumber, "sub", FALLBACK_EMBED_PROVIDER)
      );
    }

    addServer("MegaPlay MAL (Sub)", buildEpisodeEmbedUrl(request.malId, request.episodeNumber, "sub"));
    addServer("MegaPlay MAL (Dub)", buildEpisodeEmbedUrl(request.malId, request.episodeNumber, "dub"));
    addServer(
      "MegaPlay MAL Mirror (Sub)",
      buildEpisodeEmbedUrl(request.malId, request.episodeNumber, "sub", FALLBACK_EMBED_PROVIDER)
    );
  }

  if (request.trailerUrl) {
    addServer("Trailer (YouTube)", request.trailerUrl);
  }

  return servers;
}
