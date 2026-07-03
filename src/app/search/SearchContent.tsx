"use client";

import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import AnimeGrid from "@/components/AnimeGrid";
import { searchAnime, AnimeInfo } from "@/lib/animeApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState, useEffect } from "react";

// Helper function to deduplicate anime by ID
function deduplicateAnime(animeArray: AnimeInfo[]): AnimeInfo[] {
  return Array.from(new Map(animeArray.map(item => [item.id, item])).values());
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<AnimeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function performSearch() {
      if (query) {
        try {
          setLoading(true);
          setError(null);
          const searchResults = await searchAnime(query);
          const animeResults: AnimeInfo[] = searchResults.map((result) => ({
            id: result.id,
            title: result.title,
            description: result.releaseDate ? `Released: ${result.releaseDate}` : "",
            genres: [],
            image: result.image,
            episodes: [],
          }));
          setResults(deduplicateAnime(animeResults));
        } catch (err) {
          console.error("Error searching anime:", err);
          setError("Failed to search anime");
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {query ? `Search Results for "${query}"` : "Search"}
          </h1>
          <p className="text-gray-400">
            {query
              ? loading
                ? "Searching..."
                : `Found ${results.length} result${results.length !== 1 ? "s" : ""}`
              : "Enter a search term to find anime"}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="text-gray-400 mt-4">Searching...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Error</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : query && results.length > 0 ? (
          <AnimeGrid animes={results} title="Results" sectionName="search" />
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No results found</h2>
            <p className="text-gray-500">
              Try searching for a different term or browse our popular shows
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Start searching</h2>
            <p className="text-gray-500">Use the search bar to find your favorite anime</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 AniStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
