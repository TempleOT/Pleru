"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

const GOLDEN_WORDS = [
  "You’re not becoming light — you’re remembering.",
  "Essence moves when ego gets quiet.",
  "Obedience to truth is inner freedom.",
  "Let today be done from presence, not panic.",
  "What you seek is seeking to move through you.",
  "Return to the watcher — the storm is not you.",
  "Love is devotion without possession.",
];

export default function GoldenWord() {
  const [word, setWord] = useState("");

  useEffect(() => {
    const day = new Date().getDate();
    const idx = day % GOLDEN_WORDS.length;
    setWord(GOLDEN_WORDS[idx]);
  }, []);

  const refresh = () => {
    const r = GOLDEN_WORDS[Math.floor(Math.random() * GOLDEN_WORDS.length)];
    setWord(r);
    // later: fetch("/api/golden-word") → setWord(data.word)
  };

  return (
    <div className="flex items-start gap-3 bg-neutral-950/55 border border-amber-400/20 rounded-2xl px-4 py-3 shadow-[0_0_18px_-6px_rgba(255,200,0,0.35)] backdrop-blur-sm transition-all duration-500 min-h-[72px] max-w-[360px]">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 border border-amber-300/40">
        <Sparkles className="h-4 w-4 text-amber-100" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-[0.25em] text-amber-200/70 mb-1">
          Golden Word
        </div>
        <p className="text-sm text-amber-50/95 leading-snug">
          {word || "Align with the One that sees."}
        </p>
      </div>
      <button
        onClick={refresh}
        className="mt-1 rounded-full p-1 hover:bg-amber-200/5 text-amber-200/70 transition"
        aria-label="New golden word"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
}
