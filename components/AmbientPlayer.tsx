"use client";

import React, { useEffect, useRef } from "react";
import { Play, Pause, Music, Link as LinkIcon, Upload } from "lucide-react";
import { useAmbient } from "./AmbientProvider"; // uses the global provider

// Make sure the file exists at: public/ambient/pad.mp3
const BUILTIN_SRC = "/ambient/pad.mp3";

export default function AmbientPlayer() {
  const { state, setMode, setVolume, setLoop, play, pause } = useAmbient();
  const objectUrlRef = useRef<string | null>(null);

  // ensure any previous object URL is cleaned up
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // --- Sources ----------------------------------------------------------------
  const useBuiltin = () => {
    // IMPORTANT: pass the src so the provider knows what to load
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setMode("builtin", BUILTIN_SRC);
  };

  const useUrl = () => {
    const url = prompt("Paste a direct audio URL (mp3/wav/ogg):")?.trim();
    if (!url) return;
    setMode("url", url);
  };

  const useFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = () => {
      const file = (input.files && input.files[0]) || null;
      if (!file) return;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setMode("file", url);
    };
    input.click();
  };

  return (
    <div className="space-y-3">
      {/* Play / Pause */}
      <div className="flex items-center gap-2">
        {!state.isPlaying ? (
          <button
            onClick={() => void play()}
            className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
            aria-label="Play ambient"
          >
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Play</span>
            </div>
          </button>
        ) : (
          <button
            onClick={pause}
            className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
            aria-label="Pause ambient"
          >
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </div>
          </button>
        )}

        <span className="text-sm text-neutral-400">
          Source:{" "}
          {state.mode === "builtin"
            ? "Built-in pad"
            : state.mode === "url"
            ? "URL"
            : "Local file"}
        </span>
      </div>

      {/* Source pickers */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={useBuiltin}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
          title="Use built-in pad tone"
        >
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Built-in pad
          </div>
        </button>
        <button
          onClick={useUrl}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
          title="Use an external URL"
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Use URL
          </div>
        </button>
        <button
          onClick={useFile}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
          title="Upload a local audio file"
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Use local file
          </div>
        </button>
      </div>

      {/* Volume + Loop */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-neutral-400">Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={state.volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-48 accent-yellow-400"
        />
        <label className="ml-2 inline-flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={state.loop}
            onChange={(e) => setLoop(e.target.checked)}
          />
          Loop
        </label>
      </div>

      <p className="text-xs text-neutral-500">
        Tip: Mobile/iOS browsers require a user click before audio can start.
      </p>
    </div>
  );
}
