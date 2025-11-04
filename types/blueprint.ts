// /types/blueprint.ts

// A single detailed reading for one core number.
// `key` is restricted so the UI/order is predictable and safe.
export type NumerologyDetail = {
  key:
    | "lifePath"
    | "expression"
    | "soulUrge"
    | "personality"
    | "maturity"
    | "birthdayNumber";
  /** Human-facing label to show in the UI (e.g., "Life Path"). */
  label: string;
  /** The computed value for this number (injected server-side). */
  value: string;
  /** Gnostic-style interpretation text (2–6 sentences). */
  reading: string;
};

export type NumerologyBlock = {
  lifePath: string;
  birthdayNumber: string;
  expression: string;   // from full name (all letters)
  soulUrge: string;     // from vowels
  personality: string;  // from consonants
  maturity: string;     // reduce(lifePath + expression), master-keep
  summary?: string;     // optional high-level gloss
  // NEW: per-number readings; populated by the API if the LLM returns them.
  details?: NumerologyDetail[];
};

export type HumanDesignBlock = {
  type?: string;
  authority?: string;
  summary?: string;
};

export type DivineIdentityBlock = {
  sun?: string;
  moon?: string;
  rising?: string;
  summary?: string;
};

export type GuidanceBlock = {
  nextStep: string;
};

export type Blueprint = {
  numerology: NumerologyBlock;
  humanDesign: HumanDesignBlock;
  divineIdentity: DivineIdentityBlock;
  guidance?: GuidanceBlock;
};

export type BlueprintInput = {
  fullName: string;
  birthDate: string;   // YYYY-MM-DD or MM/DD/YYYY
  birthTime?: string;
  birthLocation?: string;
};
