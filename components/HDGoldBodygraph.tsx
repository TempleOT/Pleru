// components/HDGoldBodygraph.tsx
"use client";

import React from "react";

// center names we'll support
type CenterId =
  | "head"
  | "ajna"
  | "throat"
  | "g"
  | "heart"
  | "sacral"
  | "solar"
  | "spleen"
  | "root";

type HDGoldBodygraphProps = {
  definedCenters?: CenterId[];     // e.g. ["sacral", "throat"]
  highlightedChannels?: string[];   // e.g. ["1-8", "7-31"]
  name?: string;
};

export default function HDGoldBodygraph({
  definedCenters = [],
  highlightedChannels = [],
  name = "Essence Bodygraph",
}: HDGoldBodygraphProps) {
  // positions tuned for a 3/5-ish box
  const centers: Array<{
    id: CenterId;
    top: string;
    left: string;
    w: number;
    h: number;
    label: string;
    rounded?: string;
  }> = [
    { id: "head", top: "2%", left: "50%", w: 70, h: 55, label: "Head", rounded: "rounded-b-2xl" },
    { id: "ajna", top: "11%", left: "50%", w: 80, h: 65, label: "Ajna", rounded: "rounded-2xl" },
    { id: "throat", top: "22%", left: "50%", w: 90, h: 65, label: "Throat", rounded: "rounded-xl" },
    { id: "g", top: "35%", left: "50%", w: 110, h: 90, label: "G Center", rounded: "rounded-2xl" },
    { id: "heart", top: "34%", left: "65%", w: 60, h: 45, label: "Heart", rounded: "rounded-lg" },
    { id: "spleen", top: "45%", left: "27%", w: 80, h: 90, label: "Spleen", rounded: "rounded-3xl" },
    { id: "sacral", top: "52%", left: "50%", w: 110, h: 90, label: "Sacral", rounded: "rounded-2xl" },
    { id: "solar", top: "62%", left: "73%", w: 88, h: 90, label: "Solar", rounded: "rounded-3xl" },
    { id: "root", top: "77%", left: "50%", w: 120, h: 80, label: "Root", rounded: "rounded-2xl" },
  ];

  // simple channel list (just a few to show idea)
  const channels: Array<{
    id: string;
    from: CenterId;
    to: CenterId;
  }> = [
    { id: "head-ajna", from: "head", to: "ajna" },
    { id: "ajna-throat", from: "ajna", to: "throat" },
    { id: "throat-g", from: "throat", to: "g" },
    { id: "g-sacral", from: "g", to: "sacral" },
    { id: "sacral-root", from: "sacral", to: "root" },
    { id: "spleen-sacral", from: "spleen", to: "sacral" },
    { id: "heart-g", from: "heart", to: "g" },
    { id: "solar-sacral", from: "solar", to: "sacral" },
  ];

  // helper to get center coords for channels
  const getCenterPos = (id: CenterId) => {
    const c = centers.find((c) => c.id === id);
    if (!c) return { x: 0, y: 0 };
    // convert % to px inside 320x?
    // we'll rely on absolute percentage instead: return center as CSS var?
    return c;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-5">
      <p className="text-xs tracking-wide uppercase text-neutral-500 mb-3">Essence Bodygraph</p>
      <div className="flex gap-6">
        {/* diagram */}
        <div className="relative w-40 sm:w-48 aspect-[3/5] mx-auto">
          {/* subtle silhouette glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.18),transparent_60%)] pointer-events-none" />

          {/* channels (we'll approximate with simple rotated lines) */}
          {channels.map((ch) => {
            const from = centers.find((c) => c.id === ch.from);
            const to = centers.find((c) => c.id === ch.to);
            if (!from || !to) return null;

            // coords in %
            const x1 = 50; // we'll center horizontally and then offset with left %
            // we’ll approximate with a simple vertical line for now
            const highlighted = highlightedChannels.includes(ch.id);
            return (
              <div
                key={ch.id}
                className={`absolute left-1/2 h-14 w-[3px] -translate-x-1/2 ${
                  highlighted ? "bg-gold" : "bg-gold/20"
                }`}
                style={{
                  top: ch.id === "head-ajna" ? "7%" : ch.id === "ajna-throat" ? "16%" : ch.id === "throat-g" ? "27%" : ch.id === "g-sacral" ? "46%" : ch.id === "sacral-root" ? "73%" : "50%",
                }}
              />
            );
          })}

          {/* centers */}
          {centers.map((c) => {
            const defined = definedCenters.includes(c.id);
            return (
              <div
                key={c.id}
                className={`
                  absolute
                  -translate-x-1/2
                  border
                  ${c.rounded ?? "rounded-xl"}
                  flex items-center justify-center
                  transition
                  ${defined ? "bg-gold/80 border-gold text-neutral-950" : "bg-neutral-950/40 border-gold/20 text-neutral-200"}
                `}
                style={{
                  top: c.top,
                  left: c.left,
                  width: c.w,
                  height: c.h,
                }}
              >
                <span className="text-[10px] tracking-wide uppercase text-center leading-tight px-1">
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* side info */}
        <div className="hidden sm:block flex-1 space-y-2">
          <h2 className="text-sm font-semibold text-gold">{name}</h2>
          <p className="text-xs text-neutral-400">
            Golden Human Design layout. Centers turn gold when defined. Channels can be highlighted by id.
          </p>
          <p className="text-xs text-neutral-500">
            Next step: replace this with real coordinates + gate numbers from backend.
          </p>
        </div>
      </div>
    </div>
  );
}
