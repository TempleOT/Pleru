import { NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || process.env.NEXT_PUBLIC_OLLAMA_MODEL || "qwen3:4b";

export async function POST(req: Request) {
  const { identity, name = "Seeker" } = await req.json();
  const system = `You are Aletheia, Temple-of-Truth voice. Tone: Compassion + Clarity, Truth + Trigger.
Return a concise Ego ↔ Essence reading from Sun, Moon, Asc, MC, and notable aspects.`;

  const user = JSON.stringify(identity);

  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: `${system}\nName: ${name}\nDivine Identity JSON:\n${user}\n\nWrite the reading now.`,
      stream: false,
    }),
  });

  const data = await r.json();
  const text = data?.response ?? "";
  return NextResponse.json({ text });
}
