"use client";

import Link from "next/link";
import { Play, Star } from "lucide-react";
import AnimeCarousel from "@/components/AnimeCarousel";
import {
  fetchRecentlyAddedAnime,
  fetchTrendingAnime,
  fetchPopularAnime,
  fetchUpcomingAnime,
  fetchTopMovies,
  AnimeInfo,
} from "@/lib/animeApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState, useEffect } from "react";

function getAnimeUniqueId(anime: AnimeInfo): string {
  return anime.catalogId || anime.malId || anime.id;
}

function deduplicateAnime(animeArray: AnimeInfo[]): AnimeInfo[] {
  const seen = new Set<string>();
  return animeArray.filter((anime) => {
    const id = getAnimeUniqueId(anime);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function filterActiveAnime(animeArray: AnimeInfo[]): AnimeInfo[] {
  return animeArray.filter((anime) => (anime.episodeCount ?? anime.episodes.length) > 0);
}

export default function Home() {
  const [recentlyAdded, setRecentlyAdded] = useState<AnimeInfo[]>([]);
  const [trending, setTrending] = useState<AnimeInfo[]>([]);
  const [popular, setPopular] = useState<AnimeInfo[]>([]);
  const [upcoming, setUpcoming] = useState<AnimeInfo[]>([]);
  const [movies, setMovies] = useState<AnimeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const recentData = await fetchRecentlyAddedAnime(24);
        setRecentlyAdded(recentData);

        const trendingData = await fetchTrendingAnime();
        const popularData = await fetchPopularAnime();
        const upcomingData = await fetchUpcomingAnime();
        const moviesData = await fetchTopMovies();

        // Deduplicate across all sections using catalogId when available, otherwise malId
        const allAnime = [...trendingData, ...popularData, ...upcomingData, ...moviesData];
        const uniqueAnimeMap = new Map<string, AnimeInfo>();

        allAnime.forEach((anime) => {
          const key = anime.catalogId || anime.malId || anime.id;
          if (!uniqueAnimeMap.has(key)) {
            uniqueAnimeMap.set(key, anime);
          }
        });

        const uniqueAnime = Array.from(uniqueAnimeMap.values());

        // Separate back into categories, keeping only those that belong to each
        const trendingIds = new Set(trendingData.map(a => a.catalogId || a.malId || a.id));
        const popularIds = new Set(popularData.map(a => a.catalogId || a.malId || a.id));
        const upcomingIds = new Set(upcomingData.map(a => a.catalogId || a.malId || a.id));
        const moviesIds = new Set(moviesData.map(a => a.catalogId || a.malId || a.id));

        const filteredTrending = uniqueAnime.filter(a => trendingIds.has(a.catalogId || a.malId || a.id));
        const filteredPopular = uniqueAnime.filter(a => popularIds.has(a.catalogId || a.malId || a.id));
        const filteredUpcoming = uniqueAnime.filter(a => upcomingIds.has(a.catalogId || a.malId || a.id));
        const filteredMovies = uniqueAnime.filter(a => moviesIds.has(a.catalogId || a.malId || a.id));

        // Deduplicate within each section to ensure no duplicates
        const dedupeSection = (animeArray: AnimeInfo[]) => {
          const seen = new Set<string>();
          return animeArray.filter(a => {
            const key = a.catalogId || a.malId || a.id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };

        setTrending(filterActiveAnime(dedupeSection(filteredTrending)));
        setPopular(filterActiveAnime(dedupeSection(filteredPopular)));
        setUpcoming(dedupeSection(filteredUpcoming));
        setMovies(filterActiveAnime(dedupeSection(filteredMovies)));
      } catch (error) {
        console.error("Error fetching anime data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const featuredAnime = recentlyAdded[0] || trending[0];

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
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {featuredAnime.isRecentlyAdded ? "JUST ADDED" : "TRENDING NOW"}
                </span>
                {featuredAnime.rating && featuredAnime.rating > 0 && (
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
              <div className="flex gap-4 flex-wrap">
                <Link
                  href={`/watch/${featuredAnime.id}/1`}
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

      <main className="container mx-auto px-4 py-12">
        {recentlyAdded.length > 0 && (
          <AnimeCarousel
            animes={deduplicateAnime(recentlyAdded)}
            title="Recently Added"
            sectionName="recent"
            viewAllLink="/recent"
          />
        )}
        {trending.length > 0 && (
          <AnimeCarousel
            animes={deduplicateAnime(trending)}
            title="Trending Now"
            sectionName="trending"
            viewAllLink="/search?q=airing"
          />
        )}
        {popular.length > 0 && (
          <AnimeCarousel
            animes={deduplicateAnime(popular)}
            title="Most Popular of All Time"
            sectionName="popular"
            viewAllLink="/search?q=popular"
          />
        )}
        {upcoming.length > 0 && (
          <AnimeCarousel
            animes={deduplicateAnime(upcoming)}
            title="Top Upcoming Anticipated Shows"
            sectionName="upcoming"
            viewAllLink="/search?q=upcoming"
          />
        )}
        {movies.length > 0 && (
          <AnimeCarousel
            animes={deduplicateAnime(movies)}
            title="Top Anime Movies"
            sectionName="movies"
            viewAllLink="/search?q=movie"
          />
        )}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 AniStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
