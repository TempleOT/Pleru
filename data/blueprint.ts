export type Block = {
  id: string;
  title: string;
  brief: string;
  items?: { label: string; note?: string }[];
};

export const blueprint: Block[] = [
  {
    id: "identity",
    title: "Identity & Aesthetic",
    brief:
      "Temple of Truth — dark sacred minimalism with gold highlights, soft ambient motion.",
    items: [
      { label: "Brand", note: "Hands of Remembering • Gold orb held between hands" },
      { label: "Palette", note: "Neutral-950, Gold #E7C873, Emerald accents" },
      { label: "Atmosphere", note: "Ambient field + subtle motion (Framer Motion)" }
    ]
  },
  {
    id: "pillars",
    title: "Pillars (Experience)",
    brief:
      "The four primary pathways of the app, each a doorway back to Essence.",
    items: [
      { label: "Bridge", note: "Sacred entry; sets tone and intention" },
      { label: "Reflect", note: "Guided journaling in Gnostic tone (Supabase sync)" },
      { label: "Codex", note: "Ego ↔ Essence library with Temple Keys (tiers 1–6)" },
      { label: "Flame", note: "Progress Flame mirrors alignment over time" }
    ]
  },
  {
    id: "algorithm",
    title: "Algorithm of Awakening",
    brief:
      "Mind • Body • Spirit triad mapped into a single interpretive layer.",
    items: [
      { label: "Numerology (Mind)", note: "Core numbers, cycles, Ego↔Essence framing" },
      { label: "Human Design (Body)", note: "Type, Strategy, Authority, Centers" },
      { label: "Divine Identity (Spirit)", note: "Sun • Moon • Rising; role & mastery" }
    ]
  },
  {
    id: "elements",
    title: "Elements (5)",
    brief:
      "Fire • Air • Water • Earth • Ether — harmonized rather than favored.",
    items: [
      { label: "Fire", note: "Clean action in service of truth" },
      { label: "Air", note: "Clarity & language of understanding" },
      { label: "Water", note: "Compassion with boundaries" },
      { label: "Earth", note: "Living structure and rhythm" },
      { label: "Ether", note: "Presence that holds the four" }
    ]
  },
  {
    id: "systems",
    title: "Systems & Infra",
    brief:
      "What runs beneath: storage, automations, and optional generation.",
    items: [
      { label: "Supabase", note: "Profiles, journals, codex content" },
      { label: "n8n", note: "Daily numerology, content pipelines (optional)" },
      { label: "TTS & Media", note: "FFmpeg, local TTS, Stable Diffusion (optional)" }
    ]
  },
  {
    id: "tone",
    title: "Voice & Ritual",
    brief:
      "Temple-of-Truth style: direct, compassionate, mirror +1 with a quiet bell ending.",
    items: [
      { label: "Ambient", note: "Piano/space pad toggle (localStorage)" },
      { label: "Prompts", note: "Short, piercing, actionable reflections" },
      { label: "Mantras", note: "Ego → Essence bridges; saved to user’s thread" }
    ]
  }
];
