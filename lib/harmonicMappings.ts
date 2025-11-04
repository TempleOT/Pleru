// lib/harmonicMapping.ts
// Temple-of-Truth • Numerology ↔ Note ↔ Chakra mapping
// Drop-in module for Pleru music analyzer

export type Element = "Earth" | "Water" | "Air" | "Fire" | "Ether";
export type Chakra =
  | "Root"
  | "Sacral"
  | "Solar Plexus"
  | "Heart"
  | "Throat"
  | "Third Eye"
  | "Crown";

export type NoteName =
  | "C" | "C#" | "Db"
  | "D" | "D#" | "Eb"
  | "E"
  | "F" | "F#" | "Gb"
  | "G" | "G#" | "Ab"
  | "A" | "A#" | "Bb"
  | "B";

export type NumNoteMap = {
  number: 1|2|3|4|5|6|7|8|9;
  notes: NoteName[];         // core note(s) for this number
  chakra: Chakra;
  element: Element | `${Element}–${Element}`; // blended when relevant
  color: string;             // UI hex (chakra-inspired, tweak to your palette)
  qualities: string[];       // short keywords used in UI chips/tooltips
  // Optional “anchor” pitch suggestions (octave-agnostic; use helper to get Hz)
  anchor?: { note: NoteName, octave: number }[]; // e.g. [{note:'E', octave:4}]
};

// ──────────────────────────────────────────────────────────────
// FULL MAPPING (Pythagorean numbers 1–9)
// Notes chosen to align meaningfully with chakra correspondences.
// You can adjust alt spellings/enharmonics to match your UI preferences.
// ──────────────────────────────────────────────────────────────
export const NUM_NOTE_CHARKA_MAP: NumNoteMap[] = [
  {
    number: 1,
    notes: ["E"],
    chakra: "Solar Plexus",
    element: "Fire",
    color: "#F5A623",
    qualities: ["Will", "Ignition", "Leadership", "Initiation"],
    anchor: [{ note: "E", octave: 4 }],
  },
  {
    number: 2,
    notes: ["D"],
    chakra: "Sacral",
    element: "Water",
    color: "#FF7F50",
    qualities: ["Union", "Sensitivity", "Polarity", "Receptivity"],
    anchor: [{ note: "D", octave: 4 }],
  },
  {
    number: 3,
    notes: ["G"],
    chakra: "Throat",
    element: "Air",
    color: "#3BA7FF",
    qualities: ["Expression", "Joy", "Creativity", "Communication"],
    anchor: [{ note: "G", octave: 4 }],
  },
  {
    number: 4,
    notes: ["C"],
    chakra: "Root",
    element: "Earth",
    color: "#C14444",
    qualities: ["Structure", "Order", "Discipline", "Foundation"],
    anchor: [{ note: "C", octave: 4 }],
  },
  {
    number: 5,
    notes: ["F"],
    chakra: "Heart",
    element: "Air–Fire",
    color: "#33C38C",
    qualities: ["Freedom", "Movement", "Curiosity", "Bridge"],
    anchor: [{ note: "F", octave: 4 }],
  },
  {
    number: 6,
    notes: ["F#", "G"],
    chakra: "Heart",
    element: "Water–Earth",
    color: "#2FBF71",
    qualities: ["Care", "Devotion", "Harmony", "Restoration"],
    anchor: [{ note: "F#", octave: 4 }, { note: "G", octave: 4 }],
  },
  {
    number: 7,
    notes: ["A"],
    chakra: "Third Eye",
    element: "Ether",
    color: "#7D7BFF",
    qualities: ["Wisdom", "Insight", "Analysis", "Truth"],
    anchor: [{ note: "A", octave: 4 }],
  },
  {
    number: 8,
    notes: ["B"],
    chakra: "Crown",
    element: "Fire–Earth",
    color: "#C58CFF",
    qualities: ["Power", "Authority", "Manifestation", "Rhythm"],
    anchor: [{ note: "B", octave: 3 }, { note: "B", octave: 4 }],
  },
  {
    number: 9,
    notes: ["C"], // higher octave return to unity
    chakra: "Crown",
    element: "Ether",
    color: "#E6D5FF",
    qualities: ["Completion", "Compassion", "Universal", "Return"],
    anchor: [{ note: "C", octave: 5 }],
  },
];

// Quick lookup by number (1–9)
export const NUMBER_MAP: Record<number, NumNoteMap> =
  Object.fromEntries(NUM_NOTE_CHARKA_MAP.map(m => [m.number, m])) as Record<number, NumNoteMap>;

// Optional: map note → chakra (for when you detect musical note first)
export const NOTE_TO_CHAKRA: Record<NoteName, Chakra> = {
  C: "Root", "C#": "Heart", Db: "Heart",
  D: "Sacral", "D#": "Throat", Eb: "Throat",
  E: "Solar Plexus",
  F: "Heart", "F#": "Heart", Gb: "Heart",
  G: "Throat", "G#": "Third Eye", Ab: "Third Eye",
  A: "Third Eye", "A#": "Crown", Bb: "Crown",
  B: "Crown",
};

// ──────────────────────────────────────────────────────────────
// Frequency helpers (12-TET). Works with any tuning; default A4 = 440 Hz.
// ──────────────────────────────────────────────────────────────

// For MIDI: A4=69
const NOTE_INDEX: Record<Exclude<NoteName, "Db" | "Eb" | "Gb" | "Ab" | "Bb">, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};
// enharmonics map to sharps for consistency
const ENHARMONIC: Partial<Record<NoteName, NoteName>> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

export function noteToMidi(note: NoteName, octave: number): number {
  const n = ENHARMONIC[note] ?? note;
  const idx = NOTE_INDEX[n as keyof typeof NOTE_INDEX];
  return (octave + 1) * 12 + idx; // MIDI formula with C-1 = 0
}

export function midiToFreq(midi: number, A4 = 440): number {
  return +(A4 * Math.pow(2, (midi - 69) / 12)).toFixed(4);
}

export function noteFreq(note: NoteName, octave: number, A4 = 440): number {
  return midiToFreq(noteToMidi(note, octave), A4);
}

// Get suggested anchor frequencies (Hz) for a numerology number (1–9)
export function numberAnchorFrequencies(num: number, A4 = 440): number[] {
  const m = NUMBER_MAP[num];
  if (!m?.anchor) return [];
  return m.anchor.map(a => noteFreq(a.note, a.octave, A4));
}

// ──────────────────────────────────────────────────────────────
// UI helpers
// ──────────────────────────────────────────────────────────────

// Produce a short, human-readable sentence like:
// "Will ignites through Devotion into Form."
export function top3NumbersToMessage(nums: number[]): string {
  const safe = nums
    .filter(n => NUMBER_MAP[n])
    .slice(0, 3)
    .map(n => NUMBER_MAP[n]);

  if (safe.length === 0) return "";
  const [a, b, c] = safe;

  const partA = a ? (a.qualities[0] || "Will") : "";
  const partB = b ? (b.qualities[0] || "Flow") : "";
  const partC = c ? (c.qualities[0] || "Form") : "";

  return `${partA} ${b ? "moves through " + partB : ""}${c ? " into " + partC : ""}.`.trim();
}

// Return chakra + element + color for a detected musical note
export function describeNote(note: NoteName): { chakra: Chakra; element: Element | `${Element}–${Element}`; color: string } {
  // Find first mapping that contains this note (or its enharmonic)
  const canonical = ENHARMONIC[note] ?? note;
  const hit = NUM_NOTE_CHARKA_MAP.find(m => m.notes.includes(canonical as NoteName));
  if (hit) return { chakra: hit.chakra, element: hit.element, color: hit.color };
  // Fallback by NOTE_TO_CHAKRA only
  const chakra = NOTE_TO_CHAKRA[canonical as NoteName] ?? "Root";
  // choose a representative mapping for chakra
  const fallback = NUM_NOTE_CHARKA_MAP.find(m => m.chakra === chakra) ?? NUMBER_MAP[4];
  return { chakra, element: fallback.element, color: fallback.color };
}

// Convenience accessor
export const numberInfo = (n: number) => NUMBER_MAP[n];
