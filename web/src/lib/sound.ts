/** All sound is made here with Web Audio: rain, brown noise and ocean beds, and a soft bell between phases. */
import type { Kind } from './breath';
import type { Mix } from './store';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const beds: Partial<Record<keyof Mix, GainNode>> = {};
function ac() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
function noise(c: AudioContext, kind: 'white' | 'brown', sec = 4) {
  const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'white') d[i] = w;
    else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  }
  const s = c.createBufferSource(); s.buffer = b; s.loop = true; return s;
}
function build(name: keyof Mix) {
  const c = ac();
  const out = c.createGain(); out.gain.value = 0; out.connect(master!);
  if (name === 'rain') {
    const n = noise(c, 'white'); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    const g = c.createGain(); g.gain.value = 0.22; n.connect(hp).connect(lp).connect(g).connect(out); n.start();
  } else if (name === 'brown') {
    const n = noise(c, 'brown'); const g = c.createGain(); g.gain.value = 0.9; n.connect(g).connect(out); n.start();
  } else {
    // ocean: brown noise swelling every ~9 s like waves on a beach
    const n = noise(c, 'brown', 6); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    const swell = c.createGain(); swell.gain.value = 0.5;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.11; const depth = c.createGain(); depth.gain.value = 0.45;
    lfo.connect(depth).connect(swell.gain); lfo.start();
    n.connect(lp).connect(swell).connect(out); n.start();
  }
  beds[name] = out;
  return out;
}
/** Fade each bed to its level (0 to 1). Beds are only built once they're first turned up. */
export function setMix(mix: Mix, on: boolean) {
  for (const k of Object.keys(mix) as (keyof Mix)[]) {
    const v = on ? mix[k] : 0;
    if (!beds[k] && v === 0) continue;
    const g = beds[k] ?? build(k);
    const c = ac();
    g.gain.cancelScheduledValues(c.currentTime);
    g.gain.setTargetAtTime(v * v * 0.6, c.currentTime, 0.35);
  }
}
export function suspend() { if (ctx && ctx.state === 'running') void ctx.suspend(); }
export function resume() { if (ctx && ctx.state === 'suspended') void ctx.resume(); }
const NOTE: Record<Kind, number> = { in: 523.25, hold: 659.25, out: 392, rest: 329.63 };
/** A soft two-partial bell: higher as you breathe in, lower as you breathe out. */
export function chime(k: Kind) {
  const c = ac(), t = c.currentTime;
  for (const [mul, vol] of [[1, 0.18], [2.76, 0.04]] as const) {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = NOTE[k] * mul;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g).connect(master!); o.start(t); o.stop(t + 1.9);
  }
}
