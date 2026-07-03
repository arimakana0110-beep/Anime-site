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
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {episodes.map((episode) => (
          <Link
            key={episode.episodeId}
            href={`/watch/${animeId}/${episode.episodeNumber}`}
            className={`bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 font-medium py-3 rounded-xl hover:bg-slate-800/60 text-center transition-all ${
              currentEpisode === episode.episodeNumber
                ? "bg-purple-600 border-purple-500 text-white font-bold"
                : ""
            }`}
          >
            {episode.episodeNumber}
          </Link>
        ))}
      </div>
    </div>
  );
}
