// components/DivineIdentityForm.tsx
"use client";
import { useState } from "react";

type Identity = any;

export default function DivineIdentityForm() {
  const [form, setForm] = useState({
    year: 1999,
    month: 5,
    day: 28,
    hour: 21.2,         // UTC decimal hours
    lat: 33.7475,
    lon: -116.9710,
    house_system: "P",
  });

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [reading, setReading] = useState("");
  const [busy, setBusy] = useState<{ id?: boolean; read?: boolean }>({});
  const [err, setErr] = useState("");

  const setNum = (k: keyof typeof form) => (e: any) =>
    setForm((f) => ({ ...f, [k]: Number(e.target.value) }));

  async function compute() {
    setErr(""); setReading(""); setBusy((b) => ({ ...b, id: true }));
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
      setBusy((b) => ({ ...b, id: false }));
    }
  }

  async function interpret() {
    if (!identity) return;
    setErr(""); setBusy((b) => ({ ...b, read: true }));
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
      setBusy((b) => ({ ...b, read: false }));
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Divine Identity • Compute & Interpret</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">YEAR</span>
          <input className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2" type="number" value={form.year} onChange={setNum("year")} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">MONTH</span>
          <input className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2" type="number" value={form.month} onChange={setNum("month")} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">DAY</span>
          <input className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2" type="number" value={form.day} onChange={setNum("day")} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">HOUR (UTC decimal)</span>
          <input className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2" type="number" step="0.01" value={form.hour} onChange={setNum("hour")} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">LAT</span>
          <input className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2" type="number" step="0.0001" value={form.lat} onChange={setNum("lat")} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">LON</span>
          <input className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2" type="number" step="0.0001" value={form.lon} onChange={setNum("lon")} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">HOUSE</span>
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
            <option value="C">Campanus (C)</option>
          </select>
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={compute} className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50" disabled={busy.id}>
          {busy.id ? "Computing…" : "Compute Divine Identity"}
        </button>
        <button onClick={interpret} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50" disabled={!identity || busy.read}>
          {busy.read ? "Asking Ollama…" : "Interpret with Ollama (Ego ↔ Essence)"}
        </button>
      </div>

      {err && <div className="text-red-400 text-sm border border-red-700/50 rounded-md p-3">{err}</div>}

      {identity && (
        <div className="border border-neutral-800 rounded-md p-4 space-y-3">
          <h3 className="font-medium">Core</h3>
          <div className="text-sm grid sm:grid-cols-2 gap-2">
            <div>Sun: {identity.core.sun.sign} {identity.core.sun.deg}°</div>
            <div>Moon: {identity.core.moon.sign} {identity.core.moon.deg}°</div>
            <div>Asc: {identity.core.asc.sign} {identity.core.asc.deg}°</div>
            <div>MC: {identity.core.mc}°</div>
          </div>
          <h3 className="font-medium mt-3">Houses</h3>
          <pre className="text-xs bg-neutral-950 p-3 rounded-md overflow-auto">{JSON.stringify(identity.houses, null, 2)}</pre>
        </div>
      )}

      {reading && (
        <div className="border border-neutral-800 rounded-md p-4 space-y-3">
          <h3 className="font-medium">Temple of Truth Reading</h3>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">{reading}</div>
        </div>
      )}
    </div>
  );
}
