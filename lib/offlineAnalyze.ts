// lib/offlineAnalyze.ts
import { hann, magSpectrum, spectralFlatnessLinear, spectralFlux, acfF0, yinF0 } from "./dsp";

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const DIGIT_MAP = [1,2,3,4,5,6,7,8,9,1,2,3];

const KS_MAJOR = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const KS_MINOR = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
const rot = (a:number[],s:number)=>a.map((_,i,x)=>x[(i-s+12)%12]);
const dot=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+v*b[i],0);
const norm=(a:number[])=>Math.hypot(...a);
const corr=(a:number[],b:number[])=>{const n=norm(a)*norm(b); return n?dot(a,b)/n:0;};

function midiToPitchClass(m:number){ return ((m%12)+12)%12; }
function pitchClassToDigit(pc:number){ return DIGIT_MAP[pc]; }
function midiToFreq(m:number,A4=440){ return A4*Math.pow(2,(m-69)/12); }
function freqToMidiFloat(f:number,A4=440){ return 69+12*Math.log2(f/A4); }
function snapFreq(freq:number,A4=440){ const mf=freqToMidiFloat(freq,A4); const m=Math.round(mf); const cents=1200*Math.log2(freq/midiToFreq(m,A4)); return {m,cents}; }
function snapConf(cents:number){ return Math.max(0,1-Math.min(100,Math.abs(cents))/100); }

export type OfflineOptions = { fftSize?:number; hopSize?:number; harmLowHz?:number; harmHighHz?:number; a4?:number; blend?:number; };
export type OfflineResult = {
  harmCounts: Record<number, number>;
  bassCounts: Record<number, number>;
  unifiedCounts: Record<number, number>;
  samplesH: { t:number; midi:number|null; digit:number|null }[];
  samplesB: { t:number; midi:number|null; digit:number|null }[];
  key: { tonicPC:number; mode:"maj"|"min"; confidence:number };
};

export async function analyzeArrayBuffer(ab:ArrayBuffer, opts:OfflineOptions={}):Promise<OfflineResult>{
  const fftSize = opts.fftSize ?? 8192;
  const hop = opts.hopSize ?? 2048;
  const harmLowHz = opts.harmLowHz ?? 240;
  const harmHighHz = opts.harmHighHz ?? 8000;
  const A4 = opts.a4 ?? 440;
  const blend = opts.blend ?? 0.6;

  const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buf = await ac.decodeAudioData(ab.slice(0));
  ac.close();

  const sr = buf.sampleRate;
  const mono = new Float32Array(buf.length);
  mono.set(buf.getChannelData(0));
  if (buf.numberOfChannels > 1) {
    const ch1 = buf.getChannelData(1);
    for (let i=0;i<mono.length;i++) mono[i] = 0.5*(mono[i] + ch1[i]);
  }

  const win = hann(fftSize);
  const frames = Math.max(0, Math.floor((mono.length - fftSize) / hop) + 1);
  const prev = new Float32Array(fftSize/2);

  const harmCounts:Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const bassCounts:Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const unifiedCounts:Record<number,number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const samplesH:{t:number;midi:number|null;digit:number|null}[]=[];
  const samplesB:{t:number;midi:number|null;digit:number|null}[]=[];
  const keyPC = new Array(12).fill(0);

  const nyq = sr/2, binHz = nyq/(fftSize/2);
  const lo = Math.max(0, Math.floor(harmLowHz/binHz));
  const hi = Math.min((fftSize/2)-1, Math.floor(harmHighHz/binHz));

  for (let f=0; f<frames; f++){
    const off = f*hop;
    const td = mono.subarray(off, off+fftSize);
    const frame = new Float32Array(fftSize);
    for (let i=0;i<fftSize;i++) frame[i] = td[i]*win[i];

    const mags = magSpectrum(frame);
    const flux = spectralFlux(prev, mags, lo, hi); prev.set(mags);
    const flat = spectralFlatnessLinear(mags, lo, hi);
    const percussive = flat > 0.80 && flux > 5e-3;

    // Harmonic
    if (!percussive) {
      let idx = lo, mv = -Infinity;
      for (let i=lo;i<=hi;i++){ if (mags[i] > mv){ mv = mags[i]; idx = i; } }
      const fHz = idx*binHz;
      const snap = snapFreq(fHz, A4);
      const pc = midiToPitchClass(snap.m);
      const d = pitchClassToDigit(pc);
      const cSnap = snapConf(snap.cents);

      // ACF reinforce
      const {f0, conf} = acfF0(td, sr, 200, 1200);
      const w = Math.min(1, cSnap * (1 + 0.5*conf));
      harmCounts[d] += w;
      unifiedCounts[d] += w*blend;
      samplesH.push({t: off/sr, midi: snap.m, digit: d});

      // chroma vote for key
      const chroma = new Array(12).fill(0);
      for (let i=lo; i<=hi; i++){
        const m = 69 + 12*Math.log2((i*binHz)/A4);
        const pc2 = ((m%12)+12)%12; const pc0 = Math.floor(pc2);
        const frac = pc2 - pc0, wMag = mags[i];
        chroma[pc0] += (1-Math.abs(frac))*wMag;
        chroma[(pc0+1)%12] += Math.max(0, frac)*wMag*0.5;
        chroma[(pc0+11)%12]+= Math.max(0,-frac)*wMag*0.5;
      }
      const maxC = Math.max(...chroma); const pcMax = chroma.indexOf(maxC);
      keyPC[pcMax] += maxC;
    }

    // Bass
    const tdB = mono.subarray(off, off+4096);
    if (tdB.length === 4096) {
      const {f0, conf} = yinF0(tdB, sr, 60, 300, 0.10);
      if (f0 > 0) {
        const s = snapFreq(f0, A4);
        const w = Math.max(0, Math.min(1, conf * snapConf(s.cents)));
        const pcB = midiToPitchClass(s.m);
        const dB = pitchClassToDigit(pcB);
        bassCounts[dB] += w;
        unifiedCounts[dB] += w*(1-blend);
        samplesB.push({t: off/sr, midi: s.m, digit: dB});
      }
    }
  }

  // Key
  let key = { tonicPC:0, mode:"maj" as "maj"|"min", confidence:0 };
  if (keyPC.reduce((a,b)=>a+b,0) > 0) {
    let best = { t:0, mode:"maj" as "maj"|"min", s:-1 };
    for (let t=0;t<12;t++){
      const maj = corr(keyPC, rot(KS_MAJOR,t));
      const min = corr(keyPC, rot(KS_MINOR,t));
      if (maj>best.s) best = {t, mode:"maj", s:maj};
      if (min>best.s) best = {t, mode:"min", s:min};
    }
    key = { tonicPC:best.t, mode:best.mode, confidence: Math.max(0, Math.min(1,(best.s+1)/2))*100 };
  }

  return { harmCounts, bassCounts, unifiedCounts, samplesH, samplesB, key };
}
