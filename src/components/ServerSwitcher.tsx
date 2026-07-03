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

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
        Server Switcher
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(servers).map(([serverName, serverUrl]) => (
          <button
            key={serverName}
            onClick={() => handleServerClick(serverName, serverUrl)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeServer === serverName
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] border-2 border-purple-400"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-2 border-transparent"
            }`}
          >
            {serverName}
          </button>
        ))}
      </div>
    </div>
  );
}
