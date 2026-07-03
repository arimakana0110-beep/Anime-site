import { AnimeInfo } from "@/lib/animeApi";
import AnimeCard from "./AnimeCard";
import Link from "next/link";

interface AnimeCarouselProps {
  animes: AnimeInfo[];
  title: string;
  loading?: boolean;
  sectionName?: string;
  viewAllLink?: string;
}

export default function AnimeCarousel({ animes, title, loading, sectionName = "default", viewAllLink }: AnimeCarouselProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-purple-500 rounded"></span>
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-xs sm:text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All
          </Link>
        )}
      </div>
      
      {loading ? (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`${sectionName}-skeleton-${i}`}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] aspect-[2/3] bg-gray-800 rounded-xl animate-pulse snap-start"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth">
          {animes.map((anime) => (
            <div
              key={`${anime.id}-${sectionName}`}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] snap-start"
            >
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
