"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, X, Music2 } from "lucide-react"; // ⬅️ added Music2
import Link from "next/link"; // ⬅️ added Link
import AmbientPlayer from "./AmbientPlayer";

type Props = {
  /** Set false to hide the top-right button (keep your left one). */
  showFloatingToggle?: boolean;
};

export default function SettingsPanel({ showFloatingToggle = true }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Persistent, hidden audio element so music keeps playing ── */}
      <div aria-hidden className="fixed -bottom-96 -left-96 opacity-0 pointer-events-none">
        <AmbientPlayer />
      </div>

      {/* Optional floating toggle (we’ll disable it in Shell) */}
      {showFloatingToggle && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
        >
          <Settings className="h-4 w-4 text-yellow-400" />
          Settings
        </button>
      )}

      {/* ── Drawer (kept mounted; we slide it instead of unmounting) ── */}
      <div
        className={[
          "fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <motion.div
          className="h-full w-[min(90vw,400px)] bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto"
          animate={{ x: open ? 0 : 500 }}
          initial={false}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-200"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Ambient (controls only; player lives above, persists) ── */}
          <div className="space-y-2 border border-neutral-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-neutral-200">Ambient</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Play a soft pad tone or your own chosen track.
            </p>

            {/* Reuse the same component for the controls UI */}
            <AmbientPlayer />

            {/* ➕ NEW: open the Music ⇄ Numerology interpreter */}
            <div className="pt-2">
              <Link
                href="/music-numerology"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                           border border-yellow-600 text-yellow-400 hover:bg-yellow-500/10
                           transition-colors text-sm"
              >
                <Music2 className="h-4 w-4" />
                Open music interpreter
              </Link>
            </div>
          </div>

          {/* ── Donations ── */}
          <div className="space-y-2 border border-neutral-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-neutral-200">Donations</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              If this work helps you, your support sustains the temple.
            </p>
            <button
              onClick={() => window.open("https://your-donation-link.com", "_blank")}
              className="rounded-lg border border-yellow-500/30 text-yellow-400 text-sm px-3 py-1 hover:bg-yellow-500/10"
            >
              Open donation link
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
