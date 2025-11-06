"use client";
import type { Blueprint, BlueprintInput } from "@/types/blueprint";
import Shell from "@/components/Shell";
import Image from "next/image";
import Link from "next/link";
import ProgressFlame from "@/components/ProgressFlame";
import { useState } from "react";

export default function Page() {
  // ─── State ────────────────────────────────────────────
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

  // ─── Helpers ────────────────────────────────────────────
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

  // ─── UI ────────────────────────────────────────────────
  return (
    <Shell>
      {/* Page container — centers content */}
      <div className="max-w-5xl mx-auto px-4 lg:px-0">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Image src="/ambient/logo.png" alt="Pleru" width={64} height={64} priority />
          <div>
            <h1 className="text-2xl font-semibold text-gold">Welcome to Pleru</h1>
            <p className="text-neutral-400 mt-1">A quiet place to align with Essence.</p>
          </div>
        </div>

        {/* Progress Flame */}
        <div className="mt-9">
          <ProgressFlame level={0.42} />
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

          {/* Reflect */}
          <Link
            href="/reflect"
            className="card hover:shadow-gold hover:-translate-y-[1px] transition p-5"
          >
            <div className="text-lg font-medium">Reflect</div>
          </Link>

          {/* Alignment */}
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
