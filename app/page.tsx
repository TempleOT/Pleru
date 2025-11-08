"use client";

import Shell from "@/components/Shell";
import Image from "next/image";
import Link from "next/link";
import ProgressFlame from "@/components/ProgressFlame";
import { useEffect, useState } from "react";

// ───────────────────────────────────────────────────────────────
// Inline Golden Word widget
// ───────────────────────────────────────────────────────────────
const GOLDEN_WORDS = [
  "You’re not becoming light — you’re remembering.",
  "Essence moves when ego gets quiet.",
  "Obedience to truth is inner freedom.",
  "Let today be done from presence, not panic.",
  "What you seek is seeking to live through you.",
  "Return to the watcher — the storm is not you.",
  "Love is devotion without possession.",
];

function GoldenWord() {
  const [word, setWord] = useState("");

  // pick one per day so it's stable
  useEffect(() => {
    const day = new Date().getDate();
    const idx = day % GOLDEN_WORDS.length;
    setWord(GOLDEN_WORDS[idx]);
  }, []);

  const refresh = () => {
    const r = GOLDEN_WORDS[Math.floor(Math.random() * GOLDEN_WORDS.length)];
    setWord(r);
    // later: fetch("/api/golden-word").then(...) to use Ollama
  };

  return (
    <div className="flex items-start gap-3 bg-neutral-950/55 border border-amber-400/20 rounded-2xl px-4 py-3 shadow-[0_0_18px_-6px_rgba(255,200,0,0.35)] backdrop-blur-sm transition-all duration-500 min-h-[72px] w-full md:max-w-[360px]">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 border border-amber-300/40">
        {/* little radiance icon */}
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-amber-200"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        >
          <path d="M12 3v4m0 10v4m5-9h4M3 12h4m9.5-5.5L19 5m-14 14 1.5-1.5m0-11L5 5m14 14-1.5-1.5" />
        </svg>
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
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        >
          <path d="M4 4v6h6M20 20v-6h-6" />
          <path d="M5 14a7 7 0 0 0 11 3l1-.9M19 10a7 7 0 0 0-11-3l-1 .9" />
        </svg>
      </button>
    </div>
  );
}

export default function Page() {
  // ─── State (kept from your original) ─────────────────────────
  const [form, setForm] = useState({
    year: 1999,
    month: 5,
    day: 28,
    hour: 21.2, // UTC decimal
    lat: 33.7475,
    lon: -116.9710,
    house_system: "P",
  });
  const [identity, setIdentity] = useState<any | null>(null);
  const [reading, setReading] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<{ compute?: boolean; interpret?: boolean }>({});

  const setNum = (k: keyof typeof form) => (e: any) =>
    setForm((f) => ({ ...f, [k]: Number(e.target.value) }));

  async function compute() {
    setErr("");
    setReading("");
    setBusy((b) => ({ ...b, compute: true }));
    try {
      const r = await fetch("/api/divine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok || data?.error) throw new Error(data?.error || "Compute failed");
      setIdentity(data);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy((b) => ({ ...b, compute: false }));
    }
  }

  async function interpret() {
    if (!identity) return;
    setErr("");
    setBusy((b) => ({ ...b, interpret: true }));
    try {
      const r = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity }),
      });
      const data = await r.json();
      if (!r.ok || data?.error) throw new Error(data?.error || "Interpret failed");
      setReading(data.text);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy((b) => ({ ...b, interpret: false }));
    }
  }

  return (
    <Shell>
      <div className="max-w-5xl mx-auto px-4 lg:px-0">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Image src="/ambient/logo.png" alt="Pleru" width={64} height={64} priority />
          <div>
            <h1 className="text-2xl font-semibold text-gold">Welcome to Pleru</h1>
            <p className="text-neutral-400 mt-1">A quiet place to align with Essence.</p>
          </div>
        </div>

        {/* Progress Flame + Golden Word */}
        <div className="mt-9 flex flex-col md:flex-row gap-4 md:items-center">
          <ProgressFlame level={0.42} />
          <GoldenWord />
        </div>

        {/* Main Links */}
        <div className="mt-10 grid gap-4">
          <Link
            href="/blueprint"
            className="card hover:shadow-gold hover:-translate-y-[1px] transition p-5"
          >
            <div className="text-lg font-medium">Blueprint</div>
            <div className="text-sm text-neutral-400">
              The app’s North Star — pillars, systems, tone.
            </div>
          </Link>

          <Link
            href="/bridge"
            className="card hover:shadow-gold hover:-translate-y-[1px] transition p-5"
          >
            <div className="text-lg font-medium">Bridge</div>
            <div className="text-sm text-neutral-400">
              Translate your soul’s design into daily clarity.
            </div>
          </Link>

          <Link
            href="/reflect"
            className="card hover:shadow-gold hover:-translate-y-[1px] transition p-5"
          >
            <div className="text-lg font-medium">Reflect</div>
          </Link>

          <Link
            href="/alignment"
            className="card hover:shadow-gold hover:-translate-y-[1px] transition p-5"
          >
            <div className="text-lg font-medium">Alignment</div>
            <div className="text-sm text-neutral-400">
              Daily synchrony — today’s frequency pulse.
            </div>
          </Link>

          <Link
            href="/codex"
            className="card hover:shadow-gold hover:-translate-y-[1px] transition p-5"
          >
            <div className="text-lg font-medium">Codex</div>
            <div className="text-sm text-neutral-400">
              Ego ↔ Essence entries and Temple Keys.
            </div>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
