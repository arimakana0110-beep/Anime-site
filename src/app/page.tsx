"use client";

import Link from "next/link";
import { Play, Star } from "lucide-react";
import AnimeCarousel from "@/components/AnimeCarousel";
import SearchDropdown from "@/components/SearchDropdown";
import { fetchTrendingAnime, fetchPopularAnime, fetchUpcomingAnime, fetchTopMovies, AnimeInfo } from "@/lib/animeApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState, useEffect } from "react";

// Helper function to deduplicate anime by ID
function deduplicateAnime(animeArray: AnimeInfo[]): AnimeInfo[] {
  return Array.from(new Map(animeArray.map(item => [item.id, item])).values());
}

// Helper function to filter out anime with 0 episodes (for active categories)
function filterActiveAnime(animeArray: AnimeInfo[]): AnimeInfo[] {
  return animeArray.filter(anime => anime.episodes && anime.episodes.length > 0);
}

export default function Home() {
  const [trending, setTrending] = useState<AnimeInfo[]>([]);
  const [popular, setPopular] = useState<AnimeInfo[]>([]);
  const [upcoming, setUpcoming] = useState<AnimeInfo[]>([]);
  const [movies, setMovies] = useState<AnimeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [trendingData, popularData, upcomingData, moviesData] = await Promise.all([
          fetchTrendingAnime(),
          fetchPopularAnime(),
          fetchUpcomingAnime(),
          fetchTopMovies(),
        ]);
        setTrending(filterActiveAnime(deduplicateAnime(trendingData)));
        setPopular(filterActiveAnime(deduplicateAnime(popularData)));
        setUpcoming(deduplicateAnime(upcomingData)); // Upcoming exempt from 0-episode filter
        setMovies(filterActiveAnime(deduplicateAnime(moviesData)));
      } catch (error) {
        console.error('Error fetching anime data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const featuredAnime = trending[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Loading anime data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16">
      {/* Hero Section */}
      {featuredAnime && (
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredAnime.cover || featuredAnime.image}
              alt={featuredAnime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/40 to-transparent" />
          </div>
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  TRENDING NOW
                </span>
                {featuredAnime.rating && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-5 h-5 fill-yellow-400" />
                    <span className="font-semibold">{featuredAnime.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                {featuredAnime.title}
              </h1>
              <p className="text-gray-300 text-lg mb-6 line-clamp-3">
                {featuredAnime.description}
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/anime/${featuredAnime.id}`}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                  Watch Now
                </Link>
                <Link
                  href={`/anime/${featuredAnime.id}`}
                  className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm"
                >
                  More Info
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Bar Section */}
      <section className="container mx-auto px-4 -mt-16 relative z-10">
        <SearchDropdown />
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {trending.length > 0 && (
          <AnimeCarousel animes={trending} title="Trending Now" sectionName="trending" viewAllLink="/search?q=airing" />
        )}
        {popular.length > 0 && (
          <AnimeCarousel animes={popular} title="Most Popular of All Time" sectionName="popular" viewAllLink="/search?q=popular" />
        )}
        {upcoming.length > 0 && (
          <AnimeCarousel animes={upcoming} title="Top Upcoming Anticipated Shows" sectionName="upcoming" viewAllLink="/search?q=upcoming" />
        )}
        {movies.length > 0 && (
          <AnimeCarousel animes={movies} title="Top Anime Movies" sectionName="movies" viewAllLink="/search?q=movie" />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 AniStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
