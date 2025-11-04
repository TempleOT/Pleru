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

  // Convert local time (HH:MM) + timezone offset → UTC decimal hour
  function toUtcDecimal(localTime: string, tzOffset: number): number {
    const [h, m] = localTime.split(":").map(Number);
    const localDecimal = h + m / 60;
    return localDecimal - tzOffset;
  }

  // Fetch coordinates from location search
  async function fetchCoords(place: string) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
      const data = await r.json();
      if (data?.[0]) {
        setForm((f) => ({
          ...f,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        }));
      } else setErr("Location not found");
    } catch (e) {
      setErr("Failed to fetch location");
    }
  }

  // ─── Compute + Interpret ───────────────────────────────
  async function compute() {
    setErr(""); setReading(""); setBusy((b) => ({ ...b, compute: true }));
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
    setErr(""); setBusy((b) => ({ ...b, interpret: true }));
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
      {/* Header */}
      <div className="flex items-center gap-6">
        <Image src="/ambient/logo.png" alt="Pleru" width={64} height={64} priority />
        <div>
          <h1 className="text-2xl font-semibold text-gold">Welcome to Pleru</h1>
          <p className="text-neutral-400 mt-1">A quiet place to align with Essence.</p>
        </div>
      </div>

      {/* Progress Flame */}
      <div className="mt-8">
        <ProgressFlame level={0.42} />
      </div>

      {/* Main Links */}
      <div className="mt-10 grid gap-4">
        <Link href="/blueprint" className="card hover:shadow-gold transition p-5">
          <div className="text-lg font-medium">Blueprint</div>
          <div className="text-sm text-neutral-400">
            The app’s North Star — pillars, systems, tone.
          </div>
        </Link>

        <Link href="/bridge" className="card hover:shadow-gold transition p-5">
          <div className="text-lg font-medium">Bridge</div>
          <div className="text-sm text-neutral-400">
            Translate your soul’s design into daily clarity.
          </div>
        </Link>

        <div className="card transition p-5 border border-neutral-800">
          <div className="text-lg font-medium text-gold mb-2">Reflect — Divine Identity</div>

          {/* 🌍 Location Search */}
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              placeholder="Enter location (e.g. Hemet, CA)"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchCoords((e.target as HTMLInputElement).value);
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector("input[placeholder^='Enter location']") as HTMLInputElement;
                if (input?.value) fetchCoords(input.value);
              }}
              className="px-3 py-2 bg-emerald-600 rounded-md hover:bg-emerald-500"
            >
              Search
            </button>
          </div>

          {/* ⏰ Time Converter */}
          <div className="flex flex-wrap gap-3 mb-3">
            <input
              type="text"
              placeholder="Local time (e.g. 2:12)"
              className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2"
              id="local-time"
            />
            <input
              type="number"
              step="0.25"
              placeholder="UTC offset (e.g. -8)"
              className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 w-36"
              id="tz-offset"
            />
            <button
              className="px-3 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500"
              onClick={() => {
                const local = (document.getElementById("local-time") as HTMLInputElement)?.value;
                const tz = parseFloat((document.getElementById("tz-offset") as HTMLInputElement)?.value);
                if (local && !isNaN(tz)) {
                  const utcDec = toUtcDecimal(local, tz);
                  setForm((f) => ({ ...f, hour: utcDec }));
                  alert(`Converted to UTC decimal: ${utcDec.toFixed(2)}`);
                }
              }}
            >
              Convert Time
            </button>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(["year", "month", "day", "hour", "lat", "lon"] as const).map((f) => (
              <label key={f} className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-400">{f.toUpperCase()}</span>
                <input
                  className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2"
                  type="number"
                  step={f === "hour" ? "0.01" : f === "lat" || f === "lon" ? "0.0001" : "1"}
                  value={form[f]}
                  onChange={setNum(f)}
                />
              </label>
            ))}

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-400">HOUSE SYSTEM</span>
              <select
                className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2"
                value={form.house_system}
                onChange={(e) => setForm((f) => ({ ...f, house_system: e.target.value }))}
              >
                <option value="P">Placidus (P)</option>
                <option value="K">Koch (K)</option>
                <option value="W">Whole Sign (W)</option>
                <option value="E">Equal (E)</option>
                <option value="R">Regiomontanus (R)</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={compute}
              disabled={busy.compute}
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              {busy.compute ? "Computing…" : "Compute Divine Identity"}
            </button>
            <button
              onClick={interpret}
              disabled={!identity || busy.interpret}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy.interpret ? "Asking Ollama…" : "Interpret with Ollama (Ego ↔ Essence)"}
            </button>
          </div>

          {err && <div className="text-red-400 text-sm mt-3 border border-red-700/50 rounded-md p-3">{err}</div>}

          {identity && (
            <div className="border border-neutral-800 rounded-md p-4 mt-4 space-y-3">
              <h3 className="font-medium">Core</h3>
              <div className="text-sm grid sm:grid-cols-2 gap-2">
                <div>Sun: {identity.core.sun.sign} {identity.core.sun.deg}°</div>
                <div>Moon: {identity.core.moon.sign} {identity.core.moon.deg}°</div>
                <div>Asc: {identity.core.asc.sign} {identity.core.asc.deg}°</div>
                <div>MC: {identity.core.mc}°</div>
              </div>
            </div>
          )}

          {reading && (
            <div className="border border-neutral-800 rounded-md p-4 mt-4 space-y-3">
              <h3 className="font-medium text-gold">Temple of Truth Reading</h3>
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">{reading}</div>
            </div>
          )}
        </div>

        <Link href="/codex" className="card hover:shadow-gold transition p-5">
          <div className="text-lg font-medium">Codex</div>
          <div className="text-sm text-neutral-400">
            Ego ↔ Essence entries and Temple Keys.
          </div>
        </Link>
      </div>
    </Shell>
  );
}
