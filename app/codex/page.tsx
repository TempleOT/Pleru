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
// Seven Medicines of Awakening (from your PDF, normalized)
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
// Your original Codex entries
// ───────────────────────────────────────────────────────────────
const ENTRIES: CodexEntry[] = [
  // Tier 1
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
  {
    id: "sloth",
    tier: 1,
    title: "Sloth — Comfort as cage",
    subtitle: "Rest becomes resignation.",
    ego: "Will’s fire dimmed by avoidance and delay.",
    essence: "Rhythmic rest that restores clean action.",
    integrated: "Close the scroll; take one honest step.",
  },
  {
    id: "anger",
    tier: 1,
    title: "Anger — Fire turned against you",
    subtitle: "Righteous heat that burns essence.",
    ego: "Explosive reactions steal energy twice: by trigger and response.",
    essence: "Harness fire as courage and truth in service.",
    integrated: "Breathe, aim, act without poison.",
  },
  {
    id: "greed",
    tier: 1,
    title: "Greed — Shackled by gold",
    subtitle: "Security costume over spiritual bondage.",
    ego: "Hoarding tightens fear and withers spirit.",
    essence: "Sufficiency, stewardship, shared flow.",
    integrated: "Let wealth have purpose, not power.",
  },
  {
    id: "envy",
    tier: 1,
    title: "Envy — Poisoned joy",
    subtitle: "Inspiration twisted into comparison.",
    ego: "Vision blinded to one’s own path.",
    essence: "Bless the other; walk your assignment.",
    integrated: "Turn comparison into confirmation of direction.",
  },
  {
    id: "pride",
    tier: 1,
    title: "Pride — Armor becomes coffin",
    subtitle: "Strength costume that isolates.",
    ego: "Self-importance deaf to truth and help.",
    essence: "Sober dignity that bows to reality.",
    integrated: "Listen deeper than the image.",
  },
  {
    id: "vanity",
    tier: 1,
    title: "Vanity — Dying for appearances",
    subtitle: "Beauty harvested for attention.",
    ego: "Life arranged to be seen, not lived.",
    essence: "Simplicity and authenticity that shine from within.",
    integrated: "Choose substance; let radiance follow.",
  },
  {
    id: "attachment",
    tier: 1,
    title: "Attachment — Love confused with clinging",
    subtitle: "Bondage to the passing form.",
    ego: "Grip that fears change and stalls growth.",
    essence: "Devotion with open hands; love as freedom.",
    integrated: "Hold purpose, not possession.",
  },
  {
    id: "ignorance",
    tier: 1,
    title: "Ignorance — Choosing to not know",
    subtitle: "Innocence mask that keeps the soul asleep.",
    ego: "Refusal of light and responsibility.",
    essence: "Beginner’s truthfulness; learn and look again.",
    integrated: "Name reality; enter work.",
  },
  // Tier 2
  {
    id: "doubt",
    tier: 2,
    title: "Doubt — Paralysis dressed as wisdom",
    subtitle: "Caution becomes a cage.",
    ego: "Endless second-guessing bleeds will.",
    essence: "Test lightly, then move with faith.",
    integrated: "Small commitments build clean certainty.",
  },
  {
    id: "anxiety",
    tier: 2,
    title: "Anxiety — Tomorrow murders today",
    subtitle: "Care becomes chronic forecast.",
    ego: "Energy bled into future phantoms.",
    essence: "Presence, breath, and the next honest action.",
    integrated: "Return to now; reduce the field to what’s real.",
  },
  {
    id: "nostalgia",
    tier: 2,
    title: "Nostalgia — Living backwards",
    subtitle: "Sweet memory traps essence in the dead.",
    ego: "Golden past replaces present obedience.",
    essence: "Honor the past; build here.",
    integrated: "Archive the gift; release the grip.",
  },
  {
    id: "control",
    tier: 2,
    title: "Control — Gripping the river",
    subtitle: "Order that breeds tension.",
    ego: "Micromanage, tighten, resent.",
    essence: "Clear agreements + trust in living order.",
    integrated: "Hold the rudder, not the ocean.",
  },
  {
    id: "dependence",
    tier: 2,
    title: "Dependence — Need mistaken for love",
    subtitle: "Comfort bought with the soul.",
    ego: "Trade self-responsibility for caretaking and control.",
    essence: "Relate as whole to whole; choose, don’t cling.",
    integrated: "Let support strengthen sovereignty.",
  },
  {
    id: "self-pity",
    tier: 2,
    title: "Self-Pity — Tears that feed the machine",
    subtitle: "Sensitivity used to stall growth.",
    ego: "Energy drains into the story of me.",
    essence: "Grieve cleanly; stand and serve.",
    integrated: "From ‘why me’ to ‘what’s needed’.",
  },
  {
    id: "superstition",
    tier: 2,
    title: "Superstition — Will bound to lies",
    subtitle: "False belief masquerades as faith.",
    ego: "Outsource responsibility to signs and fear.",
    essence: "Live truth you can verify in being.",
    integrated: "Replace ritualized fear with disciplined seeing.",
  },
  {
    id: "superiority",
    tier: 2,
    title: "Superiority — Above and alone",
    subtitle: "Self-elevation isolates.",
    ego: "Comparison to stay high and safe.",
    essence: "Humility as clarity of function.",
    integrated: "Stand tall to serve, not to tower.",
  },
  {
    id: "inferiority",
    tier: 2,
    title: "Inferiority — Smallness as virtue",
    subtitle: "Fake humility that crushes will.",
    ego: "‘I am nothing’ still centers ego.",
    essence: "Sober appraisal + courageous offering.",
    integrated: "Claim your assignment without apology.",
  },
  {
    id: "distraction",
    tier: 2,
    title: "Distraction — Time stolen",
    subtitle: "Entertainment becomes enslavement.",
    ego: "Cannot sit in silence; scattered attention.",
    essence: "Return attention to presence and purpose.",
    integrated: "Protect focus like fire.",
  },
  // Tier 3
  {
    id: "thinking-addiction",
    tier: 3,
    title: "Addiction to Thinking — Tool crowned as king",
    subtitle: "Endless noise drains attention.",
    ego: "Analysis replaces awareness.",
    essence: "Mind serves sight and action.",
    integrated: "Put the sword back in the sheath; look.",
  },
  {
    id: "mechanical-repetition",
    tier: 3,
    title: "Mechanical Repetition — Life on autopilot",
    subtitle: "Habit without awareness.",
    ego: "Repeat unconsciously; never live.",
    essence: "Remember; choose freshly.",
    integrated: "Break the loop with one conscious variation.",
  },
  {
    id: "comparison",
    tier: 3,
    title: "Comparison — Axe at your root",
    subtitle: "Measuring steals essence.",
    ego: "Life graded against others.",
    essence: "Align to your given line.",
    integrated: "Transform envy into mentorship of your future self.",
  },
  {
    id: "flattery",
    tier: 3,
    title: "Flattery — Honeyed poison",
    subtitle: "Kindness used to inflate ego.",
    ego: "Say what feeds image.",
    essence: "Truth in love, clean and exact.",
    integrated: "Trade approval for accuracy.",
  },
  {
    id: "complaint",
    tier: 3,
    title: "Complaint — Worship of powerlessness",
    subtitle: "Noise disguised as truth.",
    ego: "Project blame; drain will.",
    essence: "Name the need and act.",
    integrated: "Replace venting with a request or a move.",
  },
  {
    id: "justification",
    tier: 3,
    title: "Justification — Lies that calcify",
    subtitle: "Reason in service of avoidance.",
    ego: "Excuses forge your own chains.",
    essence: "Own it; repair it; proceed.",
    integrated: "Shorten the story to one sentence of truth.",
  },
  {
    id: "blame",
    tier: 3,
    title: "Blame — Justice costume",
    subtitle: "Accuse more, awaken less.",
    ego: "Project responsibility outward.",
    essence: "Take the slice that’s yours and change it.",
    integrated: "From fault-finding to function-finding.",
  },
  {
    id: "false-hope",
    tier: 3,
    title: "False Hope — Waiting forever",
    subtitle: "Optimism without work.",
    ego: "Dream as delay.",
    essence: "Plan, practice, persist.",
    integrated: "Date the hope with a deadline.",
  },
  {
    id: "false-guilt",
    tier: 3,
    title: "False Guilt — Shame without change",
    subtitle: "Illusions of failure chain energy.",
    ego: "Spin in penance and self-hate.",
    essence: "Real remorse births correction and life.",
    integrated: "Convert guilt into a single restorative act.",
  },
  {
    id: "false-forgiveness",
    tier: 3,
    title: "False Forgiveness — Ego’s halo",
    subtitle: "Smile while resenting.",
    ego: "Perform peace; keep the knife.",
    essence: "Release debt and restore boundary.",
    integrated: "Say what’s true, then choose freedom.",
  },
  // Tier 4
  {
    id: "spiritual-pride",
    tier: 4,
    title: "Spiritual Pride — Special and furthest",
    subtitle: "Awakening as image.",
    ego: "Inflated holiness feeds self.",
    essence: "Simplicity, service, obedience to truth.",
    integrated: "Let the work speak; you disappear.",
  },
  {
    id: "false-humility",
    tier: 4,
    title: "False Humility — Performance of nothing",
    subtitle: "Service as self-display.",
    ego: "Smallness costume for praise.",
    essence: "Quiet action; real results.",
    integrated: "Subtract theater; keep the task.",
  },
  {
    id: "teachers-ego",
    tier: 4,
    title: "Teacher’s Ego — Helping to be seen",
    subtitle: "Guidance feeds recognition.",
    ego: "Use seekers to confirm self.",
    essence: "Midwife truth, not your brand.",
    integrated: "Point away from you.",
  },
  {
    id: "seekers-vanity",
    tier: 4,
    title: "Seeker’s Vanity — Running in circles",
    subtitle: "Search without stillness.",
    ego: "Collect paths, avoid practice.",
    essence: "Become quiet; become the teaching.",
    integrated: "One path, walked.",
  },
  {
    id: "escapism-bliss",
    tier: 4,
    title: "Escapism in Bliss — Highs as cage",
    subtitle: "Meditation used to avoid truth.",
    ego: "Chase peak states; skip correction.",
    essence: "Let joy be fuel for clarity and service.",
    integrated: "Return from the mountain with wood and water.",
  },
  {
    id: "escapism-pain",
    tier: 4,
    title: "Escapism in Pain — Depth as addiction",
    subtitle: "Suffering worshiped as meaning.",
    ego: "Brood to feel profound.",
    essence: "Feel fully; act rightly.",
    integrated: "Choose transformation over theatrics.",
  },
  {
    id: "pseudo-compassion",
    tier: 4,
    title: "Pseudo-Compassion — Kindness without clarity",
    subtitle: "Pity that feeds ego.",
    ego: "Help to be good; harm by enabling.",
    essence: "Firm love aligned to truth and consequence.",
    integrated: "Care that confronts.",
  },
  {
    id: "pseudo-wisdom",
    tier: 4,
    title: "Pseudo-Wisdom — Words without being",
    subtitle: "Knowledge that betrays practice.",
    ego: "Speak to appear awake.",
    essence: "Live the sentence you say.",
    integrated: "Silence until embodied.",
  },
  {
    id: "pseudo-peace",
    tier: 4,
    title: "Pseudo-Peace — Calm by avoidance",
    subtitle: "False stillness hides conflict.",
    ego: "Keep harmony; bury truth.",
    essence: "Peace from alignment, not escape.",
    integrated: "Tell the hard thing gently.",
  },
  {
    id: "false-unity",
    tier: 4,
    title: "False Unity — Herd mind as oneness",
    subtitle: "Dissolve individuality to belong.",
    ego: "Merge to avoid responsibility.",
    essence: "Union that preserves the given role.",
    integrated: "Stand distinct inside connection.",
  },
  // Tier 5
  {
    id: "identification-with-i",
    tier: 5,
    title: "Identification with ‘I’ — Costume of self",
    subtitle: "False identity traps soul.",
    ego: "Life organized around the story of me.",
    essence: "Awareness remembering itself beyond roles.",
    integrated: "Use the name; don’t become it.",
  },
  {
    id: "fear-of-death",
    tier: 5,
    title: "Fear of Death — Door mistaken for end",
    subtitle: "Clinging and panic.",
    ego: "Spend life avoiding loss.",
    essence: "Memento mori as clarity and love.",
    integrated: "Let endings teach you how to live now.",
  },
  {
    id: "forgetfulness",
    tier: 5,
    title: "Forgetfulness — Soul asleep",
    subtitle: "To forget is to die unconscious.",
    ego: "Days blur; vows fade.",
    essence: "Practices that re-member: breath, silence, sincerity.",
    integrated: "Alarms for the soul — remember.",
  },
  {
    id: "denial-of-work",
    tier: 5,
    title: "Denial of Work — Fire refused",
    subtitle: "Bypass dressed as holiness.",
    ego: "Seek results without transmutation.",
    essence: "Daily discipline; honest friction; real change.",
    integrated: "No fire, no awakening.",
  },
  {
    id: "consent",
    tier: 5,
    title: "Consent — Unconscious yes = no to soul",
    subtitle: "Submission by default.",
    ego: "Agree by drift and fear.",
    essence: "Conscious yes/no that guards destiny.",
    integrated: "Revoke sleepy consent; choose in light.",
  },
];

const byTier = (tier: 1 | 2 | 3 | 4 | 5) => ENTRIES.filter((e) => e.tier === tier);

// Elements
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

// UI shells
const SectionShell: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}> = ({ title, subtitle, children, open, onToggle }) => {
  return (
    <section className="rounded-2xl border border-neutral-800/70 bg-neutral-950/80 backdrop-blur-sm shadow-2xl transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 hover:border-neutral-700/70"
      >
        <div className="flex-1 flex flex-col text-left leading-snug max-w-[92%]">
          <div className="text-amber-300 font-semibold tracking-wide">{title}</div>
          {subtitle ? <div className="mt-0.5 text-sm text-neutral-400">{subtitle}</div> : null}
        </div>
        <div className="shrink-0 text-neutral-500">
          {open ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </div>
      </button>
      <div
        className={[
          "grid transition-all duration-200",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 hidden",
        ].join(" ")}
      >
        <div className="px-4 sm:px-5 pb-5 pt-0">{children}</div>
      </div>
    </section>
  );
};

const EntryCard: React.FC<{ entry: CodexEntry }> = ({ entry }) => (
  <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4">
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

const EmptyHint = ({ label }: { label: string }) => (
  <div className="text-sm text-neutral-500 italic">{label}</div>
);

// ───────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────
export default function CodexPage() {
  const [q, setQ] = useState("");
  const [openTiers, setOpenTiers] = useState<{ [k: number]: boolean }>({});
  const [elementsOpen, setElementsOpen] = useState<boolean>(false);
  const [codexOpen, setCodexOpen] = useState<boolean>(false);
  const [medicinesOpen, setMedicinesOpen] = useState<boolean>(false); // at bottom

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
          title={<span>Codex of Liberation</span>}
          subtitle="45 Chains — Ego ↔ Essence map"
          open={codexOpen}
          onToggle={() => setCodexOpen((v) => !v)}
        >
          {/* TIER 1 */}
          <SectionShell
            title={
              <span>
                Tier 1 — <span className="text-neutral-200">Gross Chains</span>
              </span>
            }
            subtitle="The raw instincts — Lust through Ignorance."
            open={!!openTiers[1]}
            onToggle={() => toggleTier(1)}
          >
            {tierList(1).length ? (
              <div className="grid gap-4">
                {tierList(1).map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            ) : (
              <EmptyHint label="No Tier 1 entries in data yet. Add them to ENTRIES." />
            )}
          </SectionShell>

          {/* TIER 2 */}
          <SectionShell
            title={
              <span>
                Tier 2 — <span className="text-neutral-200">Refined Chains</span>
              </span>
            }
            subtitle="Subtle ego strategies — Doubt through Distraction."
            open={!!openTiers[2]}
            onToggle={() => toggleTier(2)}
          >
            {tierList(2).length ? (
              <div className="grid gap-4">
                {tierList(2).map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            ) : (
              <EmptyHint label="No Tier 2 entries in data yet. Add them to ENTRIES." />
            )}
          </SectionShell>

          {/* TIER 3 */}
          <SectionShell
            title={
              <span>
                Tier 3 — <span className="text-neutral-200">Hidden Chains</span>
              </span>
            }
            subtitle="Invisible habits of mind — Addiction to Thinking through False Forgiveness."
            open={!!openTiers[3]}
            onToggle={() => toggleTier(3)}
          >
            {tierList(3).length ? (
              <div className="grid gap-4">
                {tierList(3).map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            ) : (
              <EmptyHint label="No Tier 3 entries in data yet. Add them to ENTRIES." />
            )}
          </SectionShell>

          {/* TIER 4 */}
          <SectionShell
            title={
              <span>
                Tier 4 — <span className="text-neutral-200">False Light Chains</span>
              </span>
            }
            subtitle="Ego wearing spiritual clothes — Spiritual Pride through False Unity."
            open={!!openTiers[4]}
            onToggle={() => toggleTier(4)}
          >
            {tierList(4).length ? (
              <div className="grid gap-4">
                {tierList(4).map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            ) : (
              <EmptyHint label="No Tier 4 entries in data yet. Add them to ENTRIES." />
            )}
          </SectionShell>

          {/* TIER 5 */}
          <SectionShell
            title={
              <span>
                Tier 5 — <span className="text-neutral-200">Crown Chains</span>
              </span>
            }
            subtitle="The final illusions — Identification, Fear of Death, Forgetfulness, Denial, Consent."
            open={!!openTiers[5]}
            onToggle={() => toggleTier(5)}
          >
            {tierList(5).length ? (
              <div className="grid gap-4">
                {tierList(5).map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            ) : (
              <EmptyHint label="No Tier 5 entries in data yet. Add them to ENTRIES." />
            )}
          </SectionShell>
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
                <div
                  key={el.key}
                  className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4"
                >
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

        {/* Seven Medicines — now at the bottom */}
        <SectionShell
          title={<span>Seven Medicines of Awakening</span>}
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
                  <p className="text-sm text-amber-200">{m.mantra}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-neutral-950/40 border border-neutral-900/60 p-4">
            <p className="text-sm text-neutral-300">
              Move from crown downward or root upward. When a distortion appears (shame, grief, fear),
              apply its medicine (dignity, compassion, courage). This is your inner apothecary.
            </p>
          </div>
        </SectionShell>
      </div>
    </Shell>
  );
}
