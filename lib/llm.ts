// lib/llm.ts
export type LLMProvider = "ollama" | "openai";

/**
 * askLLM
 * - Defaults to local Ollama (http://localhost:11434)
 * - Can switch to OpenAI later by setting env LLM_PROVIDER=openai
 * - If `json` is true, returns the model's message content (expected JSON string)
 */
export async function askLLM({
  system,
  user,
  json = true,
  provider = (process.env.LLM_PROVIDER as LLMProvider) || "ollama",
}: {
  system: string;
  user: string;
  json?: boolean;
  provider?: LLMProvider;
}): Promise<string> {
  if (provider === "ollama") {
    const model = process.env.OLLAMA_MODEL || "qwen3:4b";
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        // Force JSON formatting when desired, and keep context modest for 8GB VRAM
        options: { format: json ? "json" : undefined, num_ctx: 2048 },
        stream: false,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }
    const data = await res.json();
    // Ollama returns { message: { content: string } }
    return data.message?.content ?? "";
  }

  // Optional: OpenAI fallback (only used if LLM_PROVIDER=openai and OPENAI_API_KEY set)
  const key = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Safe JSON parse helper: returns {} on failure (never throws) */
export function safeParseJson<T = any>(raw: string): T {
  try {
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}
