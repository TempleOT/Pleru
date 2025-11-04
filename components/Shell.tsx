"use client";

import React from "react";
import { LeftPanel } from "./LeftPanel";
import AmbientBackground from "./AmbientBackground";
import InfoBar from "./InfoBar";
import SettingsPanel from "./SettingsPanel";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-200">
      {/* Background lights */}
      <AmbientBackground />

      {/* Left docked nav */}
      <LeftPanel />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <InfoBar />
        {children}
      </main>

      {/* Drawer + toggle button (top-right) */}
      <SettingsPanel
        triggerLabel="Pleru topics"
        panelTitle="Pleru topics"
      />
    </div>
  );
}
