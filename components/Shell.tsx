"use client";

import React from "react";
import { LeftPanel } from "./LeftPanel";
import AmbientBackground from "./AmbientBackground";
import InfoBar from "./InfoBar";
import SettingsPanel from "./SettingsPanel";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-200 overflow-hidden flex flex-col">
      {/* Background lights */}
      <AmbientBackground />

      {/* Left docked nav */}
      <LeftPanel />

      {/* Main content */}
      <main
        className="
          relative z-10
          flex
          flex-1
          justify-center
          items-center
          px-6
          md:px-16
          lg:px-20
          xl:px-24
          py-16
          text-center
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
