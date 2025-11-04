"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Mode = "builtin" | "url" | "file";
type SavedPrefs = {
  mode: Mode;
  src?: string;
  volume: number;
  loop: boolean;
  autoplay: boolean; // <- NEW
};
type AmbientState = SavedPrefs & { isPlaying: boolean };

type AmbientApi = {
  state: AmbientState;
  setMode: (m: Mode, src?: string) => void;
  setVolume: (v: number) => void;
  setLoop: (v: boolean) => void;
  play: () => Promise<void>;
  pause: () => void;
};

const STORAGE_KEY = "pleru.ambient";
const DEFAULTS: AmbientState = {
  mode: "builtin",
  volume: 0.35,
  loop: true,
  autoplay: false,
  isPlaying: false,
};

const AmbientCtx = createContext<AmbientApi | null>(null);

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AmbientState>(DEFAULTS);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved prefs once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SavedPrefs = JSON.parse(raw);
        setState((s) => ({ ...s, ...saved, isPlaying: false }));
      }
    } catch {}
  }, []);

  // Persist prefs whenever these change (but not isPlaying)
  useEffect(() => {
    const { mode, src, volume, loop, autoplay } = state;
    const toSave: SavedPrefs = { mode, src, volume, loop, autoplay };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [state.mode, state.src, state.volume, state.loop, state.autoplay]);

  // Configure the element
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = state.volume;
    el.loop = state.loop;
  }, [state.volume, state.loop]);

  const resolvedSrc = useMemo(() => {
    return state.mode === "builtin" ? "/ambient/pad.mp3" : state.src || "";
  }, [state.mode, state.src]);

  // If we remount and user had autoplay=true, resume
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.src = resolvedSrc;
    el.load();

    if (state.autoplay) {
      // try to resume; if page just loaded without user gesture, browser may block
      el
        .play()
        .then(() => setState((s) => ({ ...s, isPlaying: true })))
        .catch(() => {
          // stay paused; user will press play once and it will continue
          setState((s) => ({ ...s, isPlaying: false }));
        });
    }
  }, [resolvedSrc]); // run when source changes

  const play = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      await el.play();
      setState((s) => ({ ...s, isPlaying: true, autoplay: true })); // remember to keep playing
    } catch (e) {
      console.warn("Audio play blocked/error:", e);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false, autoplay: false })); // stop resuming
  };

  const setMode = (m: Mode, src?: string) => {
    setState((s) => ({ ...s, mode: m, src }));
    const el = audioRef.current;
    if (!el) return;
    const wasPlaying = !el.paused;
    el.src = m === "builtin" ? "/ambient/pad.mp3" : src || "";
    el.load();
    if (wasPlaying) {
      void el.play().then(() => setState((s) => ({ ...s, isPlaying: true })));
    }
  };

  const setVolume = (v: number) => {
    if (v < 0) v = 0;
    if (v > 1) v = 1;
    setState((s) => ({ ...s, volume: v }));
    if (audioRef.current) audioRef.current.volume = v;
  };

  const setLoop = (v: boolean) => setState((s) => ({ ...s, loop: v }));

  const value: AmbientApi = { state, setMode, setVolume, setLoop, play, pause };

  return (
    <AmbientCtx.Provider value={value}>
      {/* Persistent audio element */}
      <audio ref={audioRef} preload="auto" />
      {children}
    </AmbientCtx.Provider>
  );
}

export function useAmbient() {
  const ctx = useContext(AmbientCtx);
  if (!ctx) throw new Error("useAmbient must be used within <AmbientProvider>");
  return ctx;
}
