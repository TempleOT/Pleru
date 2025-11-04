// /lib/numerology.ts
// Pythagorean mapping (A1–Z26 → 1..9)
const P_MAP: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};
const VOWELS = new Set(["A","E","I","O","U","Y"]); // include Y (common modern practice)

// ---- core reducers ----
export function reduceKeepMasters(n: number): number {
  const keep = new Set([11,22,33]);
  while (n > 9 && !keep.has(n)) {
    n = n
      .toString()
      .split("")
      .reduce((a, b) => a + parseInt(b, 10), 0);
  }
  return n;
}

export function digitsSumOfString(s: string): number {
  return s.replace(/\D/g,"").split("").reduce((a,b)=>a + parseInt(b,10), 0);
}

// ---- Life Path & Birthday ----
export function lifePathFromAny(input: string): string | null {
  // accepts "YYYY-MM-DD" or "MM/DD/YYYY"
  let ymd: string | null = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    ymd = input;
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [mm,dd,yyyy] = input.split("/");
    ymd = `${yyyy}-${mm}-${dd}`;
  } else {
    return null;
  }

  const sum = digitsSumOfString(ymd);
  return String(reduceKeepMasters(sum));
}

export function birthdayNumber(input: string): string | null {
  // input "YYYY-MM-DD" only
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const day = parseInt(input.split("-")[2], 10);
  return String(reduceKeepMasters(day));
}

// ---- Name numbers ----
function normalizeName(name: string) {
  return name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function nameToSum(name: string) {
  const s = normalizeName(name).replace(/[^A-Z]/g,"");
  return s.split("").reduce((acc, ch) => acc + (P_MAP[ch] || 0), 0);
}
function nameVowelsSum(name: string) {
  const s = normalizeName(name).replace(/[^A-Z]/g,"");
  return s.split("").reduce((acc, ch) => acc + (VOWELS.has(ch) ? (P_MAP[ch]||0) : 0), 0);
}
function nameConsonantsSum(name: string) {
  const s = normalizeName(name).replace(/[^A-Z]/g,"");
  return s.split("").reduce((acc, ch) => acc + (!VOWELS.has(ch) ? (P_MAP[ch]||0) : 0), 0);
}

/** Expression / Destiny number from full name */
export function expressionNumber(name: string): string {
  const n = nameToSum(name);
  return String(reduceKeepMasters(n));
}

/** Soul Urge (Heart’s Desire) from vowels of full name */
export function soulUrgeNumber(name: string): string {
  const n = nameVowelsSum(name);
  return String(reduceKeepMasters(n));
}

/** Personality from consonants of full name */
export function personalityNumber(name: string): string {
  const n = nameConsonantsSum(name);
  return String(reduceKeepMasters(n));
}

/** Maturity = reduce(Life Path + Expression), master-keep */
export function maturityNumber(lifePath: string | null, expression: string): string {
  const lp = parseInt((lifePath ?? "0").replace(/\D/g,""), 10) || 0;
  const ex = parseInt(expression.replace(/\D/g,""), 10) || 0;
  return String(reduceKeepMasters(lp + ex));
}
