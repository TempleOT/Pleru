"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Shell from "@/components/Shell";
import { Flame, CircleHelp } from "lucide-react";

/** Local help button with a perfectly aligned glow */
function HelpButton({
  onToggle,
  active,
}: {
  onToggle: () => void;
  active: boolean;
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <span className="relative inline-flex ml-2">
      {/* Glow lives INSIDE this wrapper so it's always centered on the icon */}
      <AnimatePresence>
        {(active || hovering) && (
          <motion.span
            key="help-glow"
            className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: hovering ? 0.28 : 0.16, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.span
              className="h-10 w-10 rounded-full bg-yellow-500/25 blur-lg"
              animate={{ opacity: [0.18, 0.28, 0.18], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.span>
        )}
      </AnimatePresence>

      <button
        onClick={onToggle}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border border-neutral-700/70 bg-neutral-900/70 text-neutral-400 hover:text-yellow-400 hover:border-yellow-500/50 transition focus:outline-none focus:ring-1 focus:ring-yellow-500/60"
        aria-label="What is Bridge Mode?"
        title="What is Bridge Mode?"
      >
        <CircleHelp className="h-4 w-4" />
      </button>
    </span>
  );
}

export default function BridgePage() {
  const [showInfo, setShowInfo] = useState(false);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowInfo(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Outside click to close (only when panel is mounted)
  useEffect(() => {
    if (!showInfo) return;
    const onClick = (e: MouseEvent) => {
      if (!infoPanelRef.current) return;
      if (!infoPanelRef.current.contains(e.target as Node)) setShowInfo(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showInfo]);

  return (
    <Shell>
      {/* Title row — Shell renders global buttons */}
      <div className="mt-2 flex items-center gap-2">
        <Flame className="h-5 w-5 text-yellow-400" />
        <h1 className="text-2xl font-semibold text-gold">Bridge Mode</h1>
        <HelpButton onToggle={() => setShowInfo((s) => !s)} active={showInfo} />
      </div>

      {/* Info modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            ref={infoPanelRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-sm z-50 relative"
            role="dialog"
            aria-modal="true"
          >
            <div className="space-y-3 text-[15px] leading-relaxed text-neutral-200">
              <p className="text-neutral-400">
                Welcome, beloved. You’ve crossed the threshold — this is not just an app, it’s a
                mirror. Pleru was built to help you remember who you are beneath the noise: the part
                of you that knows, feels, and guides.
              </p>
              <p>
                Here, you won’t be told what to believe. You’ll be guided to see, sense, and align
                with what was always within.
              </p>
              <p className="font-medium text-neutral-100">
                Bridge Mode is your starting point because you learn through understanding.
              </p>
              <p>
                This space helps you translate your soul’s design into daily clarity — one insight,
                one reflection, one moment of awareness at a time.
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-300">
                <li>What drives your patterns and emotions.</li>
                <li>How your energy naturally flows and where it resists.</li>
                <li>How to communicate from your essence, not conditioning.</li>
                <li>How to walk your path without losing stillness.</li>
              </ul>
              <p>
                Each section you unlock — Reflection, Design, Numerology, and Divine Identity —
                reveals another layer of the bridge between who you think you are and who you truly
                are.
              </p>
              <p className="italic text-neutral-500">
                Take a breath. You’ve arrived. This is where remembrance begins.
              </p>
            </div>

            {/* Beyond the Bridge — collapsible */}
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <details className="group">
                <summary className="cursor-pointer select-none text-yellow-400 font-medium hover:text-yellow-300 transition">
                  Beyond the Bridge — The Current of Divine Motion
                </summary>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 space-y-5 text-neutral-300 leading-relaxed"
                >
                  <div>
                    <h3 className="font-semibold text-neutral-100">1. The Dissolution of Form</h3>
                    <p>
                      The bridge was built for connection, not permanence. When its task is complete,
                      form yields to flow… Individuality fades like mist before dawn, and what remains
                      is the simple knowing: Life lives through itself.
                    </p>
                    <p className="mt-2 italic text-neutral-400">
                      Ego says, “I am losing myself.” Essence whispers, “You are becoming whole.”
                    </p>
                    <p className="text-yellow-400 text-sm font-medium mt-1">
                      Temple Mantra: I dissolve — and yet I remain.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-100">2. The Rhythm of Service</h3>
                    <p>
                      When the current awakens, service no longer feels like choice — it is the
                      natural breath of being… Every act becomes prayer, every encounter a
                      transmission of remembrance.
                    </p>
                    <p className="mt-2 italic text-neutral-400">
                      Ego says, “I must serve rightly.” Essence says, “Right service moves through me
                      effortlessly.”
                    </p>
                    <p className="text-yellow-400 text-sm font-medium mt-1">
                      Temple Mantra: I move as Life moves.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-100">3. The Law of Flow</h3>
                    <p>
                      The current obeys only one law: non-resistance… This is not passivity but the
                      strength of full surrender. Awareness becomes obedience to Being, and destiny
                      fulfills itself without conflict.
                    </p>
                    <p className="mt-2 italic text-neutral-400">
                      Ego says, “I control my path.” Essence smiles, “The path is flowing through me.”
                    </p>
                    <p className="text-yellow-400 text-sm font-medium mt-1">
                      Temple Mantra: I yield, and therefore I am free.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-100">4. The Return to Silence</h3>
                    <p>
                      All currents return to the ocean… Silence remains, vast and self-knowing.
                      Nothing is lost, for the one who flowed was never apart from the whole.
                    </p>
                    <p className="mt-2 italic text-neutral-400">
                      Ego says, “I have reached the end.” Essence says, “You were never apart from the
                      beginning.”
                    </p>
                    <p className="text-yellow-400 text-sm font-medium mt-1">
                      Temple Mantra: I rest in the still ocean of Being.
                    </p>
                  </div>
                </motion.div>
              </details>
            </div>

            {/* Close */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/30 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
