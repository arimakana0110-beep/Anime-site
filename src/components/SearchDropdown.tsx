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
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const performSearch = async () => {
    if (query.length > 2) {
      try {
        setLoading(true);
        setHasSearched(true);
        setIsOpen(true);
        const searchResults = await searchAnime(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

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
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative max-w-xs md:max-w-sm w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasSearched(false);
            setResults([]);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm bg-slate-900/60 border border-slate-700/50 rounded-full pl-10 pr-20 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <button
          onClick={performSearch}
          disabled={query.length <= 2}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && hasSearched && query.length > 2 && (
        <div
          ref={dropdownRef}
          className="fixed left-4 right-4 top-16 md:absolute md:left-auto md:right-0 md:top-full md:w-96 w-[calc(100vw-2rem)] mt-2 bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-800/80 rounded-2xl overflow-hidden z-50"
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
                    className="flex items-center gap-4 p-3 hover:bg-slate-850/50 rounded-xl transition-all group"
                  >
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-12 h-16 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
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
