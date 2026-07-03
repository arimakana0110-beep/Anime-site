import { AnimeInfo } from "@/lib/animeApi";
import AnimeCard from "./AnimeCard";

interface AnimeGridProps {
  animes: AnimeInfo[];
  title: string;
  sectionName?: string;
}

export default function AnimeGrid({ animes, title, sectionName = "default" }: AnimeGridProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-8 bg-purple-500 rounded"></span>
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {animes.map((anime) => (
          <AnimeCard key={`${anime.id}-${sectionName}`} anime={anime} />
        ))}
      </div>
    </section>
  );
}
