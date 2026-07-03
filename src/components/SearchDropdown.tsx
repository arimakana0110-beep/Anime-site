"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Star, X, ArrowRight } from "lucide-react";
import { searchAnime, AnimeSearchResult } from "@/lib/animeApi";
import LoadingSpinner from "./LoadingSpinner";

export default function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        try {
          setLoading(true);
          const searchResults = await searchAnime(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.length > 2) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-900/95 backdrop-blur-sm text-white placeholder-gray-400 px-6 py-4 pl-14 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xl"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 2 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-4 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-800 shadow-2xl overflow-hidden z-50"
        >
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
              <p className="text-gray-400 mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              <p className="text-gray-400 text-sm mb-3">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {results.map((anime) => (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                  >
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-16 h-24 object-cover rounded shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">
                        {anime.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        {anime.type && (
                          <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                            {anime.type}
                          </span>
                        )}
                        {anime.score && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            <span>{anime.score}</span>
                          </div>
                        )}
                      </div>
                      {anime.releaseDate && (
                        <p className="text-gray-400 text-xs mt-1">
                          Released: {anime.releaseDate}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-center gap-2 w-full mt-4 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                View all results
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No results found</p>
              <p className="text-gray-500 text-sm mt-1">
                Try searching for a different term
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
