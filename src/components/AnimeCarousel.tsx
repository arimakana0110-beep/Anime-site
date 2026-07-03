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
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth px-4 sm:px-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`${sectionName}-skeleton-${i}`}
              className="flex-shrink-0 w-[110px] sm:w-[140px] md:w-[160px] lg:w-[180px] aspect-[2/3] bg-gray-800 rounded-xl animate-pulse snap-start"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth px-4 sm:px-0">
          {animes.map((anime, index) => {
            const uniqueKey = anime.catalogId || anime.malId || anime.id;
            return (
              <div
                key={`${sectionName}-${uniqueKey}-${index}`}
                className="flex-shrink-0 snap-start"
              >
                <AnimeCard anime={anime} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
