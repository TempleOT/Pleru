"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Minus,
  Search,
  Flame,
  Wind,
  Droplets,
  Mountain,
  Orbit,
} from "lucide-react";
import Shell from "../../components/Shell";

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────
export type CodexEntry = {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle?: string;
  ego: string;
  essence: string;
  integrated?: string;
};

type Medicine = {
  name: string;
  center: string;
  heals: string;
  nature: string;
  effect: string;
  practice: string;
  mantra: string;
};

// ───────────────────────────────────────────────────────────────
// Seven Medicines of Awakening
// ───────────────────────────────────────────────────────────────
const MEDICINES: Medicine[] = [
  {
    name: "Presence — Medicine of Stillness",
    center: "CROWN",
    heals: "Pride, superiority, fragmentation.",
    nature: "Silent awareness behind all forms.",
    effect: "Dissolves comparison, unifies the field.",
    practice: "Sit in unforced stillness; feel perception widen beyond identity.",
    mantra: "“I am here; therefore I am whole.”",
  },
  {
    name: "Clarity — Medicine of Insight",
    center: "AJNA",
    heals: "Delusion, confusion, mental noise.",
    nature: "Seeing through appearance into pattern.",
    effect: "Thoughts rearrange around truth; vision becomes guidance.",
    practice: "Observe rather than interpret; let reality show itself.",
    mantra: "“I see what is real, not what I fear.”",
  },
  {
    name: "Truth — Medicine of Integrity",
    center: "THROAT",
    heals: "Lies, repression, false self-expression.",
    nature: "Alignment of word and essence.",
    effect: "Energy flows through speech; creativity ignites.",
    practice: "Speak the small truths daily; the great truth reveals itself.",
    mantra: "“My voice is the sound of my soul.”",
  },
  {
    name: "Compassion — Medicine of Connection",
    center: "HEART",
    heals: "Grief, isolation, judgment.",
    nature: "Boundless empathy without attachment.",
    effect: "Softens duality, bridges self and other.",
    practice: "Breathe into the heart until it feels wider than the body.",
    mantra: "“All pain is love asking to be seen.”",
  },
  {
    name: "Dignity — Medicine of Self-Worth",
    center: "SOLAR",
    heals: "Shame, self-doubt, inferiority.",
    nature: "Quiet confidence rooted in being.",
    effect: "Power returns to its rightful owner.",
    practice: "Stand upright, feel the sun within the chest, act from inner authority.",
    mantra: "“I am worthy of the light that moves me.”",
  },
  {
    name: "Love — Medicine of Union",
    center: "SACRAL",
    heals: "Lust, craving, emotional hunger.",
    nature: "Desire integrated with devotion.",
    effect: "Relationships become mirrors, not escapes.",
    practice: "When wanting arises, ask: “What am I truly longing for?”",
    mantra: "“I choose union over possession.”",
  },
  {
    name: "Courage — Medicine of Life-Force",
    center: "ROOT",
    heals: "Fear, inertia, survival panic.",
    nature: "Action infused with trust.",
    effect: "Stability in motion — body as temple.",
    practice: "Ground; exhale longer than you inhale; move toward the honest task.",
    mantra: "“Life moves through me, and I move with Life.”",
  },
];

// ───────────────────────────────────────────────────────────────
// Codex Entries
// ───────────────────────────────────────────────────────────────
const ENTRIES: CodexEntry[] = [
  {
    id: "lust",
    tier: 1,
    title: "Lust — When desire forgets its source",
    subtitle: "Pleasure as mask; essence drained through the sexual center.",
    ego: "Compulsion chasing intensity; relief mistaken for union.",
    essence: "Transmute desire into devotion and creative fire.",
    integrated: "Desire becomes a lamp, not a leash.",
  },
  {
    id: "gluttony",
    tier: 1,
    title: "Gluttony — Too much to feel less",
    subtitle: "Enjoyment hides the slow dulling of life.",
    ego: "Vital energy wasted; body numbed by excess.",
    essence: "Right measure that nourishes clarity and strength.",
    integrated: "Eat to serve the flame, not smother it.",
  },
  // ... (rest of your entries here, unchanged)
];

const byTier = (tier: 1 | 2 | 3 | 4 | 5) => ENTRIES.filter((e) => e.tier === tier);

const ELEMENTS = [
  {
    key: "fire",
    name: "Fire",
    icon: Flame,
    head: "Will, courage, catalytic action",
    ego: "Impulsive burning, domination, anger",
    essence: "Clean decisive action in service of truth",
    tip: "Act after seeing clearly.",
  },
  {
    key: "air",
    name: "Air",
    icon: Wind,
    head: "Clarity, discernment, architecture of mind",
    ego: "Overthinking, rationalization, detachment",
    essence: "Understanding that liberates and guides",
    tip: "Say the true sentence, simply.",
  },
  {
    key: "water",
    name: "Water",
    icon: Droplets,
    head: "Feeling, empathy, devotion",
    ego: "Flooded mood, attachment, people-pleasing",
    essence: "Compassion with boundaries and depth",
    tip: "Feel fully, then respond.",
  },
  {
    key: "earth",
    name: "Earth",
    icon: Mountain,
    head: "Structure, rhythm, embodiment",
    ego: "Rigidity, hoarding, plan paralysis",
    essence: "Grounded order that supports life",
    tip: "Choose clear, light constraints.",
  },
  {
    key: "ether",
    name: "Ether",
    icon: Orbit,
    head: "Space, presence, the unifying field",
    ego: "Bypass, emptiness-as-escape",
    essence: "Still awareness harmonizing the four",
    tip: "Begin and end in stillness.",
  },
] as const;

// ───────────────────────────────────────────────────────────────
// Animated SectionShell (Soft Open / Close)
// ───────────────────────────────────────────────────────────────
const SectionShell: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}> = ({ title, subtitle, children, open, onToggle }) => {
  const MAX_HEIGHT = "4000px";

  return (
    <section
      className={[
        "rounded-2xl border bg-neutral-950/80 backdrop-blur-sm shadow-2xl transition-all duration-500 ease-in-out",
        open
          ? "border-amber-400/40 shadow-[0_0_25px_-5px_rgba(255,191,0,0.15)]"
          : "border-neutral-800/70",
      ].join(" ")}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 transition-colors hover:bg-neutral-900/50"
      >
        <div className="flex-1 flex flex-col text-left leading-snug max-w-[92%]">
          <div className="text-amber-300 font-semibold tracking-wide">{title}</div>
          {subtitle && <div className="mt-0.5 text-sm text-neutral-400">{subtitle}</div>}
        </div>
        <div
          className={[
            "shrink-0 text-neutral-400 rounded-full border border-neutral-700/60 bg-neutral-950/40 p-1",
            "transition-transform duration-300 ease-in-out",
            open ? "rotate-90 text-amber-300 border-amber-400/40" : "",
          ].join(" ")}
        >
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </div>
      </button>

      {/* Animated Body */}
      <div
        style={{
          maxHeight: open ? MAX_HEIGHT : "0px",
          opacity: open ? 1 : 0,
        }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div
          className={[
            "px-4 sm:px-5 pb-5 pt-0 transform transition-all duration-500 ease-in-out",
            open ? "translate-y-0" : "-translate-y-2",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────
// Entry Card
// ───────────────────────────────────────────────────────────────
const EntryCard: React.FC<{ entry: CodexEntry }> = ({ entry }) => (
  <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4 transition-transform duration-300 hover:scale-[1.01] hover:border-amber-400/30">
    <div className="font-medium text-neutral-100 leading-snug">{entry.title}</div>
    {entry.subtitle && (
      <div className="mt-1 text-sm text-neutral-400 leading-snug">{entry.subtitle}</div>
    )}
    <div className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
      <div className="rounded-md bg-neutral-950/60 p-3 border border-neutral-800/70">
        <div className="text-xs text-neutral-400 mb-1 tracking-wide">EGO</div>
        <div className="text-sm leading-relaxed">{entry.ego}</div>
      </div>
      <div className="rounded-md bg-neutral-950/60 p-3 border border-neutral-800/70">
        <div className="text-xs text-neutral-400 mb-1 tracking-wide">ESSENCE</div>
        <div className="text-sm leading-relaxed">{entry.essence}</div>
      </div>
    </div>
    {entry.integrated && (
      <div className="mt-3 text-sm text-amber-300">
        <span className="font-medium">Integrated:</span> {entry.integrated}
      </div>
    )}
  </div>
);

// ───────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────
export default function CodexPage() {
  const [q, setQ] = useState("");
  const [openTiers, setOpenTiers] = useState<{ [k: number]: boolean }>({});
  const [elementsOpen, setElementsOpen] = useState(false);
  const [codexOpen, setCodexOpen] = useState(false);
  const [medicinesOpen, setMedicinesOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ENTRIES;
    return ENTRIES.filter((e) =>
      [e.title, e.subtitle, e.ego, e.essence, e.integrated]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q]);

  const tierList = (tier: 1 | 2 | 3 | 4 | 5) => filtered.filter((e) => e.tier === tier);
  const toggleTier = (t: number) => setOpenTiers((s) => ({ ...s, [t]: !s[t] }));

  return (
    <Shell>
      <h1 className="text-2xl font-semibold text-gold">Codex</h1>
      <p className="text-neutral-400 mt-1">Ego ↔ Essence entries and Temple Keys.</p>

      <div className="mt-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-md bg-neutral-950/70 border border-neutral-800/70 px-9 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-600"
          />
        </div>

        {/* Codex of Liberation */}
        <SectionShell
          title="Codex of Liberation"
          subtitle="45 Chains — Ego ↔ Essence map"
          open={codexOpen}
          onToggle={() => setCodexOpen((v) => !v)}
        >
          {[1, 2, 3, 4, 5].map((tier) => (
            <SectionShell
              key={tier}
              title={
                <span>
                  Tier {tier} —{" "}
                  <span className="text-neutral-200">
                    {["Gross Chains", "Refined Chains", "Hidden Chains", "False Light Chains", "Crown Chains"][tier - 1]}
                  </span>
                </span>
              }
              subtitle={
                [
                  "The raw instincts — Lust through Ignorance.",
                  "Subtle ego strategies — Doubt through Distraction.",
                  "Invisible habits of mind — Addiction to Thinking through False Forgiveness.",
                  "Ego wearing spiritual clothes — Spiritual Pride through False Unity.",
                  "The final illusions — Identification, Fear of Death, Forgetfulness, Denial, Consent.",
                ][tier - 1]
              }
              open={!!openTiers[tier]}
              onToggle={() => toggleTier(tier)}
            >
              {tierList(tier).length ? (
                <div className="grid gap-4">
                  {tierList(tier).map((e) => (
                    <EntryCard key={e.id} entry={e} />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-500 italic">
                  No Tier {tier} entries yet. Add them to ENTRIES.
                </div>
              )}
            </SectionShell>
          ))}
        </SectionShell>

        {/* Elements */}
        <SectionShell
          title={
            <span>
              Elements <span className="text-neutral-200">— keepers of balance</span>
            </span>
          }
          subtitle="Fire • Air • Water • Earth • Ether"
          open={elementsOpen}
          onToggle={() => setElementsOpen((v) => !v)}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ELEMENTS.map((el) => {
              const Icon = el.icon;
              return (
                <div key={el.key} className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-amber-300" />
                    {el.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-400">{el.head}</div>
                  <div className="mt-3 space-y-2">
                    <div className="rounded-md bg-neutral-950/60 p-3 border border-neutral-800/70">
                      <div className="text-xs text-neutral-400 mb-1 tracking-wide">EGO</div>
                      <div className="text-sm">{el.ego}</div>
                    </div>
                    <div className="rounded-md bg-neutral-950/60 p-3 border border-neutral-800/70">
                      <div className="text-xs text-neutral-400 mb-1 tracking-wide">ESSENCE</div>
                      <div className="text-sm">{el.essence}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-amber-300">{el.tip}</div>
                </div>
              );
            })}
          </div>
        </SectionShell>

        {/* Seven Medicines */}
        <SectionShell
          title="Seven Medicines of Awakening"
          subtitle="States to heal the seven main distortions."
          open={medicinesOpen}
          onToggle={() => setMedicinesOpen((v) => !v)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {MEDICINES.map((m) => (
              <div
                key={m.name}
                className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-neutral-100">{m.name}</h3>
                  <span className="text-[10px] uppercase tracking-wide text-neutral-500 bg-neutral-950/60 px-2 py-1 rounded">
                    {m.center}
                  </span>
                </div>
                <p className="text-sm text-neutral-300">
                  <span className="text-neutral-500">Heals:</span> {m.heals}
                </p>
                <p className="text-sm text-neutral-300">
                  <span className="text-neutral-500">Nature:</span> {m.nature}
                </p>
                <p className="text-sm text-neutral-300">
                  <span className="text-neutral-500">Effect:</span> {m.effect}
                </p>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Practice</p>
                  <p className="text-sm text-neutral-100 leading-relaxed">{m.practice}</p>
                </div>
                <div className="border-t border-neutral-800/60 pt-2">
                  <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Mantra</p>
                  <p className="
