"use client";

import React from "react";
import { LeftPanel } from "./LeftPanel";
import AmbientBackground from "./AmbientBackground";
import InfoBar from "./InfoBar";
import SettingsPanel from "./SettingsPanel";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-200 overflow-hidden">
      {/* Background lights */}
      <AmbientBackground />

      {/* Left docked nav */}
      <LeftPanel />

      {/* Main content */}
      <main
        className="
          relative z-10
          w-full
          pl-24           /* space for left panel */
          pr-6
          md:pr-16        /* start balancing on medium screens */
          lg:pr-20
          xl:pr-24        /* roughly matches pl-24 */
          py-16
          flex
          justify-center
        "
      >
        {/* Centered inner container */}
        <div className="relative w-full max-w-6xl mx-auto space-y-8">
          <InfoBar />
          {children}
        </div>
      </main>

      {/* Drawer + toggle button (top-right) */}
      <SettingsPanel />
    </div>
  );
}
