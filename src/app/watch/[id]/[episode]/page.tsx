"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAnimeInfo, fetchEpisodeServers, AnimeInfo, AnimeEpisode } from "@/lib/animeApi";
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

        const serverList = await fetchEpisodeServers(
          animeId,
          episodeNumber,
          animeData.trailerUrl
        );
        const serversObj: { [key: string]: string } = {};
        serverList.forEach((server) => {
          serversObj[server.name] = server.url;
        });
        setServers(serversObj);
        setCurrentServerUrl(serverList[0].url);
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

            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mt-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                {anime.title} - Episode {episodeNumber}
              </h1>
              <p className="text-gray-300">{currentEpisode.title}</p>

              <div className="flex gap-4 mt-6">
                {previousEpisode ? (
                  <Link
                    href={`/watch/${anime.id}/${previousEpisode.episodeNumber}`}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-800/50 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </div>
                )}
                {nextEpisode ? (
                  <Link
                    href={`/watch/${anime.id}/${nextEpisode.episodeNumber}`}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-800/50 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
                    Next
                    <ChevronRight className="w-5 h-5" />
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
