import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AnimeGrid from "@/components/AnimeGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchRecentlyAddedAnime } from "@/lib/animeApi";

async function RecentContent() {
  const recentlyAdded = await fetchRecentlyAddedAnime(48);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16">
      <main className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Recently Added</h1>
          <p className="text-gray-400 max-w-2xl">
            Fresh episodes from the streaming catalog with direct iframe embed links.
            Updated daily via Anikoto + MegaPlay.
          </p>
        </div>

        {recentlyAdded.length > 0 ? (
          <AnimeGrid animes={recentlyAdded} title="Latest Uploads" />
        ) : (
          <div className="text-center py-20 text-gray-400">
            No recently added anime available right now. Please try again later.
          </div>
        )}
      </main>
    </div>
  );
}

export default function RecentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <RecentContent />
    </Suspense>
  );
}
