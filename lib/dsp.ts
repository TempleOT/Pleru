// lib/dsp.ts
export function hann(N: number) {
  const w = new Float32Array(N);
  for (let i = 0; i < N; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
  return w;
}

// In-place complex FFT. N must be power of 2.
export function fft(real: Float32Array, imag: Float32Array) {
  const n = real.length; let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) { const tr = real[i]; real[i] = real[j]; real[j] = tr; const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti; }
    let m = n >>> 1; while (m >= 1 && j >= m) { j -= m; m >>>= 1; } j += m;
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wpr = Math.cos(ang), wpi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wr = 1, wi = 0, half = len >>> 1;
      for (let k = 0; k < half; k++) {
        const i0 = i + k, i1 = i + k + half;
        const tr = wr * real[i1] - wi * imag[i1];
        const ti = wr * imag[i1] + wi * real[i1];
        real[i1] = real[i0] - tr; imag[i1] = imag[i0] - ti;
        real[i0] += tr;          imag[i0] += ti;
        const wtmp = wr; wr = wtmp * wpr - wi * wpi; wi = wtmp * wpi + wi * wpr;
      }
    }
  }
}

export function magSpectrum(frame: Float32Array): Float32Array {
  const N = frame.length;
  const re = new Float32Array(frame);
  const im = new Float32Array(N);
  fft(re, im);
  const out = new Float32Array(N / 2);
  for (let i = 0; i < out.length; i++) out[i] = Math.hypot(re[i], im[i]);
  return out;
}

export function spectralFlatnessLinear(mags: Float32Array, i0 = 0, i1?: number) {
  const hi = i1 ?? (mags.length - 1), N = Math.max(1, hi - i0 + 1);
  let geo = 0, arith = 0;
  for (let i = i0; i <= hi; i++) { const v = Math.max(mags[i], 1e-12); geo += Math.log(v); arith += v; }
  return Math.exp(geo / N) / Math.max(arith / N, 1e-12);
}

export function spectralFlux(prev: Float32Array | null, cur: Float32Array, i0 = 0, i1?: number) {
  if (!prev || prev.length !== cur.length) return 0;
  const hi = i1 ?? (cur.length - 1); let sum = 0;
  for (let i = i0; i <= hi; i++) { const d = cur[i] - prev[i]; if (d > 0) sum += d; }
  return sum / Math.max(1, hi - i0 + 1);
}

// Time-domain ACF F0 (200–1200 Hz)
export function acfF0(td: Float32Array, sr: number, fMin = 200, fMax = 1200) {
  const minLag = Math.floor(sr / fMax), maxLag = Math.floor(sr / fMin);
  let bestLag = -1, best = -Infinity, next = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0; for (let i = 0; i < td.length - lag; i++) s += td[i] * td[i + lag];
    if (s > best) { next = best; best = s; bestLag = lag; } else if (s > next) next = s;
  }
  if (bestLag <= 0) return { f0: 0, conf: 0 };
  const conf = Math.max(0, (best - Math.max(1e-9, next)) / Math.max(1e-9, best));
  return { f0: sr / bestLag, conf };
}

// Lightweight YIN (60–300 Hz)
export function yinF0(td: Float32Array, sr: number, fMin = 60, fMax = 300, thresh = 0.10) {
  const minLag = Math.floor(sr / fMax), maxLag = Math.floor(sr / fMin);
  const L = td.length, d = new Float32Array(maxLag + 1);
  for (let tau = 1; tau <= maxLag; tau++) {
    let sum = 0; for (let i = 0; i < L - tau; i++) { const diff = td[i] - td[i + tau]; sum += diff * diff; }
    d[tau] = sum;
  }
  const cmnd = new Float32Array(maxLag + 1); let run = 0;
  for (let tau = 1; tau <= maxLag; tau++) { run += d[tau]; cmnd[tau] = run ? d[tau] / (run / tau) : 1; }
  let tauPick = -1;
  for (let t = minLag; t <= maxLag; t++) if (cmnd[t] < thresh) { tauPick = t; break; }
  if (tauPick === -1) { let best = minLag; for (let t = minLag + 1; t <= maxLag; t++) if (cmnd[t] < cmnd[best]) best = t; tauPick = best; }
  const x0 = tauPick <= 1 ? tauPick : tauPick - 1, x2 = tauPick + 1;
  const s0 = cmnd[x0], s1 = cmnd[tauPick], s2 = cmnd[x2] ?? s1;
  const a = s0 - 2 * s1 + s2, b = 0.5 * (s2 - s0);
  const tauR = a === 0 ? tauPick : tauPick - b / (2 * a);
  const f0 = sr / tauR, conf = Math.max(0, Math.min(1, 1 - cmnd[tauPick]));
  return { f0, conf };
}
