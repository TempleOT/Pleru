"use client";

import type { Blueprint, BlueprintInput } from "@/types/blueprint";
import React, { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { lifePathFromAny } from "@/lib/numerology";
import { Plus, User, X } from "lucide-react";

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

// ── Local profile type ───────────────────────────────────────────
type BlueprintProfile = {
  id: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
};

// ── Life-Cycle mock types ────────────────────────────────────────────
type LifeCycle = {
  id: string;
  source: "numerology" | "human-design" | "astrology";
  title: string;
  start: string;
  end: string;
  frequency: string;
  lesson: string;
  ritual: string;
};

const MOCK_CYCLES: LifeCycle[] = [
  {
    id: "num-1",
    source: "numerology",
    title: "Pinnacle 1 — 6",
    start: "1999-05-28",
    end: "2030-01-01",
    frequency: "6 — love, responsibility, service",
    lesson: "Build from the heart, not obligation.",
    ritual: "Ask today: “Where can I serve without self-abandonment?”",
  },
  {
    id: "astro-node",
    source: "astrology",
    title: "Nodal Realignment",
    start: "2025-01-01",
    end: "2025-12-31",
    frequency: "Destiny course-correcting",
    lesson: "Let go of outdated roles.",
    ritual: "Journal: “What identity is expiring?”",
  },
  {
    id: "hd-saturn",
    source: "human-design",
    title: "Saturn Integration",
    start: "2027-06-01",
    end: "2030-01-01",
    frequency: "Structure for your actual design",
    lesson: "Discipline what is true, not what is expected.",
    ritual: "This week: choose 1 practice and keep it for 7 days.",
  },
];

export default function BlueprintPage() {
  // ── UI prefs (persisted) ─────────────────────────────────────
  const [ui, setUi] = useState<{ accent: "gold" | "emerald"; font: "codex" | "system" }>({
    accent: "gold",
    font: "codex",
  });

  // ── Profiles state ───────────────────────────────────────────
  const [profiles, setProfiles] = useState<BlueprintProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pleru.ui");
      if (raw) setUi(JSON.parse(raw));
    } catch {}

    try {
      const pRaw = localStorage.getItem("pleru.blueprint.profiles");
      if (pRaw) {
        const arr: BlueprintProfile[] = JSON.parse(pRaw);
        setProfiles(arr);
        if (arr[0]) setActiveProfileId(arr[0].id);
      }
    } catch {}
  }, []);

  // ── Form state (mirrors active profile) ──────────────────────
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
        key: string;
        label: string;
        value: string;
        reading: string;
      }>
  >(null);

  // Human Design placeholder
  const [humanDesign, setHumanDesign] = useState<null | { summary: string; notes: string[] }>(null);

  // Divine Identity
  const [divineIdentity, setDivineIdentity] = useState<
    | null
    | { sun: string; moon: string; rising: string; role: string; notes: string[] }
  >(null);

  const [identityRaw, setIdentityRaw] = useState<Identity | null>(null);
  const [reading, setReading] = useState("");
  const [readingBusy, setReadingBusy] = useState(false);

  // Guidance
  const [guidance, setGuidance] = useState<null | { nextStep: string }>(null);

  // when active profile changes, load its data into the form
  useEffect(() => {
    if (!activeProfileId) return;
    const p = profiles.find((x) => x.id === activeProfileId);
    if (!p) return;
    setFullName(p.fullName);
    setBirthDate(p.birthDate);
    setBirthTime(p.birthTime);
    setBirthLocation(p.birthLocation);
  }, [activeProfileId, profiles]);

  // helper: save profiles to localStorage
  function persistProfiles(next: BlueprintProfile[]) {
    setProfiles(next);
    try {
      localStorage.setItem("pleru.blueprint.profiles", JSON.stringify(next));
    } catch {}
  }

  function clearForm() {
    setFullName("");
    setBirthDate("");
    setBirthTime("");
    setBirthLocation("");
  }

  function clearResults() {
    setNumerology(null);
    setNumDetails(null);
    setHumanDesign(null);
    setDivineIdentity(null);
    setGuidance(null);
    setIdentityRaw(null);
    setReading("");
  }

  // add new user
  function handleAddProfile() {
    const id = "profile-" + Date.now();
    const blank: BlueprintProfile = {
      id,
      fullName: "",
      birthDate: "",
      birthTime: "",
      birthLocation: "",
    };
    const next = [...profiles, blank];
    persistProfiles(next);
    setActiveProfileId(id);
    clearForm();
    clearResults();
  }

  // delete user
  function handleDeleteProfile(id: string) {
    const next = profiles.filter((p) => p.id !== id);
    persistProfiles(next);

    if (activeProfileId === id) {
      if (next[0]) {
        setActiveProfileId(next[0].id);
        setFullName(next[0].fullName);
        setBirthDate(next[0].birthDate);
        setBirthTime(next[0].birthTime);
        setBirthLocation(next[0].birthLocation);
      } else {
        setActiveProfileId(null);
        clearForm();
        clearResults();
      }
    }
  }

  // update current profile fields as user types
  function updateActiveProfile(partial: Partial<BlueprintProfile>) {
    if (!activeProfileId) return;
    const next = profiles.map((p) => (p.id === activeProfileId ? { ...p, ...partial } : p));
    persistProfiles(next);
  }

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

      if (activeProfileId) {
        updateActiveProfile({
          fullName,
          birthDate,
          birthTime,
          birthLocation,
        });
      }

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

      const coords = await geocode(birthLocation);
      const utcHour = localTimeToUtcDecimal(birthTime) ?? 12;

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
          setDivineIdentity({
            sun: data?.divineIdentity?.sun ?? "—",
            moon: data?.divineIdentity?.moon ?? "—",
            rising: data?.divineIdentity?.rising ?? "—",
            role:
              data?.divineIdentity?.summary ??
              "Awaiting astrology engine (Sun • Moon • Rising → Role & Mastery).",
            notes: [],
          });
          setIdentityRaw(null);
        }
      } else {
        setDivineIdentity({
          sun: data?.divineIdentity?.sun ?? "—",
          moon: data?.divineIdentity?.moon ?? "—",
          rising: data?.divineIdentity?.rising ?? "—",
          role:
            data?.divineIdentity?.summary ??
            "Awaiting astrology engine (Sun • Moon • Rising → Role & Mastery).",
          notes: [],
        });
        setIdentityRaw(null);
      }

      setGuidance({
        nextStep:
          data?.guidance?.nextStep ?? "Sit 10 minutes in stillness; choose one aligned action today.",
      });
    } catch {
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
          Generate, store, and revisit soul maps — Numerology (Mind), Human Design (Body), Divine Identity (Spirit).
        </p>
      </div>

      {/* Profiles bar */}
      <div className="mx-auto max-w-5xl px-2 mb-6 flex gap-3 overflow-x-auto pb-1">
        {profiles.map((p) => {
          const active = p.id === activeProfileId;
          return (
            <div
              key={p.id}
              className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-neutral-800 bg-neutral-950/40 text-neutral-200"
              }`}
            >
              <button onClick={() => setActiveProfileId(p.id)} className="flex items-center gap-2">
                <User size={14} />
                <span className="truncate max-w-[140px]">{p.fullName || "Unnamed profile"}</span>
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => handleDeleteProfile(p.id)}
                  className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/70 text-neutral-300 hover:text-red-300"
                  title="Delete profile"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={handleAddProfile}
          className="flex items-center gap-2 rounded-full border border-dashed border-neutral-700/80 px-4 py-2 text-sm text-neutral-300 hover:border-gold hover:text-gold"
        >
          <Plus size={14} />
          Add new user
        </button>
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

      {/* If no profile selected, show hint */}
      {!activeProfileId ? (
        <div className="mx-auto max-w-5xl px-2 pb-24">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center text-sm text-neutral-300">
            Select a profile or create a new one to enter birth details.
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-2 pb-24 space-y-6">
          {/* top: form */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                    onChange={(e) => {
                      setFullName(e.target.value);
                      updateActiveProfile({ fullName: e.target.value });
                    }}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date of Birth">
                    <input
                      type="date"
                      className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none ${ring}`}
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        updateActiveProfile({ birthDate: e.target.value });
                      }}
                    />
                  </Field>
                  <Field label="Time of Birth">
                    <input
                      type="time"
                      className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none ${ring}`}
                      value={birthTime}
                      onChange={(e) => {
                        setBirthTime(e.target.value);
                        updateActiveProfile({ birthTime: e.target.value });
                      }}
                    />
                  </Field>
                </div>
                <Field label="Birth Location">
                  <input
                    className={`w-full rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm outline-none focus:ring-1 ${ring}`}
                    placeholder="City, State/Region, Country"
                    value={birthLocation}
                    onChange={(e) => {
                      setBirthLocation(e.target.value);
                      updateActiveProfile({ birthLocation: e.target.value });
                    }}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Tip: wire to places autocomplete later. Accurate time & location improve HD/astrology.
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

            {/* right side of top grid: Guidance */}
            <div className="space-y-6 lg:col-span-2">
              <Card title="Guidance">
                {!guidance ? (
                  <p className="p-4 text-sm text-neutral-400">
                    No guidance yet. Generate to receive a next step.
                  </p>
                ) : (
                  <div className="p-4 text-sm text-neutral-300">
                    <p className="text-amber-300 font-medium">{guidance.nextStep}</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Human Design gold UI */}
          <HDGoldBodygraph
            name={fullName || "Essence Bodygraph"}
            definedCenters={["throat", "g", "sacral"]} // mock defined centers
            highlightedChannels={["throat-g", "g-sacral"]}
          />

          {/* bottom intelligence blocks */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Numerology */}
            <Card title="Numerology (Mind)">
              {!numerology ? (
                <p className="p-4 text-sm text-neutral-400">
                  Generate to see Life Path and primary numbers.
                </p>
              ) : (
                <div className="p-4 text-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoStat label="Life Path" value={numerology.lifePath} />
                    <InfoStat label="Birthday" value={numerology.birthdayNumber} />
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-neutral-400">
                    {numerology.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Divine Identity */}
            <Card title="Divine Identity (Spirit)">
              {!divineIdentity ? (
                <p className="p-4 text-sm text-neutral-400">
                  Generate to see Sun • Moon • Rising and Role.
                </p>
              ) : (
                <div className="p-4 text-sm space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <InfoStat label="Sun" value={divineIdentity.sun} />
                    <InfoStat label="Moon" value={divineIdentity.moon} />
                    <InfoStat label="Rising" value={divineIdentity.rising} />
                  </div>
                  <p className="text-neutral-300 text-sm">
                    <span className="text-neutral-500">Role:</span> {divineIdentity.role}
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-neutral-400">
                    {divineIdentity.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                  {identityRaw && (
                    <>
                      <button
                        onClick={() => interpretWithOllama(identityRaw)}
                        disabled={readingBusy}
                        className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {readingBusy ? "Asking Ollama…" : "Interpret with Ollama"}
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

            {/* Human Design (Desc) */}
            <Card title="Human Design (Body)">
              {!humanDesign ? (
                <p className="p-4 text-sm text-neutral-400">
                  Generate to fetch Type, Strategy, Authority, Centers, Profile.
                </p>
              ) : (
                <div className="p-4 text-sm text-neutral-300 space-y-3">
                  <p>{humanDesign.summary}</p>
                  <ul className="list-disc space-y-1 pl-4 text-neutral-400">
                    {humanDesign.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>

          {/* Life-Cycle Compass — outside, at bottom */}
          <Card title="Life-Cycle Compass — Timing Map">
            <p className="px-4 pt-4 text-sm text-neutral-400">
              Visual timeline merging Numerology pinnacles, Human Design cycles, and major Astrology windows.
            </p>
            <div className="p-4 flex gap-3 overflow-x-auto">
              {MOCK_CYCLES.map((c) => {
                const today = new Date().getTime();
                const active =
                  today >= new Date(c.start).getTime() &&
                  today <= new Date(c.end).getTime();
                return (
                  <div
                    key={c.id}
                    className={`min-w-[220px] rounded-2xl p-4 border ${
                      active ? "border-gold bg-gold/5" : "border-neutral-800 bg-neutral-950/40"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
                      {c.source}
                    </p>
                    <p className="text-sm font-medium text-neutral-100">{c.title}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {c.start} → {c.end}
                    </p>
                    <p className="text-xs text-neutral-300 mt-2 line-clamp-2">{c.frequency}</p>
                    {active && (
                      <div className="mt-3 rounded-lg bg-neutral-950/40 border border-neutral-800 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
                          Current ritual
                        </p>
                        <p className="text-xs text-neutral-100">{c.ritual}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
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

/* ---------------- Human Design gold UI ---------------- */
function HDGoldBodygraph({
  name,
  definedCenters = [],
  highlightedChannels = [],
}: {
  name: string;
  definedCenters?: string[];
  highlightedChannels?: string[];
}) {
  // layout tuned for 160x320 box
  const centers = [
    { id: "head", label: "Head", top: "3%", left: "50%", w: 70, h: 50, rounded: "rounded-b-2xl" },
    { id: "ajna", label: "Ajna", top: "13%", left: "50%", w: 80, h: 55, rounded: "rounded-2xl" },
    { id: "throat", label: "Throat", top: "23%", left: "50%", w: 90, h: 60, rounded: "rounded-xl" },
    { id: "g", label: "G", top: "35%", left: "50%", w: 110, h: 85, rounded: "rounded-2xl" },
    { id: "heart", label: "Heart", top: "36%", left: "69%", w: 55, h: 40, rounded: "rounded-lg" },
    { id: "spleen", label: "Spleen", top: "46%", left: "27%", w: 72, h: 85, rounded: "rounded-3xl" },
    { id: "sacral", label: "Sacral", top: "53%", left: "50%", w: 110, h: 85, rounded: "rounded-2xl" },
    { id: "solar", label: "Solar", top: "64%", left: "74%", w: 80, h: 80, rounded: "rounded-3xl" },
    { id: "root", label: "Root", top: "78%", left: "50%", w: 120, h: 75, rounded: "rounded-2xl" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 py-8 px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* diagram */}
        <div className="relative mx-auto h-80 w-40 md:mx-0">
          {/* background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.22),transparent_60%)] pointer-events-none" />

          {/* channels (simple) */}
          {/* head -> ajna */}
          <div
            className={`absolute left-1/2 top-[8%] h-[38px] w-[3px] -translate-x-1/2 ${
              highlightedChannels.includes("head-ajna") ? "bg-gold" : "bg-gold/20"
            }`}
          />
          {/* ajna -> throat */}
          <div
            className={`absolute left-1/2 top-[17%] h-[42px] w-[3px] -translate-x-1/2 ${
              highlightedChannels.includes("ajna-throat") ? "bg-gold" : "bg-gold/20"
            }`}
          />
          {/* throat -> g */}
          <div
            className={`absolute left-1/2 top-[28%] h-[64px] w-[3px] -translate-x-1/2 ${
              highlightedChannels.includes("throat-g") ? "bg-gold" : "bg-gold/15"
            }`}
          />
          {/* g -> sacral */}
          <div
            className={`absolute left-1/2 top-[44%] h-[70px] w-[3px] -translate-x-1/2 ${
              highlightedChannels.includes("g-sacral") ? "bg-gold" : "bg-gold/15"
            }`}
          />
          {/* sacral -> root */}
          <div
            className={`absolute left-1/2 top-[63%] h-[70px] w-[3px] -translate-x-1/2 ${
              highlightedChannels.includes("sacral-root") ? "bg-gold" : "bg-gold/15"
            }`}
          />
          {/* spleen -> sacral (diag) */}
          <div
            className={`absolute top-[58%] left-[35%] h-[3px] w-[70px] rotate-[-21deg] origin-left ${
              highlightedChannels.includes("spleen-sacral") ? "bg-gold" : "bg-gold/10"
            }`}
          />
          {/* solar -> sacral (diag) */}
          <div
            className={`absolute top-[58%] right-[5%] h-[3px] w-[70px] rotate-[20deg] origin-right ${
              highlightedChannels.includes("solar-sacral") ? "bg-gold" : "bg-gold/10"
            }`}
          />
          {/* heart -> g */}
          <div
            className={`absolute top-[40%] left-[56%] h-[3px] w-[60px] rotate-[0deg] origin-left ${
              highlightedChannels.includes("heart-g") ? "bg-gold" : "bg-gold/10"
            }`}
          />

          {/* centers */}
          {centers.map((c) => {
            const defined = definedCenters.includes(c.id);
            return (
              <div
                key={c.id}
                className={`absolute -translate-x-1/2 border flex items-center justify-center ${
                  c.rounded
                } transition ${
                  defined
                    ? "bg-gold/85 border-gold text-neutral-950"
                    : "bg-neutral-950/40 border-gold/25 text-neutral-200"
                }`}
                style={{
                  top: c.top,
                  left: c.left,
                  width: c.w,
                  height: c.h,
                }}
              >
                <span className="text-[10px] uppercase tracking-wide leading-tight px-1 text-center">
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* text side */}
        <div className="flex-1 space-y-3">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Essence bodygraph</p>
          <h2 className="text-lg font-semibold text-gold">{name}</h2>
          <p className="text-sm text-neutral-300">
            Golden Human Design layout. Centers turn gold when defined. Channels can be lit when a transit/cycle is
            active.
          </p>
          <p className="text-sm text-neutral-500">
            Later: swap this for real coordinates + gates from your HD backend.
          </p>
        </div>
      </div>
    </div>
  );
}
