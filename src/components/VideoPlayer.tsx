"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  embedUrl: string;
  posterImage: string;
  title: string;
}

export default function VideoPlayer({ embedUrl, posterImage, title }: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [embedUrl]);

  const handlePlay = () => {
    setIsLoaded(true);
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      {!isLoaded ? (
        <div
          className="relative w-full h-full cursor-pointer group"
          onClick={handlePlay}
        >
          <img
            src={posterImage}
            alt={title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-1 rounded">
              Click to play
            </p>
          </div>
        </div>
      ) : (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
        />
      )}
    </div>
  );
}
