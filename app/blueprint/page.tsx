"use client";

import type { Blueprint, BlueprintInput } from "@/types/blueprint";
import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { lifePathFromAny } from "@/lib/numerology";

// ── Types for Divine Identity raw payload (from your FastAPI) ──────────────
type Identity = {
  jd: number;
  core: {
    sun: { sign: string; deg: number; lon: number };
    moon: { sign: string; deg: number; lon: number };
    asc: { sign: string; deg: number; lon: number };
    mc: number;
  };
  houses: number[];
  planets: Record<string, { lon: number; lat: number }>;
  aspects: { a: string; b: string; aspect: string; angle: number; orb: number }[];
};

export default function BlueprintPage() {
  // ── UI prefs (persisted) ─────────────────────────────────────
  const [ui, setUi] = useState<{ accent: "gold" | "emerald"; font: "codex" | "system" }>({
    accent: "gold",
    font: "codex",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pleru.ui");
      if (raw) setUi(JSON.parse(raw));
    } catch {}
  }, []);

  // ── Form state ────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Numerology
  const [numerology, setNumerology] = useState<null | {
    lifePath: string;
    birthdayNumber: string;
    notes: string[];
  }>(null);

  const [numDetails, setNumDetails] = useState<
    | null
    | Array<{
        key: string; // lifePath | expression | soulUrge | personality | maturity | balance
        label: string; // "Life Path", etc.
        value: string; // e.g. "7" or "33/6"
        reading: string; // gnosis-style paragraph
      }>
  >(null);

  // Human Design placeholder
  const [humanDesign, setHumanDesign] = useState<null | { summary: string; notes: string[] }>(null);

  // High-level Divine Identity (your existing card)
  const [divineIdentity, setDivineIdentity] = useState<
    | null
    | { sun: string; moon: string; rising: string; role: string; notes: string[] }
  >(null);

  // Raw identity for Ollama interpretation (optional)
  const [identityRaw, setIdentityRaw] = useState<Identity | null>(null);
  const [reading, setReading] = useState("");
  const [readingBusy, setReadingBusy] = useState(false);

  // Guidance
  const [guidance, setGuidance] = useState<null | { nextStep: string }>(null);

  // Restore intake
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pleru.blueprint.intake");
      if (raw) {
        const v = JSON.parse(raw);
        setFullName(v.fullName ?? "");
        setBirthDate(v.birthDate ?? "");
        setBirthTime(v.birthTime ?? "");
        setBirthLocation(v.birthLocation ?? "");
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "pleru.blueprint.intake",
        JSON.stringify({ fullName, birthDate, birthTime, birthLocation })
      );
    } catch {}
  }, [fullName, birthDate, birthTime, birthLocation]);

  // ── Numerology helpers (kept) ────────────────────────────────
  function reduceNumber(n: number): string {
    const keep = new Set([11, 22, 33]);
    while (n > 9 && !keep.has(n)) {
      n = n
        .toString()
        .split("")
        .reduce((a, b) => a + parseInt(b, 10), 0);
    }
    return String(n);
  }
  function calcLifePath(dateStr: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const sum = dateStr.replace(/-/g, "").split("").reduce((a, b) => a + parseInt(b, 10), 0);
    return reduceNumber(sum);
  }
  function calcBirthdayNumber(dateStr: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const day = parseInt(dateStr.split("-")[2], 10);
    return reduceNumber(day);
  }

  // ── Helpers for Divine Identity ──────────────────────────────
  // Convert "HH:MM" local → UTC decimal using current machine tz (MVP)
  function localTimeToUtcDecimal(t: string): number | null {
    if (!t) return null;
    const [hh, mm = "0"] = t.split(":");
    const h = Number(hh);
    const m = Number(mm);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const localDec = h + m / 60;
    const offsetHours = -new Date().getTimezoneOffset() / 60;
    return localDec - offsetHours;
  }

  async function geocode(q: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
      );
      const data = await r.json();
      if (data?.[0]) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch {}
    return null;
  }

  async function interpretWithOllama(id: Identity) {
    setReadingBusy(true);
    try {
      const r = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: id, name: fullName || "Seeker" }),
      });
      const data = await r.json();
      setReading(data?.text || "");
    } catch {
      setReading("Interpretation unavailable right now.");
    } finally {
      setReadingBusy(false);
    }
  }

  // ── Generate (Numerology + Divine Identity) ──────────────────
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);

    const fallbackLifePath = lifePathFromAny(birthDate) ?? calcLifePath(birthDate) ?? "—";
    const birthdayNumber = calcBirthdayNumber(birthDate) ?? "—";

    try {
      const payload: BlueprintInput = {
        fullName,
        birthDate,
        birthTime,
        birthLocation,
      };

      // (1) Numerology + guidance via your /api/blueprint (Ollama inside)
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: Blueprint = await res.json();

      setNumerology({
        lifePath: data?.numerology?.lifePath || fallbackLifePath,
        birthdayNumber,
        notes: [
          data?.numerology?.summary ||
            "Pythagorean with 11/22/33 kept. Extend later: Expression, Soul Urge, Personality, cycles.",
        ],
      });

      const details =
        (data?.numerology as any)?.details as
          | Array<{ key: string; label: string; value: string; reading: string }>
          | undefined;

      setNumDetails(details?.length ? details : null);

      // Human Design placeholder (unchanged)
      const hdNotes: string[] = [];
      if (data?.humanDesign?.type) hdNotes.push(`Type: ${(data as any).humanDesign.type}`);
      if (data?.humanDesign?.authority)
        hdNotes.push(`Authority: ${(data as any).humanDesign.authority}`);

      setHumanDesign({
        summary:
          data?.humanDesign?.summary ||
          "Awaiting HD engine (Type, Strategy, Authority, Centers, Profile, Cross). Time + location required for accuracy.",
        notes: hdNotes.length
          ? hdNotes
          : ["Call your server action that uses an ephemeris/HD library.", "Return structured blocks for UI."],
      });

      // (2) Divine Identity via /api/divine (your FastAPI Swiss Ephemeris)
      const coords = await geocode(birthLocation);
      const utcHour = localTimeToUtcDecimal(birthTime) ?? 12; // noon UTC fallback

      if (coords) {
        const [y, m, d] = birthDate ? birthDate.split("-").map(Number) : [0, 0, 0];
        const r2 = await fetch("/api/divine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: y,
            month: m,
            day: d,
            hour: utcHour,
            lat: coords.lat,
            lon: coords.lon,
            house_system: "P",
          }),
        });

        if (r2.ok) {
          const id: Identity = await r2.json();
          setIdentityRaw(id);

          const sun = `${id.core.sun.sign} ${id.core.sun.deg}°`;
          const moon = `${id.core.moon.sign} ${id.core.moon.deg}°`;
          const asc = `${id.core.asc.sign} ${id.core.asc.deg}°`;
          const role = `${id.core.asc.sign} Rising — ${id.core.sun.sign} Sun, ${id.core.moon.sign} Moon`;

          setDivineIdentity({
            sun,
            moon,
            rising: asc,
            role,
            notes: [`MC: ${id.core.mc}°`, `Aspects: ${id.aspects.length}`],
          });
        } else {
          // graceful fallback if divine fails
          setDivineIdentity({
            // @ts-expect-error optional
            sun: data?.divineIdentity?.sun ?? "—",
            // @ts-expect-error optional
            moon: data?.divineIdentity?.moon ?? "—",
            // @ts-expect-error optional
            rising: data?.divineIdentity?.rising ?? "—",
            role:
              data?.divineIdentity?.summary ??
              "Awaiting astrology engine (Sun • Moon • Rising → Role & Mastery).",
            notes: [],
          });
          setIdentityRaw(null);
        }
      } else {
        // Couldn’t geocode — keep prior behavior
        setDivineIdentity({
          // @ts-expect-error optional
          sun: data?.divineIdentity?.sun ?? "—",
          // @ts-expect-error optional
          moon: data?.divineIdentity?.moon ?? "—",
          // @ts-expect-error optional
          rising: data?.divineIdentity?.rising ?? "—",
          role:
            data?.divineIdentity?.summary ??
            "Awaiting astrology engine (Sun • Moon • Rising → Role & Mastery).",
          notes: [],
        });
        setIdentityRaw(null);
      }

      // Guidance
      setGuidance({
        nextStep:
          data?.guidance?.nextStep ?? "Sit 10 minutes in stillness; choose one aligned action today.",
      });
    } catch {
      // graceful local fallback
      const birthdayNumber = calcBirthdayNumber(birthDate) ?? "—";
      setNumerology({
        lifePath: lifePathFromAny(birthDate) ?? calcLifePath(birthDate) ?? "—",
        birthdayNumber,
        notes: [
          "Pythagorean with 11/22/33 kept.",
          "Extend later: Expression, Soul Urge, Personality, cycles.",
        ],
      });
      setNumDetails(null);
      setHumanDesign({
        summary:
          "Awaiting HD engine (Type, Strategy, Authority, Centers, Profile, Cross). Time + location required for accuracy.",
        notes: [
          "Call your server action that uses an ephemeris/HD library.",
          "Return structured blocks for UI.",
        ],
      });
      setDivineIdentity({
        sun: "—",
        moon: "—",
        rising: "—",
        role: "Awaiting astrology engine (Sun • Moon • Rising → Role & Mastery).",
        notes: [
          "Use your astrology service on the server (e.g., Swiss Ephemeris).",
          "Map into your Temple-of-Truth Divine Identity layout.",
        ],
      });
      setIdentityRaw(null);
      setGuidance({ nextStep: "Protect one hour for your real work today." });
    } finally {
      setIsGenerating(false);
    }
  }

  // Accent helpers
  const ring = ui.accent === "emerald" ? "focus:ring-emerald-400" : "focus:ring-gold/60";
  const btn =
    ui.accent === "emerald"
      ? "bg-emerald-500/90 hover:bg-emerald-400 text-neutral-900"
      : "bg-gold hover:brightness-110 text-neutral-900";

  return (
    <Shell>
      {/* Page Title and Intro */}
      <div className="mx-auto max-w-5xl px-2 pt-4 pb-4 text-center">
        <h1 className="text-2xl font-semibold tracking-wide text-gold">Blueprint</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Enter birth details to generate your map — Numerology (Mind), Human Design (Body), Divine
          Identity (Spirit).
        </p>
      </div>

      {/* Algorithm of Awakening */}
      <div className="mx-auto max-w-5xl px-2">
        <Disclosure title="Algorithm of Awakening" subtitle="Mind • Body • Spirit">
          <ul className="list-disc space-y-2 pl-6 text-sm text-neutral-300">
            <li>
              <b>Numerology (Mind):</b> core numbers & cycles in Ego ↔ Essence.
            </li>
            <li>
              <b>Human Design (Body):</b> Type, Strategy, Authority, Centers.
            </li>
            <li>
              <b>Divine Identity (Spirit):</b> Sun • Moon • Rising → Role & Mastery.
            </li>
          </ul>
        </Disclosure>
      </div>

      {/* Intake + Results */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-2 pb-24 lg:grid-cols-3">
        {/* Form */}
        <Card>
          <div className="p-4 border-b border-neutral-800/80">
            <h2 className="text-base font-semibold">Your Birth Details</h2>
          </div>
          <div className="space-y-4 p-4">
            <Field label="Full Name">
              <input
                className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none focus:ring-1 ${ring}`}
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Birth">
                <input
                  type="date"
                  className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none ${ring}`}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </Field>
              <Field label="Time of Birth">
                <input
                  type="time"
                  className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none ${ring}`}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Birth Location">
              <input
                className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none focus:ring-1 ${ring}`}
                placeholder="City, State/Region, Country"
                value={birthLocation}
                onChange={(e) => setBirthLocation(e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Tip: wire to a places autocomplete later. Accurate time & location improve
                HD/astrology.
              </p>
            </Field>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !fullName || !birthDate || !birthLocation}
              className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${btn}`}
            >
              {isGenerating ? "Generating…" : "Generate Blueprint"}
            </button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6 lg:col-span-2">
          {/* Numerology Overview */}
          <Card title="Numerology (Mind)">
            {!numerology ? (
              <p className="p-4 text-sm text-neutral-400">No data yet. Generate to see Life Path and more.</p>
            ) : (
              <div className="p-4 text-sm">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <InfoStat label="Life Path" value={numerology.lifePath} />
                  <InfoStat label="Birthday" value={numerology.birthdayNumber} />
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-neutral-400">
                  {numerology.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Numerology — Detailed Reading */}
          <Card title="Numerology — Detailed Reading">
            {!numDetails ? (
              <p className="p-4 text-sm text-neutral-400">
                Generate to see a Gnostic-style reading for Life Path, Expression, Soul Urge,
                Personality, Maturity, and Balance.
              </p>
            ) : (
              <div className="p-4 grid gap-4 md:grid-cols-2">
                {numDetails.map((d, i) => (
                  <div key={`${d.key}-${i}`} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-neutral-500">{d.label}</div>
                    <div className="mt-1 text-lg font-semibold">{d.value}</div>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-300">{d.reading}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Human Design (Body) */}
          <Card title="Human Design (Body)">
            {!humanDesign ? (
              <p className="p-4 text-sm text-neutral-400">
                No data yet. Generate to fetch Type, Strategy, Authority, Centers, Profile, Cross.
              </p>
            ) : (
              <div className="p-4 text-sm text-neutral-300">
                <p>{humanDesign.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-neutral-400">
                  {humanDesign.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Divine Identity (Spirit) */}
          <Card title="Divine Identity (Spirit)">
            {!divineIdentity ? (
              <p className="p-4 text-sm text-neutral-400">
                No data yet. Generate to see Sun • Moon • Rising and Role.
              </p>
            ) : (
              <div className="p-4 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <InfoStat label="Sun" value={divineIdentity.sun} />
                  <InfoStat label="Moon" value={divineIdentity.moon} />
                  <InfoStat label="Rising" value={divineIdentity.rising} />
                </div>
                <div className="mt-3 text-neutral-300">
                  <span className="text-neutral-400">Role:</span> {divineIdentity.role}
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-neutral-400">
                  {divineIdentity.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>

                {identityRaw && (
                  <>
                    <button
                      onClick={() => interpretWithOllama(identityRaw)}
                      disabled={readingBusy}
                      className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {readingBusy ? "Asking Ollama…" : "Interpret with Ollama (Ego ↔ Essence)"}
                    </button>
                    {reading && (
                      <div className="mt-3 rounded-md border border-neutral-800 p-3">
                        <div className="text-gold font-medium mb-1">Temple of Truth Reading</div>
                        <div className="whitespace-pre-wrap leading-relaxed">{reading}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>

          {/* Guidance */}
          <Card title="Guidance">
            {!guidance ? (
              <p className="p-4 text-sm text-neutral-400">No guidance yet. Generate to receive a next step.</p>
            ) : (
              <div className="p-4 text-sm text-neutral-300">
                <p className="text-amber-300 font-medium">{guidance.nextStep}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- UI helpers ---------------- */
function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
      {title ? <div className="border-b border-neutral-800/80 p-4 text-base font-semibold">{title}</div> : null}
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-neutral-300">{label}</div>
      {children}
    </label>
  );
}
function InfoStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
function Disclosure({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-neutral-800">
      <button
        className="flex w-full items-center justify-between bg-neutral-900/60 px-4 py-3 text-left text-sm"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="font-medium text-neutral-200">{title}</span>
        <span className="text-xs text-neutral-400">{subtitle ?? (open ? "Hide" : "Show")}</span>
      </button>
      {open ? <div className="border-t border-neutral-800 p-4">{children}</div> : null}
    </div>
  );
}
