"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function InfoBar() {
  const KEY = "pleru:infobar:dismissed";
  const [show, setShow] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    const dismissed = localStorage.getItem(KEY) === "true";
    if (!dismissed) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, "true");
    setShow(false);
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {/* ── Fixed Back button beside the sun icon ───────────────────── */}
      {!onHome && (
        <div className="fixed top-4 left-[4.25rem] z-50">
          <button
            onClick={goBack}
            aria-label="Go back"
            title="Back"
            className={[
              "grid h-10 w-10 place-items-center rounded-full", // same size as Sun button
              "border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900",
              "text-neutral-300 transition-colors"
            ].join(" ")}
          >
            <ArrowLeft className="h-5 w-5 text-yellow-400" /> {/* slightly larger icon */}
          </button>
        </div>
      )}

      {/* ── Dismissible info bar (unchanged) ────────────────────────── */}
      {show && (
        <div
          role="region"
          aria-label="About Pleru"
          className="rounded-xl border border-gold/30 bg-neutral-900/60 text-neutral-200"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm">
              <span className="text-gold font-medium">Pleru</span> is a quiet place to align with Essence —
              Bridge • Reflect • Codex.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="/about"
                className="px-3 py-1.5 rounded-lg text-sm border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
              >
                Learn more
              </a>
              <button
                onClick={dismiss}
                aria-label="Dismiss info"
                className="px-2 py-1 rounded-lg text-sm border border-neutral-700 hover:bg-neutral-800 text-neutral-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
