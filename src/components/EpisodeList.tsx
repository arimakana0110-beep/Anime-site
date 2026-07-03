import Link from "next/link";
import { Play } from "lucide-react";
import { AnimeEpisode } from "@/lib/animeApi";

interface EpisodeListProps {
  episodes: AnimeEpisode[];
  animeId: string;
  currentEpisode?: number;
}

export default function EpisodeList({ episodes, animeId, currentEpisode }: EpisodeListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {episodes.map((episode) => (
          <Link
            key={episode.episodeId}
            href={`/watch/${animeId}/${episode.episodeNumber}`}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              currentEpisode === episode.episodeNumber
                ? "bg-purple-600 text-white"
                : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentEpisode === episode.episodeNumber
                  ? "bg-purple-500"
                  : "bg-gray-700"
              }`}
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Episode {episode.episodeNumber}</p>
              <p className="text-xs opacity-70 truncate">{episode.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
