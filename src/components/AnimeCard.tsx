import Link from "next/link";
import { Star } from "lucide-react";
import { AnimeInfo } from "@/lib/animeApi";

interface AnimeCardProps {
  anime: AnimeInfo;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden">
          {anime.isRecentlyAdded && (
            <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
              New
            </span>
          )}
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full aspect-[2/3] object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {anime.rating && (
              <div className="flex items-center gap-1 text-yellow-400 mb-2">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="text-sm font-semibold">{anime.rating}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs bg-purple-600/80 text-white px-2 py-1 rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">
            {anime.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            {anime.episodeCount ?? anime.episodes.length ?? 0} Episodes
          </p>
        </div>
      </div>
    </Link>
  );
}
