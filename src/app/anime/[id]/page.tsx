import Link from "next/link";
import { Star, Play, ArrowLeft, Clock } from "lucide-react";
import { fetchAnimeInfo, AnimeInfo } from "@/lib/animeApi";
import { notFound } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default async function AnimeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await fetchAnimeInfo(id);

  if (!anime) {
    notFound();
  }

  const firstEpisode = anime.episodes[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      {/* Banner */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={anime.cover || anime.image}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/40 to-transparent" />
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster and Info */}
          <div className="lg:w-1/3">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full rounded-lg shadow-2xl mb-6"
              />
              {firstEpisode && (
                <Link
                  href={`/watch/${anime.id}/${firstEpisode.episodeNumber}`}
                  className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mb-4"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                  Watch Episode 1
                </Link>
              )}
              <div className="space-y-4">
                {anime.rating && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star className="w-5 h-5 fill-yellow-400" />
                    <span className="text-2xl font-bold">{anime.rating}</span>
                    <span className="text-gray-400">/ 10</span>
                  </div>
                )}
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Episodes</h3>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4" />
                    <span>{anime.episodeCount ?? anime.episodes.length} Episodes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details and Episodes */}
          <div className="lg:w-2/3">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 inline-block"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
              <p className="text-gray-300 leading-relaxed">{anime.description}</p>
            </div>

            {/* Episode List */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Episodes</h2>
              <div className="grid gap-3">
                {anime.episodes.map((episode) => (
                  <Link
                    key={episode.episodeId}
                    href={`/watch/${anime.id}/${episode.episodeNumber}`}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all group"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        Episode {episode.episodeNumber}
                      </h3>
                      <p className="text-gray-400 text-sm">{episode.title}</p>
                    </div>
                    <div className="text-gray-500 group-hover:text-white transition-colors">
                      <Play className="w-6 h-6" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 AniStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
