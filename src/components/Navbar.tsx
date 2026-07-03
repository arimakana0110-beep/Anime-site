"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import SearchDropdown from "./SearchDropdown";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="flex items-center justify-between w-full px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
          <span className="text-2xl font-bold text-white">AniStream</span>
        </Link>

        {/* Search Bar */}
        <SearchDropdown />
      </div>
    </nav>
  );
}
