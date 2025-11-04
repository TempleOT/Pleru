// /app/lib/llm.ts
type AskArgs = {
  system: string;
  user: string;
  json?: boolean;      // when true, ask model to return strict JSON
  temperature?: number;
  timeoutMs?: number;
};

const OLLAMA_HOST =
  process.env.OLLAMA_HOST ||
  process.env.OLLAMA_URL ||           // allow either name
  "http://127.0.0.1:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  process.env.NEXT_PUBLIC_OLLAMA_MODEL ||
  "qwen3:4b";

// Extract the first plausible JSON object from messy text
export function safeParseJson<T = any>(raw: string, fallback: T = {} as T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // try to pull the first {...} block
    const m = raw.match(/\{[\s\S]*\}$/m) || raw.match(/\{[\s\S]*?\}/m);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {}
    }
    return fallback;
  }
}

export async function askLLM({
  system,
  user,
  json = true,
  temperature = 0.2,
  timeoutMs = 60000,
}: AskArgs): Promise<string> {
  // Ollama /api/chat expects: { model, messages, stream, options, format? }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const body: any = {
    model: OLLAMA_MODEL,
    stream: false,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    options: { temperature },
  };

  if (json) body.format = "json";  // tells supporting models to emit strict JSON

  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(t);

  if (!res.ok) {
    // return empty json so your route falls back gracefully
    return "{}";
  }

  const payload = await res.json();
  // Standard Ollama chat response: { message: { content: "..." }, ... }
  const text: string = payload?.message?.content ?? "";
  return text || "{}";
}
