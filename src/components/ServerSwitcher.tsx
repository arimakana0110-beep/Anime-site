"use client";

import { useEffect, useState } from "react";

interface ServerSwitcherProps {
  servers: { [key: string]: string };
  onServerChange: (serverUrl: string) => void;
}

export default function ServerSwitcher({ servers, onServerChange }: ServerSwitcherProps) {
  const [activeServer, setActiveServer] = useState(Object.keys(servers)[0]);

  useEffect(() => {
    const firstServer = Object.keys(servers)[0];
    if (firstServer) {
      setActiveServer(firstServer);
    }
  }, [servers]);

  const handleServerClick = (serverName: string, serverUrl: string) => {
    setActiveServer(serverName);
    onServerChange(serverUrl);
  };

  const serverEntries = Object.entries(servers);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
        Server Switcher
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3">
        {serverEntries.map(([serverName, serverUrl], index) => {
          const isDub = serverName.toLowerCase().includes('dub');
          const label = isDub ? `Server ${index + 1} (Dub)` : `Server ${index + 1}`;

          return (
            <button
              key={serverName}
              onClick={() => handleServerClick(serverName, serverUrl)}
              className={`bg-slate-900/80 border border-slate-800/60 rounded-xl py-2 px-1 text-xs text-slate-300 font-medium tracking-wide transition-all hover:bg-slate-800 text-center truncate ${
                activeServer === serverName
                  ? "bg-purple-600 text-white font-bold border-purple-500 shadow-md shadow-purple-900/20"
                  : ""
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
