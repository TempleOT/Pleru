// /app/api/blueprint/route.ts
import { NextRequest } from "next/server";
import type { Blueprint, BlueprintInput } from "@/types/blueprint";
import {
  lifePathFromAny,
  birthdayNumber,
  expressionNumber,
  soulUrgeNumber,
  personalityNumber,
  maturityNumber,
} from "@/lib/numerology";
import { askLLM, safeParseJson } from "@/lib/llm";

// --- helpers ---------------------------------------------------
type NumDetail = { key: string; label: string; value: string; reading: string };

function sanitizeDetails(arr: unknown, localNums: {
  lifePath: string; birthdayNumber: string; expression: string; soulUrge: string; personality: string; maturity: string;
}): NumDetail[] {
  if (!Array.isArray(arr)) return [];
  const allowed = new Map<string, { label: string; value: string }>([
    ["lifePath",      { label: "Life Path",    value: localNums.lifePath }],
    ["expression",    { label: "Expression",   value: localNums.expression }],
    ["soulUrge",      { label: "Soul Urge",    value: localNums.soulUrge }],
    ["personality",   { label: "Personality",  value: localNums.personality }],
    ["maturity",      { label: "Maturity",     value: localNums.maturity }],
    ["birthdayNumber",{ label: "Birthday",     value: localNums.birthdayNumber }],
    // optional: Balance, if you add it later
  ]);

  const out: NumDetail[] = [];
  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const key = String((raw as any).key || "");
    const reading = String((raw as any).reading || "").trim();
    if (!allowed.has(key) || !reading) continue;

    const { label, value } = allowed.get(key)!;
    out.push({ key, label, value, reading });
  }
  // stable, predictable order
  const order = ["lifePath","expression","soulUrge","personality","maturity","birthdayNumber"];
  out.sort((a,b)=> order.indexOf(a.key) - order.indexOf(b.key));
  return out;
}

// Build a complete Blueprint from local deterministic values + optional model text
function buildOut({
  localNums,
  modelJson,
}: {
  localNums: {
    lifePath: string;
    birthdayNumber: string;
    expression: string;
    soulUrge: string;
    personality: string;
    maturity: string;
  };
  modelJson: Partial<Blueprint>;
}): Blueprint {
  const details = sanitizeDetails(
    (modelJson as any)?.numerology?.details,
    localNums
  );

  return {
    numerology: {
      lifePath: localNums.lifePath,
      birthdayNumber: localNums.birthdayNumber,
      expression: localNums.expression,
      soulUrge: localNums.soulUrge,
      personality: localNums.personality,
      maturity: localNums.maturity,
      summary:
        modelJson.numerology?.summary ??
        "Mind map: Life Path sets the road; Expression builds the bridge; Soul Urge fuels the heart; Personality shapes first contact; Maturity blends Life Path + Expression into seasoned purpose.",
    },
    humanDesign:
      modelJson.humanDesign ?? {
        summary:
          "HD details will appear once the time/location engine is wired (Type, Strategy, Authority, Centers, Profile, Cross).",
      },
    divineIdentity:
      modelJson.divineIdentity ?? {
        summary:
          "Sun • Moon • Rising will populate after astrology wiring. For now, hold a clean question and practice presence.",
      },
    guidance:
      modelJson.guidance ?? {
        nextStep: "Sit 10 minutes in stillness; choose one aligned action today.",
      },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BlueprintInput;

    // ---------- Deterministic numerology (offline, no LLM) ----------
    const lp  = lifePathFromAny(body.birthDate) ?? "—";
    const bd  = birthdayNumber(body.birthDate) ?? "—";
    const ex  = expressionNumber(body.fullName || "");
    const su  = soulUrgeNumber(body.fullName || "");
    const pe  = personalityNumber(body.fullName || "");
    const mat = maturityNumber(lp, ex);

    const localNums = {
      lifePath: lp,
      birthdayNumber: bd,
      expression: ex,
      soulUrge: su,
      personality: pe,
      maturity: mat,
    };

    // ---------- Ask the local model ONLY for text ----------
    // It must return summaries + a details[] array of readings (no numbers).
    const system = `You are Aletheia, the quiet guide voice of the Pleru app.

Return STRICT JSON ONLY with exactly this shape (no prose, no markdown):

{
  "numerology": {
    "summary": "string",
    "details": [
      { "key": "lifePath", "reading": "string" },
      { "key": "expression", "reading": "string" },
      { "key": "soulUrge", "reading": "string" },
      { "key": "personality", "reading": "string" },
      { "key": "maturity", "reading": "string" },
      { "key": "birthdayNumber", "reading": "string" }
    ]
  },
  "humanDesign": { "summary": "string", "type"?: "string", "authority"?: "string" },
  "divineIdentity": { "summary": "string", "sun"?: "string", "moon"?: "string", "rising"?: "string" },
  "guidance": { "nextStep": "string" }
}

Rules:
- Do NOT compute or restate any numbers; they are already computed server-side.
- Keys in numerology.details MUST be from this exact set.
- Tone: precise, grounded, compassionate, Gnostic.
- Keep each reading 2–6 sentences, direct and clear.`;

    const user = `Inputs (numbers already computed—do not change them):
Full Name: ${body.fullName || "—"}
Birth Date: ${body.birthDate || "—"}
Birth Time: ${body.birthTime || "—"}
Birth Location: ${body.birthLocation || "—"}

Numerology (fixed):
- Life Path: ${lp}
- Birthday: ${bd}
- Expression: ${ex}
- Soul Urge: ${su}
- Personality: ${pe}
- Maturity: ${mat}

Write:
1) A short overall summary for numerology (Ego ↔ Essence).
2) A "details" reading for EACH key listed in the schema above (use the fixed numbers implicitly, but do not print numbers unless helpful in the prose).
3) Brief Human Design + Divine Identity summaries (practical, if specifics unknown).
4) One clear next step in "guidance".
Return ONLY the JSON shape defined by system.`;

    let modelJson: Partial<Blueprint> = {};
    try {
      const raw = await askLLM({ system, user, json: true });
      modelJson = safeParseJson<Partial<Blueprint>>(raw);
    } catch {
      // If the local model is unavailable, defaults below will handle it.
    }

    const out = buildOut({ localNums, modelJson });
    return new Response(JSON.stringify(out), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch {
    // Graceful failure with a safe payload so UI still renders
    const fallback: Blueprint = {
      numerology: {
        lifePath: "—",
        birthdayNumber: "—",
        expression: "—",
        soulUrge: "—",
        personality: "—",
        maturity: "—",
        summary:
          "Baseline generation active. Once the local model is reachable, summaries will deepen here.",
      },
      humanDesign: {
        summary:
          "Awaiting HD engine. Provide accurate birth time/location and we’ll populate Type, Strategy, Authority, and Centers.",
      },
      divineIdentity: {
        summary:
          "Astrology engine pending. Sun/Moon/Rising will appear here once wired.",
      },
      guidance: { nextStep: "Protect one hour for your real work today." },
    };
    return new Response(JSON.stringify(fallback), {
      headers: { "Content-Type": "application/json" },
      status: 200, // keep UX smooth
    });
  }
}
