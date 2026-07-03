"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAnimeInfo, AnimeInfo, AnimeEpisode, isCatalogId } from "@/lib/animeApi";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeList from "@/components/EpisodeList";
import ServerSwitcher from "@/components/ServerSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState, useEffect } from "react";

export default function WatchPage() {
  const params = useParams<{ id: string; episode: string }>();
  const animeId = params.id;
  const episodeNumber = parseInt(params.episode, 10);

  const [anime, setAnime] = useState<AnimeInfo | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<AnimeEpisode | null>(null);
  const [servers, setServers] = useState<{ [key: string]: string }>({});
  const [currentServerUrl, setCurrentServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!animeId || Number.isNaN(episodeNumber)) {
      setError("Invalid episode URL");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const animeData = await fetchAnimeInfo(animeId);
        if (!animeData) {
          setError("Anime not found");
          setLoading(false);
          return;
        }

        const episode = animeData.episodes.find((ep) => ep.episodeNumber === episodeNumber);
        if (!episode) {
          setError("Episode not found");
          setLoading(false);
          return;
        }

        setAnime(animeData);
        setCurrentEpisode(episode);

        const params = new URLSearchParams({
          episode: String(episodeNumber),
        });

        if (animeData.malId) params.set("malId", animeData.malId);
        else if (!isCatalogId(animeId)) params.set("malId", animeId);

        if (episode.episodeEmbedId) params.set("episodeEmbedId", episode.episodeEmbedId);
        if (episode.embedUrls?.sub) params.set("embedSub", episode.embedUrls.sub);
        if (episode.embedUrls?.dub) params.set("embedDub", episode.embedUrls.dub);
        if (animeData.trailerUrl) params.set("trailerUrl", animeData.trailerUrl);

        const serversResponse = await fetch(`/api/stream/servers?${params.toString()}`);
        if (!serversResponse.ok) {
          throw new Error("Failed to load stream servers");
        }

        const { servers: serverList } = (await serversResponse.json()) as {
          servers: { name: string; url: string }[];
        };
        const serversObj: { [key: string]: string } = {};
        serverList.forEach((server) => {
          serversObj[server.name] = server.url;
        });
        setServers(serversObj);
        if (serverList.length > 0) {
          setCurrentServerUrl(serverList[0].url);
        } else {
          setError("No video servers available for this episode.");
        }
      } catch (err) {
        console.error("Error loading episode:", err);
        setError("Failed to load episode data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [animeId, episodeNumber]);

  const handleServerChange = (serverUrl: string) => {
    setCurrentServerUrl(serverUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error || !anime || !currentEpisode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || "Failed to load episode"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentEpisodeIndex = anime.episodes.findIndex(
    (ep) => ep.episodeNumber === episodeNumber
  );
  const previousEpisode = anime.episodes[currentEpisodeIndex - 1];
  const nextEpisode = anime.episodes[currentEpisodeIndex + 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href={`/anime/${anime.id}`}
                className="hover:text-white transition-colors"
              >
                {anime.title}
              </Link>
              <span>/</span>
              <span className="text-white">Episode {episodeNumber}</span>
            </div>

            <VideoPlayer
              embedUrl={currentServerUrl}
              posterImage={anime.cover || anime.image}
              title={`${anime.title} - Episode ${episodeNumber}`}
            />

            {Object.keys(servers).length > 0 && (
              <div className="mt-4">
                <ServerSwitcher
                  servers={servers}
                  onServerChange={handleServerChange}
                />
              </div>
            )}

            <div className="p-4 bg-slate-900/40 border border-slate-900/80 rounded-2xl mt-6">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight line-clamp-1">
                {anime.title} - Episode {episodeNumber}
              </h1>
              <p className="text-gray-300 text-sm mt-1">{currentEpisode.title}</p>

              <div className="flex gap-4 mt-4">
                {previousEpisode ? (
                  <Link
                    href={`/watch/${anime.id}/${previousEpisode.episodeNumber}`}
                    className="text-xs px-4 py-2 rounded-xl bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all font-semibold flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                ) : (
                  <div className="text-xs px-4 py-2 rounded-xl bg-slate-850/50 border border-slate-800/50 text-slate-500 font-semibold cursor-not-allowed flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </div>
                )}
                {nextEpisode ? (
                  <Link
                    href={`/watch/${anime.id}/${nextEpisode.episodeNumber}`}
                    className="text-xs px-4 py-2 rounded-xl bg-purple-600 border border-purple-500 text-white hover:bg-purple-700 transition-all font-semibold flex items-center gap-1.5"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="text-xs px-4 py-2 rounded-xl bg-slate-850/50 border border-slate-800/50 text-slate-500 font-semibold cursor-not-allowed flex items-center gap-1.5">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/4">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">{anime.title}</h2>
              <EpisodeList
                episodes={anime.episodes}
                animeId={anime.id}
                currentEpisode={episodeNumber}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 AniStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
