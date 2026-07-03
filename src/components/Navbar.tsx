"use client";

import Link from "next/link";
import { Play, Search, Home, TrendingUp, Film } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
            <span className="text-2xl font-bold text-white">AniStream</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Film className="w-4 h-4" />
              <span>Movies</span>
            </Link>
          </div>

          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-800">
            <input
              type="text"
              placeholder="Search anime..."
              className="w-full bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        )}
      </div>
    </nav>
  );
}
