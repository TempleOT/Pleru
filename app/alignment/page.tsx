"use client";

import Shell from "@/components/Shell";

export default function AlignmentPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gold">Alignment</h1>
          <p className="text-neutral-400 mt-1">
            Daily synchrony, tuned to your Divine Identity.
          </p>
        </div>

        {/* alignment bar like the PDF vibes */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-300">Alignment</span>
            <span className="text-sm text-gold font-medium">42%</span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full"
              style={{ width: "42%" }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Today’s signal: staying within your rhythm — keep it gentle, devotional, and clear.
          </p>
        </div>

        {/* placeholder / coming soon */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
          <h2 className="text-lg font-medium text-gold">What this space will do</h2>
          <p className="text-neutral-400 text-sm">
            This view will eventually pull from your numerology / natal profile and surface a
            small daily key — a sentence, color, or practice — to help you move from Ego → Essence.
          </p>
        </div>
      </div>
    </Shell>
  );
}
