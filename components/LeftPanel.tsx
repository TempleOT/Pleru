"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sun, X, Info, Heart } from "lucide-react";
import { motion } from "framer-motion";

export function LeftPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (open && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      {/* Top-left circular toggle (same look as before) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900"
        aria-label="Open Pleru topics"
        title="Pleru topics"
      >
        <Sun className="h-5 w-5 text-yellow-400" />
      </button>

      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Left-docked drawer */}
      <motion.aside
        ref={panelRef}
        className={[
          "fixed left-0 top-0 z-50 h-full w-[min(96vw,720px)] sm:w-[640px]",
          "border-r border-neutral-800 bg-neutral-950/95 shadow-2xl",
          "flex flex-col",
        ].join(" ")}
        animate={{ x: open ? 0 : -720 }}
        initial={false}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-400" />
            <h2 className="font-semibold tracking-wide">Pleru topics</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800"
            aria-label="Close panel"
          >
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>Close</span>
            </div>
          </button>
        </div>

        {/* Body — ONLY About + Donations */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* About */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-yellow-400" />
              <h3 className="font-medium">About</h3>
            </div>
            <p className="text-sm text-neutral-300">
              Pleru is a sacred space to remember who you are — Bridge • Reflect • Codex.
            </p>
            <a
              href="/about"
              className="mt-3 inline-block rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
            >
              Open About
            </a>
          </section>

          {/* Donations */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-yellow-400" />
              <h3 className="font-medium">Donations</h3>
            </div>
            <p className="text-sm text-neutral-300">
              If this work helps you, your support sustains the temple.
            </p>
            <button
              onClick={() => window.open("https://your-donation-link.com", "_blank")}
              className="mt-3 inline-block rounded-lg border border-yellow-500/30 text-yellow-400 text-sm px-3 py-1.5 hover:bg-yellow-500/10"
            >
              Open donation link
            </button>
          </section>
        </div>
      </motion.aside>
    </>
  );
}
