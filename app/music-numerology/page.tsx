"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Shell from "@/components/Shell";
import { Music2, ChevronDown, ChevronUp } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Music ⇄ Numerology — Multi-Band Readers + Embodiment Fusion
   ────────────────────────────────────────────────────────── */

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCHCLASS_TO_DIGIT: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ema = (prev: number | null, next: number, alpha: number) =>
  prev == null ? next : prev + alpha * (next - prev);

function midiToNoteName(midi: number | null) {
  if (midi == null) return "-";
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${octave}`;
}
function midiToPitchClass(midi: number | null) {
  if (midi == null) return null;
  return ((midi % 12) + 12) % 12;
}
function pitchClassToDigit(pc: number | null) {
  if (pc == null) return null;
  return PITCHCLASS_TO_DIGIT[pc];
}
function binToFreq(bin: number, sampleRate: number, fftBins: number) {
  const nyq = sampleRate / 2;
  return (bin * nyq) / fftBins;
}

function midiToFreqEqualTemp(midi: number, A4 = 440) {
  return A4 * Math.pow(2, (midi - 69) / 12);
}
function freqToMidiFloatEqualTemp(freq: number, A4 = 440) {
  return 69 + 12 * Math.log2(freq / A4);
}
function centsBetween(freq: number, midi: number, A4 = 440) {
  const fRef = midiToFreqEqualTemp(midi, A4);
  return 1200 * Math.log2(freq / fRef);
}
function snapFreqToNearestMidi(freq: number, A4 = 440) {
  if (!freq || !isFinite(freq)) return { midi: null as number | null, cents: 0 };
  const mFloat = freqToMidiFloatEqualTemp(freq, A4);
  const mRound = Math.round(mFloat);
  const cents = centsBetween(freq, mRound, A4);
  return { midi: mRound, cents };
}
function fmtCents(c: number) {
  const s = Math.round(c);
  return `${s >= 0 ? "+" : ""}${s}¢`;
}
function snapConfidence(cents: number) {
  const x = Math.min(100, Math.abs(cents));
  return Math.max(0, 1 - x / 100);
}

function topKPeaks(arr: Uint8Array, K: number, minDistance: number, noiseFloor = 8): number[] {
  const idx = Array.from(arr.keys()).sort((a, b) => arr[b] - arr[a]);
  const out: number[] = [];
  for (const i of idx) {
    if (arr[i] < noiseFloor) break;
    if (out.every((c) => Math.abs(c - i) >= minDistance)) {
      out.push(i);
      if (out.length >= K) break;
    }
  }
  return out;
}
function spectralFlatnessLinear(binsLin: Float32Array, startIdx = 0, endIdx?: number) {
  const hi = endIdx ?? binsLin.length - 1;
  const N = Math.max(1, hi - startIdx + 1);
  let geo = 0;
  let arith = 0;
  for (let i = startIdx; i <= hi; i++) {
    const v = Math.max(binsLin[i], 1e-8);
    geo += Math.log(v);
    arith += v;
  }
  const gmean = Math.exp(geo / N);
  const amean = arith / N;
  return gmean / Math.max(amean, 1e-8);
}
function parabolicInterp(mags: Float32Array | Uint8Array, i: number) {
  const L = mags.length;
  const i0 = Math.max(0, Math.min(L - 1, i));
  const im1 = Math.max(0, i0 - 1);
  const ip1 = Math.min(L - 1, i0 + 1);
  const ym1 = (mags as any)[im1];
  const y0 = (mags as any)[i0];
  const yp1 = (mags as any)[ip1];
  const denom = ym1 - 2 * y0 + yp1;
  if (denom === 0) return i0;
  const delta = (0.5 * (ym1 - yp1)) / denom;
  return i0 + clamp(delta, -1, 1);
}

type LiveSample = {
  t: number;
  freq: number;
  midi: number | null;
  note: string;
  digit: number | null;
  cents?: number;
};

const BASS_LOW_HZ = 60;
const BASS_HIGH_HZ = 300;

const H_LOW = { lo: 200, hi: 500 };
const H_MID = { lo: 500, hi: 1500 };
const H_HIGH = { lo: 1500, hi: 6000 };

const HARMONIC_PEAKS = 7;
const HARMONIC_MIN_DIST_BINS = 2;

const FLATNESS_GATE = 0.8;
const NOISE_FLOOR_U8 = 8;

const MAIN_NOTE_WINDOW = 150;
const KEY_WINDOW = 600;
const FFT_SIZE = 4096;
const SMOOTH_ALPHA = 0.22;

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const rotateProfile = (p: number[], s: number) => p.map((_, i, a) => a[(i - s + a.length) % a.length]);
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a: number[]) => Math.hypot(...a);
const corr = (a: number[], b: number[]) => {
  const n = norm(a) * norm(b);
  return n ? dot(a, b) / n : 0;
};
function estimateKeyFromPCCounts(counts: number[]) {
  let best = { tonic: 0, mode: "maj" as "maj" | "min", score: -1 };
  for (let t = 0; t < 12; t++) {
    const maj = corr(counts, rotateProfile(MAJOR_PROFILE, t));
    const min = corr(counts, rotateProfile(MINOR_PROFILE, t));
    if (maj > best.score) best = { tonic: t, mode: "maj", score: maj };
    if (min > best.score) best = { tonic: t, mode: "min", score: min };
  }
  const confidence = clamp((best.score + 1) / 2, 0, 1) * 100;
  return { tonicPC: best.tonic, mode: best.mode, confidence };
}

export default function MusicNumerologyPage() {
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [a4, setA4] = useState(440);

  const [wLow, setWLow] = useState(0.35);
  const [wMid, setWMid] = useState(0.45);
  const [wHigh, setWHigh] = useState(0.2);
  const [wBass, setWBass] = useState(0.25);

  const [rotateToTonic, setRotateToTonic] = useState(true);
  const [expandHarm, setExpandHarm] = useState(false);
  const [expandBass, setExpandBass] = useState(false);

  const [liveLow, setLiveLow] = useState<{
    freq: number;
    midi: number | null;
    note: string;
    digit: number | null;
    cents?: number;
  } | null>(null);
  const [liveMid, setLiveMid] = useState<{
    freq: number;
    midi: number | null;
    note: string;
    digit: number | null;
    cents?: number;
  } | null>(null);
  const [liveHigh, setLiveHigh] = useState<{
    freq: number;
    midi: number | null;
    note: string;
    digit: number | null;
    cents?: number;
  } | null>(null);

  const [bassFreq, setBassFreq] = useState(0);
  const [bassMidi, setBassMidi] = useState<number | null>(null);
  const [bassNote, setBassNote] = useState("-");
  const [bassDigit, setBassDigit] = useState<number | null>(null);
  const [bassCents, setBassCents] = useState<number | null>(null);

  const [lowSamples, setLowSamples] = useState<LiveSample[]>([]);
  const [midSamples, setMidSamples] = useState<LiveSample[]>([]);
  const [highSamples, setHighSamples] = useState<LiveSample[]>([]);
  const [bassSamplesState, setBassSamples] = useState<LiveSample[]>([]);

  const zeroCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } as Record<number, number>;
  const [lowCounts, setLowCounts] = useState<Record<number, number>>({ ...zeroCounts });
  const [midCounts, setMidCounts] = useState<Record<number, number>>({ ...zeroCounts });
  const [highCounts, setHighCounts] = useState<Record<number, number>>({ ...zeroCounts });
  const [bassCounts, setBassCounts] = useState<Record<number, number>>({ ...zeroCounts });
  const [embodimentCounts, setEmbodimentCounts] = useState<Record<number, number>>({ ...zeroCounts });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileUrlRef = useRef<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);

  const workletRef = useRef<AudioWorkletNode | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const emaLowRef = useRef<number | null>(null);
  const emaMidRef = useRef<number | null>(null);
  const emaHighRef = useRef<number | null>(null);
  const bassFreqEmaRef = useRef<number | null>(null);
  const prevMagRef = useRef<Float32Array | null>(null);
  const timeBufRef = useRef<Float32Array | null>(null);

  const freezeRef = useRef(false);
  const analyzingRef = useRef(false);

  const allHarmSamples = [...lowSamples, ...midSamples, ...highSamples];
  const keyInfo = useMemo(() => {
    const window = allHarmSamples.slice(-KEY_WINDOW);
    const pcCounts = new Array(12).fill(0);
    for (const s of window) {
      if (s.midi != null) {
        const pc = midiToPitchClass(s.midi);
        if (pc != null) pcCounts[pc] += 1;
      }
    }
    const total = pcCounts.reduce((a, b) => a + b, 0);
    if (!total) return { tonicPC: 0, mode: "maj" as const, confidence: 0 };
    return estimateKeyFromPCCounts(pcCounts);
  }, [allHarmSamples]);

  const gloss: Record<number, string> = {
    1: "Will / ignition / first spark",
    2: "Relating / listening / harmony of two",
    3: "Expression / creativity / divine child",
    4: "Structure / order / grounded rhythm",
    5: "Change / freedom / motion",
    6: "Care / devotion / restoration",
    7: "Depth / insight / the seeker",
    8: "Power / balance / stewardship",
    9: "Compassion / completion / blessing",
  };
  const sumToLines = (counts: Record<number, number>) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (!total) return { lines: ["No data yet."], lead: null as number | null };
    const top3 = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => ({ digit: Number(k), pct: (v / total) * 100 }));
    return {
      lines: top3.map((d) => `• ${d.digit} ≈ ${d.pct.toFixed(0)}% — ${gloss[d.digit]}`),
      lead: top3[0]?.digit ?? null,
    };
  };
  const makeReading = (lead: number | null, label: "inner" | "root" = "inner") => {
    const inner = label === "inner";
    if (inner) {
      return lead === 7
        ? "Inner lines think deeply — clarity over noise."
        : lead === 3
        ? "Inner lines want to speak — creation over silence."
        : lead === 9
        ? "Inner lines heal — compassion over conflict."
        : lead === 4
        ? "Inner lines build — order over chaos."
        : lead === 6
        ? "Inner lines care — warmth over fracture."
        : lead === 5
        ? "Inner lines move — change over stagnation."
        : lead === 8
        ? "Inner lines center — integrity over excess."
        : lead === 2
        ? "Inner lines listen — attunement over resistance."
        : lead === 1
        ? "Inner lines ignite — beginnings over delay."
        : "Inner lines balance — aether weaving all elements.";
    } else {
      return lead === 7
        ? "The root is reflective — depth underfoot."
        : lead === 3
        ? "The root speaks — rhythmic expression."
        : lead === 9
        ? "The root blesses — compassionate pulse."
        : lead === 4
        ? "The root builds — grounded order."
        : lead === 6
        ? "The root nurtures — protective warmth."
        : lead === 5
        ? "The root roams — motion and release."
        : lead === 8
        ? "The root steadies — strong spine."
        : lead === 2
        ? "The root attunes — relational groove."
        : lead === 1
        ? "The root ignites — primal spark."
        : "The root balances — quiet aether below.";
    }
  };
  const lowSummary = useMemo(() => {
    const { lines, lead } = sumToLines(lowCounts);
    return ["Body (200–500 Hz):", ...lines, "", `Reading: ${makeReading(lead, "inner")}`].join("\n");
  }, [lowCounts]);
  const midSummary = useMemo(() => {
    const { lines, lead } = sumToLines(midCounts);
    return ["Voice (500–1500 Hz):", ...lines, "", `Reading: ${makeReading(lead, "inner")}`].join("\n");
  }, [midCounts]);
  const highSummary = useMemo(() => {
    const { lines, lead } = sumToLines(highCounts);
    return ["Air (1500–6000 Hz):", ...lines, "", `Reading: ${makeReading(lead, "inner")}`].join("\n");
  }, [highCounts]);
  const bassSummary = useMemo(() => {
    const { lines, lead } = sumToLines(bassCounts);
    return ["Bass (60–300 Hz):", ...lines, "", `Reading: ${makeReading(lead, "root")}`].join("\n");
  }, [bassCounts]);
  const embodimentSummary = useMemo(() => {
    const { lines, lead } = sumToLines(embodimentCounts);
    return ["Embodiment (weighted blend):", ...lines, "", `Reading: ${makeReading(lead, "inner")}`].join("\n");
  }, [embodimentCounts]);

  const mainHarmonic = useMemo(() => {
    const window = allHarmSamples.slice(-MAIN_NOTE_WINDOW);
    const pcs: number[] = [];
    for (const s of window) {
      if (s.midi != null) {
        const pc = midiToPitchClass(s.midi);
        if (pc != null) pcs.push(pc);
      }
    }
    if (!pcs.length) return { label: "-", confidence: 0 };
    const tonic = keyInfo.tonicPC;
    const counts: Record<number, number> = {};
    if (rotateToTonic && keyInfo.confidence > 5) {
      for (const pc of pcs) counts[(pc - tonic + 12) % 12] = (counts[(pc - tonic + 12) % 12] ?? 0) + 1;
      const [rel, c] = Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]))[0] as [
        string,
        number
      ];
      const finalPC = (Number(rel) + tonic) % 12;
      return { label: NOTE_NAMES[finalPC], confidence: (c / pcs.length) * 100 };
    } else {
      for (const pc of pcs) counts[pc] = (counts[pc] ?? 0) + 1;
      const [pcTop, c] = Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]))[0] as [
        string,
        number
      ];
      return { label: NOTE_NAMES[Number(pcTop)], confidence: (c / pcs.length) * 100 };
    }
  }, [allHarmSamples, rotateToTonic, keyInfo]);

  useEffect(() => {
    return () => {
      stopAnalysis();
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onPlay = async () => {
      freezeRef.current = false;
      try {
        await ctxRef.current?.resume();
      } catch {
        /* ignore */
      }
    };
    const onPause = async () => {
      freezeRef.current = true;
      prevMagRef.current = null;
      timeBufRef.current = null;
      try {
        await ctxRef.current?.suspend();
      } catch {
        /* ignore */
      }
    };
    const onEnded = () => {
      freezeRef.current = true;
      stopAnalysis();
      setIsPlaying(false);
    };

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  async function ensureAudioGraph() {
    if (!audioRef.current) return;
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // 1) load worklet module (string)
    if (!workletRef.current) {
      const code = `
      class BassYINProcessor extends AudioWorkletProcessor {
        constructor(){
          super();
          this._buf = new Float32Array(8192);
          this._w = 0;
          this._hop = 2048;
          this._acc = 0;
          this._thr = 0.10;
        }
        _yin(frame, sr){
          const L = frame.length;
          const maxLag = Math.floor(sr/${BASS_LOW_HZ});
          const minLag = Math.max(2, Math.floor(sr/${BASS_HIGH_HZ}));
          const tauMax = Math.min(maxLag, Math.floor(L*0.5)-1);
          const d = new Float32Array(tauMax+1);
          const cmnd = new Float32Array(tauMax+1);
          for (let tau=1; tau<=tauMax; tau++){
            let sum=0;
            for (let i=0; i<L-tau; i++){
              const diff = frame[i]-frame[i+tau];
              sum += diff*diff;
            }
            d[tau] = sum;
          }
          let run = 0;
          for (let tau=1; tau<=tauMax; tau++){
            run += d[tau];
            cmnd[tau] = (run/tau) ? d[tau]/(run/tau) : 1;
          }
          let tau = -1;
          for (let t=minLag; t<=tauMax; t++){
            if (cmnd[t] < this._thr){ tau = t; break; }
          }
          if (tau === -1){
            let best = minLag;
            let v = cmnd[minLag];
            for (let t=minLag+1; t<=tauMax; t++){
              if (cmnd[t] < v){ v = cmnd[t]; best = t; }
            }
            tau = best;
          }
          const x0 = tau <= 1 ? tau : tau - 1;
          const x2 = tau + 1 <= tauMax ? tau + 1 : tau;
          const s0 = cmnd[x0], s1 = cmnd[tau], s2 = cmnd[x2];
          const a = s0 - 2*s1 + s2;
          const b = 0.5*(s2 - s0);
          const tauR = a === 0 ? tau : tau - b/(2*a);
          const f0 = sampleRate / tauR;
          const conf = Math.max(0, Math.min(1, 1 - cmnd[tau]));
          return { f0, conf };
        }
        process(inputs){
          const ch = (inputs[0] && inputs[0][0]) || null;
          if (!ch) return true;
          const N = ch.length;
          for (let i=0; i<N; i++){
            this._buf[this._w] = ch[i];
            this._w = (this._w + 1) % this._buf.length;
          }
          this._acc += N;
          if (this._acc >= this._hop){
            this._acc = 0;
            const win = 4096;
            if (win < this._buf.length){
              const frame = new Float32Array(win);
              let idx = (this._w - win + this._buf.length) % this._buf.length;
              for (let i=0; i<win; i++){
                frame[i] = this._buf[(idx + i) % this._buf.length];
              }
              for (let i=0; i<win; i++){
                frame[i] *= 0.5*(1 - Math.cos((2*Math.PI*i)/(win-1)));
              }
              const { f0, conf } = this._yin(frame, sampleRate);
              if (isFinite(f0) && f0 > ${BASS_LOW_HZ - 5} && f0 < ${BASS_HIGH_HZ + 20}){
                this.port.postMessage({ type: "bass", f0, conf });
              }
            }
          }
          return true;
        }
      }
      registerProcessor("bass-yin-processor", BassYINProcessor);
      `;
      const blob = new Blob([code], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctxRef.current.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
    }

    // 2) normal audio graph
    if (!sourceRef.current)
      sourceRef.current = ctxRef.current.createMediaElementSource(audioRef.current!);

    const splitter = ctxRef.current.createChannelSplitter(2);
    const gL = ctxRef.current.createGain();
    gL.gain.value = 0.5;
    const gR = ctxRef.current.createGain();
    gR.gain.value = 0.5;
    const merger = ctxRef.current.createChannelMerger(1);
    sourceRef.current.connect(splitter);
    splitter.connect(gL, 0);
    splitter.connect(gR, 1);
    gL.connect(merger, 0, 0);
    gR.connect(merger, 0, 0);
    mergerRef.current = merger;

    if (!analyserRef.current) {
      const a = ctxRef.current.createAnalyser();
      a.fftSize = FFT_SIZE;
      a.smoothingTimeConstant = 0.85;
      a.minDecibels = -100;
      a.maxDecibels = -10;
      analyserRef.current = a;
    }

    merger.connect(analyserRef.current);
    analyserRef.current.connect(ctxRef.current.destination);

    // 3) create the worklet node (muted) and listen for bass
    if (!workletRef.current) {
      const n = new AudioWorkletNode(ctxRef.current, "bass-yin-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      const mute = ctxRef.current.createGain();
      mute.gain.value = 0;
      n.port.onmessage = (ev) => {
        if (freezeRef.current || !analyzingRef.current) return;
        const msg = ev.data;
        if (msg?.type === "bass") {
          const f0: number = msg.f0;
          const yinConf: number = msg.conf;
          bassFreqEmaRef.current = ema(bassFreqEmaRef.current, f0, SMOOTH_ALPHA);
          const fSm = bassFreqEmaRef.current ?? f0;

          const snapped = snapFreqToNearestMidi(fSm, a4);
          const midi = snapped.midi;
          const note = midiToNoteName(midi);
          const pc = midiToPitchClass(midi);
          const digit = pc != null ? pitchClassToDigit(pc) : null;

          const snapConf = snapConfidence(snapped.cents);
          const w = snapConf * (0.65 + 0.35 * yinConf);

          setBassFreq(fSm);
          setBassMidi(midi);
          setBassNote(note);
          setBassDigit(digit);
          setBassCents(snapped.cents);
          const t = performance.now();
          const ts = Number(((t - (startTimeRef.current ?? t)) / 1000).toFixed(2));
          if (digit) {
            setBassSamples((prev) => [
              ...prev.slice(-1000),
              { t: ts, freq: fSm, midi, note, digit, cents: snapped.cents },
            ]);
            setBassCounts((prev) => ({ ...prev, [digit]: (prev[digit] ?? 0) + w }));
            setEmbodimentCounts((prev) => ({
              ...prev,
              [digit]: (prev[digit] ?? 0) + w * wBass,
            }));
          }
        }
      };
      merger.connect(n);
      n.connect(mute).connect(ctxRef.current.destination);
      workletRef.current = n;
    }
  }

  // ─────────────────────────────────────────────────────────
  // FIXED: readHarmBand
  // ─────────────────────────────────────────────────────────
  function readHarmBand(
    ctx: AudioContext,
    analyser: AnalyserNode,
    A4: number,
    lowHz: number,
    highHz: number,
    emaRef: React.MutableRefObject<number | null>
  ) {
    const N = analyser.frequencyBinCount;
    const binsDb = new Float32Array(N);
    const binsU8 = new Uint8Array(N);

    analyser.getFloatFrequencyData(binsDb);
    analyser.getByteFrequencyData(binsU8);

    // make sure the time-domain buffer exists
    if (!timeBufRef.current) {
      timeBufRef.current = new Float32Array(analyser.fftSize);
    }

    const tdBuf = timeBufRef.current as Float32Array;
    analyser.getFloatTimeDomainData(tdBuf as any);

    // dB -> linear
    const lin = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const v = Math.pow(10, binsDb[i] / 20);
      lin[i] = isFinite(v) ? Math.max(v, 1e-8) : 1e-8;
    }

    // band limits
    const nyq = ctx.sampleRate / 2;
    const binHz = nyq / N;
    const cutL = Math.max(0, Math.floor(lowHz / binHz));
    const cutH = Math.min(N - 1, Math.floor(highHz / binHz));

    // spectral flux inside band
    let flux = 0;
    if (prevMagRef.current && prevMagRef.current.length === N) {
      for (let i = cutL; i <= cutH; i++) {
        const d = lin[i] - prevMagRef.current[i];
        if (d > 0) flux += d;
      }
    }
    prevMagRef.current = lin.slice(0);

    // flatness inside band
    const flat = spectralFlatnessLinear(lin, cutL, cutH);

    // percussive gate
    const isPercussive = flux > 5e-3 && flat > FLATNESS_GATE;
    if (isPercussive) {
      return { freq: 0, midi: null, note: "-", digit: null, cents: 0, conf: 0 };
    }

    // zero out outside band for peak search
    for (let i = 0; i < Math.min(cutL, N); i++) binsU8[i] = 0;
    for (let i = cutH + 1; i < N; i++) binsU8[i] = 0;

    // peaks
    const peaks = topKPeaks(binsU8, HARMONIC_PEAKS, HARMONIC_MIN_DIST_BINS, NOISE_FLOOR_U8);
    let fLead = 0;
    let leadW = -1;
    const peakVote: Record<number, number> = {};
    if (peaks.length) {
      const maxVal = Math.max(...peaks.map((i) => binsU8[i]), 1);
      for (const i of peaks) {
        const w = binsU8[i] / maxVal;
        const frac = parabolicInterp(binsU8, i);
        const f = binToFreq(frac, ctx.sampleRate, N);
        const { midi } = snapFreqToNearestMidi(f, A4);
        const pc = midiToPitchClass(midi);
        const d = pc != null ? pitchClassToDigit(pc) : null;
        if (d) peakVote[d] = (peakVote[d] ?? 0) + w;
        if (w > leadW) {
          leadW = w;
          fLead = f;
        }
      }
    }

    // smooth fundamental
    emaRef.current = ema(emaRef.current, fLead, SMOOTH_ALPHA);
    const fSm = emaRef.current ?? fLead;

    // snap to midi
    const snapped = snapFreqToNearestMidi(fSm, A4);
    const midiSnap = snapped.midi;
    const noteSnap = midiToNoteName(midiSnap);
    const pcSnap = midiToPitchClass(midiSnap);
    const digitSnap = pcSnap != null ? pitchClassToDigit(pcSnap) : null;
    const confSnap = snapConfidence(snapped.cents);

    // chroma vote
    const chroma = new Array(12).fill(0);
    for (let i = cutL; i <= cutH; i++) {
      const f = binToFreq(i, ctx.sampleRate, N);
      if (f <= 0) continue;
      const m = freqToMidiFloatEqualTemp(f, A4);
      const pc = ((m % 12) + 12) % 12;
      const w = lin[i];
      const pc0 = Math.floor(pc);
      const frac = pc - pc0;
      const left = (pc0 + 11) % 12;
      const right = (pc0 + 1) % 12;
      chroma[pc0] += (1 - Math.abs(frac)) * w;
      if (frac > 0) chroma[right] += frac * w * 0.5;
      if (frac < 0) chroma[left] += -frac * w * 0.5;
    }
    const chromaNorm = Math.hypot(...chroma);
    let pcChroma: number | null = null;
    let confChroma = 0;
    if (chromaNorm > 0) {
      const maxV = Math.max(...chroma);
      pcChroma = chroma.indexOf(maxV);
      confChroma = maxV / chromaNorm;
    }
    const digitChroma = pcChroma != null ? pitchClassToDigit(pcChroma) : null;

    // ACF confidence from time-domain
    let confAcf = 0;
    if (timeBufRef.current) {
      const td = timeBufRef.current;
      const minLag = Math.floor(ctx.sampleRate / 1200);
      const maxLag = Math.floor(ctx.sampleRate / 200);
      let bestLag = -1;
      let best = -Infinity;
      let next = -Infinity;
      for (let lag = minLag; lag <= maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i < td.length - lag; i++) {
          sum += td[i] * td[i + lag];
        }
        if (sum > best) {
          next = best;
          best = sum;
          bestLag = lag;
        } else if (sum > next) {
          next = sum;
        }
      }
      if (bestLag > 0) {
        const f0 = ctx.sampleRate / bestLag;
        const snapA = snapFreqToNearestMidi(f0, A4);
        const confLocal = Math.max(0, (best - Math.max(1e-9, next)) / Math.max(1e-9, best));
        confAcf = confLocal * snapConfidence(snapA.cents);
      }
    }

    // combine votes
    let wSnap = confSnap;
    let wChroma = confChroma;
    const agree = digitSnap != null && digitChroma != null && digitSnap === digitChroma;
    if (agree) {
      wSnap *= 1.2;
      wChroma *= 1.2;
    }
    const wBoost = 1 + 0.5 * confAcf;
    wSnap *= wBoost;
    wChroma *= wBoost;

    if (digitSnap == null && digitChroma == null) {
      return { freq: fSm, midi: null, note: "-", digit: null, cents: 0, conf: 0 };
    }

    let digit: number | null;
    let conf: number;
    if (digitSnap != null && (wSnap >= wChroma || digitChroma == null)) {
      digit = digitSnap;
      conf = clamp(wSnap, 0, 1);
    } else {
      digit = digitChroma!;
      conf = clamp(wChroma, 0, 1);
    }

    return {
      freq: fSm,
      midi: midiSnap,
      note: noteSnap,
      digit,
      cents: snapped.cents,
      conf,
    };
  }

  function tick() {
    if (freezeRef.current || !analyzingRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    if (!startTimeRef.current) startTimeRef.current = now;

    const ctx = ctxRef.current!;
    const analyser = analyserRef.current!;

    const rLow = readHarmBand(ctx, analyser, a4, H_LOW.lo, H_LOW.hi, emaLowRef);
    const rMid = readHarmBand(ctx, analyser, a4, H_MID.lo, H_MID.hi, emaMidRef);
    const rHigh = readHarmBand(ctx, analyser, a4, H_HIGH.lo, H_HIGH.hi, emaHighRef);

    setLiveLow(rLow);
    setLiveMid(rMid);
    setLiveHigh(rHigh);

    const t = Number(((now - startTimeRef.current) / 1000).toFixed(2));
    if (rLow.digit) {
      setLowSamples((prev) => [
        ...prev.slice(-800),
        {
          t,
          freq: rLow.freq,
          midi: rLow.midi,
          note: rLow.note,
          digit: rLow.digit,
          cents: rLow.cents,
        },
      ]);
      setLowCounts((prev) => ({
        ...prev,
        [rLow.digit!]: (prev[rLow.digit!] ?? 0) + (rLow as any).conf,
      }));
      setEmbodimentCounts((prev) => ({
        ...prev,
        [rLow.digit!]: (prev[rLow.digit!] ?? 0) + (rLow as any).conf * wLow,
      }));
    }
    if (rMid.digit) {
      setMidSamples((prev) => [
        ...prev.slice(-800),
        {
          t,
          freq: rMid.freq,
          midi: rMid.midi,
          note: rMid.note,
          digit: rMid.digit,
          cents: rMid.cents,
        },
      ]);
      setMidCounts((prev) => ({
        ...prev,
        [rMid.digit!]: (prev[rMid.digit!] ?? 0) + (rMid as any).conf,
      }));
      setEmbodimentCounts((prev) => ({
        ...prev,
        [rMid.digit!]: (prev[rMid.digit!] ?? 0) + (rMid as any).conf * wMid,
      }));
    }
    if (rHigh.digit) {
      setHighSamples((prev) => [
        ...prev.slice(-800),
        {
          t,
          freq: rHigh.freq,
          midi: rHigh.midi,
          note: rHigh.note,
          digit: rHigh.digit,
          cents: rHigh.cents,
        },
      ]);
      setHighCounts((prev) => ({
        ...prev,
        [rHigh.digit!]: (prev[rHigh.digit!] ?? 0) + (rHigh as any).conf,
      }));
      setEmbodimentCounts((prev) => ({
        ...prev,
        [rHigh.digit!]: (prev[rHigh.digit!] ?? 0) + (rHigh as any).conf * wHigh,
      }));
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  async function startAnalysis() {
    try {
      setError(null);
      await ensureAudioGraph();
      if (!audioRef.current) {
        setError("Audio element not ready.");
        return;
      }
      if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
      startTimeRef.current = null;

      emaLowRef.current = null;
      emaMidRef.current = null;
      emaHighRef.current = null;
      bassFreqEmaRef.current = null;

      setLowSamples([]);
      setMidSamples([]);
      setHighSamples([]);
      setBassSamples([]);
      setLowCounts({ ...zeroCounts });
      setMidCounts({ ...zeroCounts });
      setHighCounts({ ...zeroCounts });
      setBassCounts({ ...zeroCounts });
      setEmbodimentCounts({ ...zeroCounts });

      analyzingRef.current = true;
      freezeRef.current = false;

      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      setIsAnalyzing(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setError(e?.message || "Failed to start analysis.");
    }
  }
  function stopAnalysis() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyzingRef.current = false;
    setIsAnalyzing(false);
  }
  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }
    const url = URL.createObjectURL(f);
    fileUrlRef.current = url;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
    setFileName(f.name);

    setLowSamples([]);
    setMidSamples([]);
    setHighSamples([]);
    setBassSamples([]);
    setLowCounts({ ...zeroCounts });
    setMidCounts({ ...zeroCounts });
    setHighCounts({ ...zeroCounts });
    setBassCounts({ ...zeroCounts });
    setEmbodimentCounts({ ...zeroCounts });
    emaLowRef.current = null;
    emaMidRef.current = null;
    emaHighRef.current = null;
    bassFreqEmaRef.current = null;

    prevMagRef.current = null;
    timeBufRef.current = null;
  }

  const recentLow = lowSamples.slice(-(expandHarm ? 200 : 40));
  const recentMid = midSamples.slice(-(expandHarm ? 200 : 40));
  const recentHigh = highSamples.slice(-(expandHarm ? 200 : 40));
  const recentB = bassSamplesState.slice(-(expandBass ? 200 : 40));

  return (
    <Shell>
      <div className="mt-2 mb-2 flex items-center gap-2">
        <Music2 className="h-5 w-5 text-yellow-400" />
        <h1 className="text-2xl font-semibold text-gold">Music ⇄ Numerology</h1>
      </div>

      <main className="px-4 py-8 max-w-6xl mx-auto">
        <h2 className="text-lg font-medium text-yellow-500">Multi-Band Readers + Embodiment</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Low/ Mid/ High harmonic bands each vote their digit; Embodiment blends them (and optionally some Bass).
        </p>

        {/* Controls */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <label className="text-sm opacity-80">Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={onFile}
              className="mt-2 block w-full text-sm"
            />
            <div className="mt-2 text-xs text-neutral-400">{fileName || "No file selected"}</div>
            <audio ref={audioRef} controls className="mt-3 w-full" />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={togglePlay}
                className="px-3 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              {!isAnalyzing ? (
                <button
                  onClick={startAnalysis}
                  className="px-3 py-2 rounded-lg border border-yellow-600 text-yellow-400 hover:bg-yellow-500/10"
                >
                  Start Analysis
                </button>
              ) : (
                <button
                  onClick={stopAnalysis}
                  className="px-3 py-2 rounded-lg border border-pink-600 text-pink-300 hover:bg-pink-500/10"
                >
                  Stop Analysis
                </button>
              )}

              <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={rotateToTonic}
                  onChange={(e) => setRotateToTonic(e.target.checked)}
                />
                Rotate digits so <span className="font-mono">tonic = 1</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs text-neutral-300 ml-3">
                A4:
                <input
                  type="range"
                  min={415}
                  max={466}
                  step={1}
                  value={a4}
                  onChange={(e) => setA4(Number(e.target.value))}
                />
                <span className="font-mono">{a4} Hz</span>
              </label>
            </div>

            <div className="mt-3 grid gap-2">
              <div className="text-xs text-neutral-400">Embodiment Weights</div>
              <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                Low (Body):
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={wLow}
                  onChange={(e) => setWLow(Number(e.target.value))}
                />
                <span className="font-mono">{Math.round(wLow * 100)}%</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                Mid (Voice):
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={wMid}
                  onChange={(e) => setWMid(Number(e.target.value))}
                />
                <span className="font-mono">{Math.round(wMid * 100)}%</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                High (Air):
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={wHigh}
                  onChange={(e) => setWHigh(Number(e.target.value))}
                />
                <span className="font-mono">{Math.round(wHigh * 100)}%</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                Bass share into Embodiment:
                <input
                  type="range"
                  min={0}
                  max={0.6}
                  step={0.05}
                  value={wBass}
                  onChange={(e) => setWBass(Number(e.target.value))}
                />
                <span className="font-mono">{Math.round(wBass * 100)}%</span>
              </label>
            </div>

            <div className="mt-2 text-xs text-neutral-400">
              Key:{" "}
              <b>
                {NOTE_NAMES[keyInfo.tonicPC]} {keyInfo.mode === "maj" ? "(maj)" : "(min)"}
              </b>{" "}
              · Conf: {Math.round(keyInfo.confidence)}%
            </div>

            {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          </div>

          {/* Live readouts */}
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <div className="text-sm opacity-80">Live Readout</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">Low Harmonic (Body) Freq</div>
                <div className="font-mono mt-1">
                  {liveLow?.freq ? `${liveLow.freq.toFixed(1)} Hz` : "-"}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">Low Note</div>
                <div className="font-mono mt-1">
                  {liveLow?.midi ?? "-"} / {liveLow?.note ?? "-"}
                  {typeof liveLow?.cents === "number" ? ` (${fmtCents(liveLow.cents!)})` : ""}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">Mid Harmonic (Voice) Freq</div>
                <div className="font-mono mt-1">
                  {liveMid?.freq ? `${liveMid.freq.toFixed(1)} Hz` : "-"}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">Mid Note</div>
                <div className="font-mono mt-1">
                  {liveMid?.midi ?? "-"} / {liveMid?.note ?? "-"}
                  {typeof liveMid?.cents === "number" ? ` (${fmtCents(liveMid.cents!)})` : ""}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">High Harmonic (Air) Freq</div>
                <div className="font-mono mt-1">
                  {liveHigh?.freq ? `${liveHigh.freq.toFixed(1)} Hz` : "-"}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">High Note</div>
                <div className="font-mono mt-1">
                  {liveHigh?.midi ?? "-"} / {liveHigh?.note ?? "-"}
                  {typeof liveHigh?.cents === "number" ? ` (${fmtCents(liveHigh.cents!)})` : ""}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">Bass Freq</div>
                <div className="font-mono mt-1">
                  {bassFreq ? `${bassFreq.toFixed(1)} Hz` : "-"}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                <div className="opacity-60 text-xs">Bass Note</div>
                <div className="font-mono mt-1">
                  {bassMidi ?? "-"} / {bassNote}
                  {typeof bassCents === "number" ? ` (${fmtCents(bassCents)})` : ""}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950 col-span-2">
                <div className="opacity-60 text-xs">Main Note (harmonics aggregate, smoothed)</div>
                <div className="font-mono mt-1">
                  {mainHarmonic.label}{" "}
                  {mainHarmonic.label !== "-" ? `· ${mainHarmonic.confidence.toFixed(0)}%` : ""}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="opacity-60 text-xs mb-1">Recent digits — Harmonics</div>
                <button
                  onClick={() => setExpandHarm((s) => !s)}
                  className="text-xs px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800 inline-flex items-center gap-1"
                >
                  {expandHarm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {expandHarm ? "Collapse" : "Expand"}
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {recentLow.map((s, i) => (
                  <span
                    key={`l${i}`}
                    className="px-2 py-1 rounded-md text-xs font-mono border border-neutral-800 bg-neutral-950"
                    title={`LOW ${s.note} ${
                      s.cents != null ? `(${fmtCents(s.cents)}) ` : ""
                    }@ ${s.freq.toFixed(1)}Hz • t=${s.t.toFixed(2)}s`}
                  >
                    {s.digit}
                  </span>
                ))}
                {recentMid.map((s, i) => (
                  <span
                    key={`m${i}`}
                    className="px-2 py-1 rounded-md text-xs font-mono border border-neutral-800 bg-neutral-950"
                    title={`MID ${s.note} ${
                      s.cents != null ? `(${fmtCents(s.cents)}) ` : ""
                    }@ ${s.freq.toFixed(1)}Hz • t=${s.t.toFixed(2)}s`}
                  >
                    {s.digit}
                  </span>
                ))}
                {recentHigh.map((s, i) => (
                  <span
                    key={`h${i}`}
                    className="px-2 py-1 rounded-md text-xs font-mono border border-neutral-800 bg-neutral-950"
                    title={`HIGH ${s.note} ${
                      s.cents != null ? `(${fmtCents(s.cents)}) ` : ""
                    }@ ${s.freq.toFixed(1)}Hz • t=${s.t.toFixed(2)}s`}
                  >
                    {s.digit}
                  </span>
                ))}
                {recentLow.length + recentMid.length + recentHigh.length === 0 && (
                  <span className="text-xs text-neutral-500">—</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="opacity-60 text-xs mb-1">Recent digits — Bass</div>
                <button
                  onClick={() => setExpandBass((s) => !s)}
                  className="text-xs px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800 inline-flex items-center gap-1"
                >
                  {expandBass ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {expandBass ? "Collapse" : "Expand"}
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {recentB.map((s, i) => (
                  <span
                    key={`b${i}`}
                    className="px-2 py-1 rounded-md text-xs font-mono border border-neutral-800 bg-neutral-950"
                    title={`${s.note} ${
                      s.cents != null ? `(${fmtCents(s.cents)}) ` : ""
                    }@ ${s.freq.toFixed(1)}Hz • t=${s.t.toFixed(2)}s`}
                  >
                    {s.digit}
                  </span>
                ))}
                {recentB.length === 0 && <span className="text-xs text-neutral-500">—</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <div className="text-sm opacity-80 mb-3">Body (200–500 Hz) — confidence-weighted</div>
            <BandBars counts={lowCounts} />
          </div>
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <div className="text-sm opacity-80 mb-3">Voice (500–1500 Hz) — confidence-weighted</div>
            <BandBars counts={midCounts} />
          </div>
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <div className="text-sm opacity-80 mb-3">Air (1500–6000 Hz) — confidence-weighted</div>
            <BandBars counts={highCounts} />
          </div>
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <div className="text-sm opacity-80 mb-3">Bass (60–300 Hz) — confidence-weighted</div>
            <BandBars counts={bassCounts} />
          </div>
          <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60 md:col-span-2">
            <div className="text-sm opacity-80 mb-3">Embodiment (Low/Mid/High + Bass share)</div>
            <BandBars counts={embodimentCounts} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <MsgCard title="Body (Low Harmonics)" text={lowSummary} />
          <MsgCard title="Voice (Mid Harmonics)" text={midSummary} />
          <MsgCard title="Air (High Harmonics)" text={highSummary} />
          <MsgCard title="Bass" text={bassSummary} />
          <MsgCard title="Embodiment (Fusion)" text={embodimentSummary} wide />
        </div>

        <div className="mt-6 text-xs text-neutral-500">
          Each harmonic reader applies: percussive gate, peak-snap, chroma, ACF booster — but only within its band.
          Embodiment blends their votes with your sliders and can include a portion of Bass. Key detection uses all
          harmonic samples; “Main Note” aggregates across the last ~{MAIN_NOTE_WINDOW} frames.
        </div>
      </main>
    </Shell>
  );
}

function BandBars({ counts }: { counts: Record<number, number> }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Object.entries(counts).map(([k, v]) => {
        const pct = max ? (Number(v) / max) * 100 : 0;
        return (
          <div key={`bar${k}`} className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold">#{k}</div>
              <div className="font-mono">{v.toFixed(1)}</div>
            </div>
            <div className="mt-2 h-2 w-full bg-neutral-800 rounded">
              <div className="h-2 bg-yellow-500 rounded" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function MsgCard({ title, text, wide }: { title: string; text: string; wide?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-neutral-800 p-4 bg-neutral-900/60 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="text-sm opacity-80">{title}</div>
      <pre className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{text}</pre>
    </div>
  );
}
